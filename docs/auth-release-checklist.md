# Authentication and payment release gate

Do not deploy the authentication changes without these prerequisites.

1. Back up PostgreSQL, then apply db/migrations/20260920_auth.sql before deploying code. Fresh installations use db/schema.sql. The migration does not verify historical addresses automatically.
2. Configure AUTH_SECRET (random, at least 32 characters), DATABASE_URL, NEXT_PUBLIC_SITE_URL (canonical HTTPS URL), SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM. Validate delivery, SPF/DKIM and spam placement with the real sender. Registration stays unavailable without SMTP.
3. Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, exact callback /api/auth/google, verified domain, homepage, /privacy and /terms in Google Cloud. Test using two separate Google accounts. Signup on an existing address must not log in automatically. Login never attaches a Google identity to a password account merely by email. Existing Google-only profiles can be migrated after fresh verified Google proof.
4. This release invalidates old session cookies. Existing password users must verify their email on next login. Announce this and test delivery BEFORE deployment to avoid locking out users.
5. Test registration, username collision, wrong passwords, mail confirmation, expired/reused links, concurrent confirmation, canceled Google consent, invalid state, account selection, logout, guest contributions. Tests under tests/auth-security.test.mjs cover pure security primitives, not live providers or database concurrency.
6. Validate legal texts with the operator: legal identity, actual processors, retention periods and applicable jurisdiction still require review. These pages are not a certification of Google approval or legal compliance.
7. Test payment sandbox callbacks before release: pending, failed, completed, duplicates, late failure after completion, wrong provider/reference, callback before checkout persistence, amount mismatch. Completed/refunded orders must never regress from a late failure. Only trusted confirmation credits funds. Do not reclassify historical orders without provider reconciliation.
8. WarapPay checkout currently uses a configured product_code; verify with the provider that charged amount/currency match the requested contribution. A complete provider reconciliation and live SMTP/Google/payment integration test have NOT been performed locally.

Local checks: npx tsc --noEmit; npm run lint; node --experimental-strip-types --test tests/auth-security.test.mjs; npm run build.
