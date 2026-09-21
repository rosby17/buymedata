# Sauvegarde de la base buymedata vers B2

Constat du 21 septembre 2026 : `/root/backup-to-b2.sh` sur `rooseveltvps` sauvegarde
Izivoice, KappGen, Nextcloud et Coolify, mais **pas buymedata**. La base
`supabase-db-sachzkhodd7fmjmmxualj0hq` (tables `profiles`, `orders`, `payments`,
`withdrawals`, `campaigns`, `auth_credentials`, …) n'a jamais été sauvegardée.

Les avatars et bannières étant stockés dans la base (encodés en base64 dans les
colonnes) et non sur un volume disque, le dump de la base suffit à tout restaurer.

## Patch à appliquer au script

### 1. Déclarer la base, près des autres variables en tête de script

```sh
BUYMEDATA_DB=supabase-db-sachzkhodd7fmjmmxualj0hq
```

### 2. Ajouter le dump, après celui de Nextcloud

```sh
echo "[3bis/5] Dump base de données buymedata..."
docker exec "$BUYMEDATA_DB" pg_dump -U postgres -Fc postgres > "$WORKDIR/buymedata_db_$DATE.dump"
```

### 3. Envoyer vers son propre bucket, avec les autres appels `run_rclone`

```sh
run_rclone -v "$WORKDIR:/data:ro" $RCLONE_ENV \
  rclone/rclone copy /data "B2:buymedata/daily/$DATE" -v \
  --include "buymedata_db_*"
```

### 4. Appliquer la même rétention de 7 jours

```sh
run_rclone $RCLONE_ENV \
  rclone/rclone delete "B2:buymedata/daily" --min-age 7d --rmdirs || true
```

Le bucket `buymedata` doit exister côté B2 et la clé utilisée par
`/root/.b2_backup_env` doit y avoir accès en écriture.

## Sauvegarde immédiate, sans attendre le cron

```sh
docker exec supabase-db-sachzkhodd7fmjmmxualj0hq pg_dump -U postgres -Fc postgres \
  > /root/backups/buymedata_$(date +%F).dump
```

## Test de restauration, à faire avant la migration

Une sauvegarde jamais restaurée n'est pas une sauvegarde. Sur une base jetable :

```sh
docker exec -i supabase-db-sachzkhodd7fmjmmxualj0hq psql -U postgres -c 'CREATE DATABASE restore_test'
docker exec -i supabase-db-sachzkhodd7fmjmmxualj0hq pg_restore -U postgres -d restore_test < buymedata_AAAA-MM-JJ.dump
docker exec supabase-db-sachzkhodd7fmjmmxualj0hq psql -U postgres -d restore_test -c '\dt'
docker exec supabase-db-sachzkhodd7fmjmmxualj0hq psql -U postgres -c 'DROP DATABASE restore_test'
```

Vérifier que les dix tables sont présentes et que `profiles` contient bien les comptes.

## Ce qui est déjà couvert pour la migration

- **Code** : dépôt GitHub `rosby17/buymedata`.
- **Configuration** (variables d'environnement, domaine, labels Traefik) : stockée
  dans la base Coolify, sauvegardée dans `B2:infra-coolify`.
- **Schéma** : `db/schema.sql`, idempotent, rejouable sur une base neuve.
