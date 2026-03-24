-- === PLANS TABLE: RLS POLICIES ===
-- The plans table was created via Prisma. This migration adds RLS and indexes.

-- Create table if it doesn't exist (safety net)
CREATE TABLE IF NOT EXISTS "plans" (
  "id"               TEXT NOT NULL,
  "psychologist_id"  TEXT NOT NULL,
  "name"             TEXT NOT NULL,
  "sessions"         INTEGER NOT NULL,
  "price"            DECIMAL(10, 2) NOT NULL,
  "discount"         INTEGER NOT NULL DEFAULT 0,
  "active"           BOOLEAN NOT NULL DEFAULT true,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "plans_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "plans_psychologist_id_fkey"
    FOREIGN KEY ("psychologist_id")
    REFERENCES "psychologist_profiles"("id")
    ON DELETE CASCADE
);

-- Index for fast lookups by psychologist
CREATE INDEX IF NOT EXISTS idx_plans_psychologist_id ON "plans"("psychologist_id");

-- Enable Row Level Security
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (idempotent)
DROP POLICY IF EXISTS "plans_manage_own" ON "plans";
DROP POLICY IF EXISTS "plans_read_active" ON "plans";

-- Psychologists can manage their own plans
CREATE POLICY "plans_manage_own" ON "plans"
  FOR ALL
  USING (
    psychologist_id::text IN (
      SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text
    )
  );

-- Anyone authenticated can read active plans
CREATE POLICY "plans_read_active" ON "plans"
  FOR SELECT
  USING (active = true);
