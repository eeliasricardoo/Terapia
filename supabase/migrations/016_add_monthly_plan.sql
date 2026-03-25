-- Add monthly plan configuration fields to psychologist_profiles
ALTER TABLE psychologist_profiles
  ADD COLUMN IF NOT EXISTS monthly_plan_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS monthly_plan_sessions INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS monthly_plan_discount INTEGER NOT NULL DEFAULT 20;
