BEGIN;
ALTER TABLE auth_email_tokens DROP CONSTRAINT IF EXISTS auth_email_tokens_purpose_check;
ALTER TABLE auth_email_tokens ADD CONSTRAINT auth_email_tokens_purpose_check CHECK (purpose IN ('register','verify','reset'));
COMMIT;
