# Intégration WarapPay

Référence de l'API : `https://api.warappay.com/api/v1`. Ce document décrit le
contrat de WarapPay **et** ce que fait réellement notre code, y compris là où les
deux divergent.

## Ce que nous utilisons

| Élément | Chez nous |
| --- | --- |
| Client HTTP | [`lib/warappay.ts`](../lib/warappay.ts) |
| Création du paiement | [`app/api/payments/checkout/route.ts`](../app/api/payments/checkout/route.ts) |
| Réception des webhooks | [`app/api/webhooks/warappay/route.ts`](../app/api/webhooks/warappay/route.ts) |
| Vérification de signature | [`lib/webhook.ts`](../lib/webhook.ts) |

Variables d'environnement : `WARAPPAY_API_KEY`, `WARAPPAY_PRODUCT_CODE`,
`WARAPPAY_WEBHOOK_SECRET`.

WarapPay ne sert que le canal **Mobile Money**. Carte et PayPal passent par
TaraMoney ([`lib/taramoney.ts`](../lib/taramoney.ts)) ; nous n'utilisons donc pas
le paramètre `channel: "card"` de WarapPay.

## Authentification

Clé API en `Authorization: Bearer wp_...`, côté serveur uniquement. Une clé est
rattachée à **une boutique**, pas au compte. Si elle fuite, la révoquer depuis la
page Accès API de la boutique.

## Création d'un paiement

`POST /v1/checkout` — champs requis : `product_code`, `email`, `customer_name`.
Optionnels : `customer_phone`, `redirect_url`, `promo_code`, `amount`, `channel`,
`currency`, `meta`.

Nous envoyons `meta.order_id` (l'UUID de notre commande), qui nous revient dans
le webhook et sert de clé de rapprochement. `redirect_url` pointe vers
`/merci?order_id=…`.

La réponse distingue deux montants :

- `amount` — ce que le client paie, frais de service et majoration de zone compris ;
- `base_amount` — ce dont la boutique est créditée.

> **Notre code ne lit ni l'un ni l'autre** : `CheckoutResponse` ne déclare que
> `id`, `status`, `checkout_url`, `download_url` et `meta`. Le montant enregistré
> dans `payments` est celui de notre propre commande, pas celui confirmé par
> WarapPay. Tant que les deux coïncident, c'est sans conséquence ; s'ils
> divergent, nous ne le verrons pas.

### Divergence à traiter : le champ `amount`

Le montant du don est choisi par le soutien, mais **nous ne transmettons jamais
`amount`** à WarapPay. Or la documentation impose :

- produit à **prix libre** (`pricing_type: "variable"`) : `amount` est
  **obligatoire**, sinon l'appel est refusé en `422 AMOUNT_REQUIRED` ;
- produit à **prix fixe** (`pricing_type: "fixed"`) : `amount` est facultatif,
  mais s'il est transmis il doit correspondre au prix actuel, sinon
  `422 PRICE_MISMATCH`.

Autrement dit, selon la configuration du produit désigné par
`WARAPPAY_PRODUCT_CODE`, soit **tous les paiements Mobile Money échouent** en
`AMOUNT_REQUIRED`, soit **le donateur est débité du prix fixe du produit** et non
du montant qu'il a choisi, pendant que notre base enregistre son montant.

Vérifier la configuration réelle du produit avant de conclure :

```bash
curl -s https://api.warappay.com/api/v1/products/$WARAPPAY_PRODUCT_CODE \
  -H "Authorization: Bearer $WARAPPAY_API_KEY"
```

Le correctif attendu : produit à prix libre, et `amount` transmis à chaque
création de paiement, au moins égal à `min_amount`.

## Statuts

`waiting_payment` · `completed` · `failed` · `refunded`.

Nous mappons `completed` → `completed`, `failed` → `failed`, et tout le reste
vers `waiting_payment`. **`refunded` n'est pas traité** : un remboursement
n'émet pas d'événement webhook (seuls `checkout.completed` et `checkout.failed`
existent) et ne serait vu qu'en interrogeant `GET /v1/checkout/{id}`.

## Webhooks

Deux événements : `checkout.completed`, `checkout.failed`.

Notre traitement, dans l'ordre :

1. **Signature** — HMAC-SHA256 du corps **brut** avec `WARAPPAY_WEBHOOK_SECRET`,
   comparé en temps constant à l'en-tête `X-WarapPay-Signature`. Signature
   absente ou invalide → `401`, rien n'est traité.
2. **Idempotence** — insertion dans `webhook_events` avec la clé
   `"<event>:<data.id>"` et `ON CONFLICT DO NOTHING`. Un même événement rejoué
   n'a donc aucun effet, comme le demande la documentation.
3. **Rapprochement** — `meta.order_id` et `data.id` doivent correspondre à une
   commande et à son paiement `provider='warappay'`. Sinon la transaction est
   annulée et la requête échoue volontairement en `5xx`, pour que WarapPay
   **retente** la livraison : c'est le cas du webhook qui arrive avant que notre
   propre enregistrement du paiement soit terminé.
4. **Effets** — mise à jour de `payments` et `orders`, et incrément de
   `campaigns.collected_amount` pour un don fléché vers une cagnotte, avec
   passage en `completed` si l'objectif est atteint. Une commande déjà
   `completed` ou `refunded` n'est jamais redescendue.

## Erreurs

Format commun : `{ "error": { "code", "message" } }`, avec un champ `fields`
supplémentaire pour les `422 VALIDATION_ERROR`.

`lib/warappay.ts` transporte `status`, `message` et `code` dans une
`WarapPayError`. La route de paiement renvoie le message au client et bascule la
commande en `failed` pour toute erreur 4xx — mais **ne distingue aucun code** :
`AMOUNT_TOO_LOW`, `PRODUCT_UNAVAILABLE` ou `PAYMENTS_FROZEN` produisent le même
message brut côté donateur, en anglais tel que renvoyé par l'API.

Codes utiles à traiter spécifiquement : `401 INVALID_API_KEY`,
`403 ACCESS_REVOKED` / `SHOP_INACTIVE` / `PAYMENTS_FROZEN` / `COUNTRY_BLOCKED`,
`404 INVALID_PRODUCT` / `PRODUCT_UNAVAILABLE`, `422 AMOUNT_REQUIRED` /
`AMOUNT_TOO_LOW` / `AMOUNT_TOO_HIGH` / `PRICE_MISMATCH` / `CURRENCY_MISMATCH` /
`CHANNEL_UNAVAILABLE` / `CARD_AMOUNT_TOO_LOW`, `429 RATE_LIMITED`.

## Limites de requêtes

60 requêtes par minute **par clé API**, tous nos appels serveur confondus. Les
en-têtes `X-RateLimit-Limit` et `X-RateLimit-Remaining` accompagnent chaque
réponse. Nous ne les lisons pas et ne traitons pas le `429` : une rafale de dons
simultanés se solderait par des échecs secs, sans attente ni reprise.

## Checklist de production

| Point | État |
| --- | --- |
| Clé API côté serveur uniquement | ✅ lue depuis `process.env`, jamais exposée au navigateur |
| `redirect_url` gère succès et échec | ✅ `/merci` s'appuie sur le statut de la commande |
| Webhook : signature vérifiée avant traitement | ✅ |
| Webhook : traitement idempotent | ✅ via `webhook_events` |
| Webhook : réponse rapide | ⚠️ la réponse attend la transaction en base |
| Codes 401 / 403 / 404 / 422 gérés distinctement | ❌ message générique, aucun code distingué |
| `amount` transmis pour un produit à prix libre | ❌ voir la divergence ci-dessus |
| `429` géré avec attente | ❌ |
