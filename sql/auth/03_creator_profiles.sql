-- Creator app: created on first successful phone OTP verify (not email/password).

CREATE TABLE IF NOT EXISTS "creator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_user_id_key" ON "creator_profiles" ("user_id");

DO $$ BEGIN
  ALTER TABLE "creator_profiles"
    ADD CONSTRAINT "creator_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE "creator_profiles" IS 'Creator identity; auth via otp_sessions + phone on users';
