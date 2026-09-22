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

`CheckoutResponse` déclare les deux, mais le montant enregistré dans `payments`
reste celui de notre propre commande — c'est-à-dire `base_amount`, ce qui revient
au créateur. Les frais payés en plus par le donateur ne sont pas conservés.

### Le champ `amount`

Le produit désigné par `WARAPPAY_PRODUCT_CODE` est à **prix libre**
(`pricing_type: "variable"`), donc `amount` est **obligatoire** : sans lui,
WarapPay refuse l'appel en `422 AMOUNT_REQUIRED`.

Nous transmettons désormais le montant choisi par le soutien, et nous lisons la
fiche produit (`GET /v1/products/{code}`, en cache cinq minutes) avant de créer
la commande, pour deux raisons :

- refuser localement un montant inférieur à `min_amount`, avec un message chiffré
  dans la devise de la boutique, plutôt que de laisser WarapPay refuser après
  qu'une commande a déjà été créée ;
- détecter un produit désactivé (`available: false`) avant d'engager le donateur.

Le minimum affiché au donateur est donc celui du produit, qui prime sur notre
propre plancher de 100 FCFA.

Fiche du produit en production, au 22 septembre 2026 :

```json
{ "code": "prd-ITPL-8131", "pricing_type": "variable", "price": 200,
  "min_amount": 200, "currency": "XAF", "available": true }
```

Deux conséquences :

- le vrai plancher est **200**, pas 100 ; les dons de 100 à 199 sont désormais
  refusés avec un message clair avant toute création de commande ;
- la boutique est en **XAF**, alors que nos tables `orders`, `payments` et
  `withdrawals` ont `currency` par défaut à **`XOF`**. Les deux valent un FCFA et
  partagent la même parité avec l'euro, donc aucun montant n'est faux — mais le
  code devise que nous stockons ne correspond pas à celui de la boutique. Ne
  jamais transmettre `currency: "XOF"` à WarapPay : l'appel serait refusé en
  `422 CURRENCY_MISMATCH`. Nous ne l'envoyons pas.

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
`WarapPayError`, et `donorMessage()` traduit le code en une phrase destinée au
donateur : montant trop bas, plafond dépassé, pays suspendu, indisponibilité
temporaire. Le message brut de l'API, en anglais, n'est plus affiché. La commande
bascule en `failed` pour toute erreur 4xx.

Codes traités : `401 INVALID_API_KEY`,
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
| Codes 401 / 403 / 404 / 422 gérés distinctement | ✅ via `donorMessage()` |
| `amount` transmis pour un produit à prix libre | ✅ avec contrôle préalable de `min_amount` |
| `429` géré avec attente | ❌ |
