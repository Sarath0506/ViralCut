-- Incremental patch if users table already existed without terms column.
-- Same as: prisma/migrations/20260601120000_user_terms_accepted_at/migration.sql

ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3);

COMMENT ON COLUMN "users"."terms_accepted_at" IS 'Brand signup terms acceptance timestamp';
