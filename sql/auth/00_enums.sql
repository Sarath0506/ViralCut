-- ViralCut auth schema reference (PostgreSQL)
-- Enums used by users and related auth tables.
-- Safe to re-run only on empty DB; use IF NOT EXISTS patterns below.

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('creator', 'brand', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "KycStatus" AS ENUM ('not_started', 'pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
