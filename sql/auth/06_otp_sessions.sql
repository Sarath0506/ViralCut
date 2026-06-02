-- Creator phone OTP (WhatsApp/SMS). Not used by brand email/password auth.

CREATE TABLE IF NOT EXISTS "otp_sessions" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "otp_sessions_phone_expires_at_idx" ON "otp_sessions" ("phone", "expires_at");

COMMENT ON TABLE "otp_sessions" IS 'Short-lived OTP codes for creator login; code stored as hash';
