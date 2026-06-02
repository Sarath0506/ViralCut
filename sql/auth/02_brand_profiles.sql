-- Brand signup: one row per brand user (company name from register form).

CREATE TABLE IF NOT EXISTS "brand_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "brand_profiles_user_id_key" ON "brand_profiles" ("user_id");

DO $$ BEGIN
  ALTER TABLE "brand_profiles"
    ADD CONSTRAINT "brand_profiles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users" ("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE "brand_profiles" IS 'Brand portal signup stores company_name; display_name on users';
