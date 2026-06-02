-- Core identity table for brand login/signup and creator OTP auth.
-- Brand: email + password_hash. Creator: phone (password usually null).

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password_hash" TEXT,
    "display_name" TEXT,
    "username" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'not_started',
    "terms_accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_phone_key" ON "users" ("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username");

COMMENT ON TABLE "users" IS 'All accounts; role distinguishes brand vs creator vs admin';
COMMENT ON COLUMN "users"."terms_accepted_at" IS 'Set on brand signup when acceptTerms=true';
