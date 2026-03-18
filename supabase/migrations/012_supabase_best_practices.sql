
-- === 012 SUPABASE BEST PRACTICES MIGRATION ===
-- Based on Supabase Performance and Security Advisors

-- 1. [0014] Move/Ensure Extensions Schema
-- Moving extensions to a dedicated schema is a best practice to avoid exposing extension functions via the public API.
CREATE SCHEMA IF NOT EXISTS extensions;

-- 2. [0011] Secure Function Search Path
-- Security definer functions should have an explicit search_path to prevent search_path hijacking.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, extensions
AS $$
BEGIN
  -- We attempt to insert into profiles. If it exists, we skip.
  -- This ensures reliability during signup flows.
  INSERT INTO public.profiles (id, user_id, full_name, role)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. [0023] Sensitive Columns Exposure (profiles table)
-- The 'profiles' table contains sensitive information (phone, document, birth_date).
-- We previously had a policy allowing 'SELECT USING (true)'.
-- We are now restricting this to:
--  a) Psychologists (always visible for marketplace)
--  b) Self-access (full access to own data)
--  c) Linked psychologists (can see their patients' profiles)

DROP POLICY IF EXISTS "profiles_read_all" ON "profiles";

-- Everyone can read Psychologist profiles (needed for the search/marketplace)
CREATE POLICY "profiles_read_psychologists" 
ON "profiles" 
FOR SELECT 
USING (role = 'PSYCHOLOGIST');

-- Users can read their own full profile
CREATE POLICY "profiles_read_own" 
ON "profiles" 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Psychologists can read profiles of their patients
CREATE POLICY "profiles_read_linked_patients" 
ON "profiles" 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM appointments 
        WHERE (patient_id = profiles.id OR patient_id = profiles.user_id)
        AND psychologist_id IN (SELECT id FROM psychologist_profiles WHERE "userId" = auth.uid())
    )
);

-- 4. [0001] Missing Indexes on Foreign Keys & Common Filters
-- Indexing foreign keys is crucial for join performance and to avoid sequential scans.
-- Indexing common filter columns (role, is_verified) speeds up marketplace queries.

CREATE INDEX IF NOT EXISTS idx_profiles_role ON "profiles"(role);
CREATE INDEX IF NOT EXISTS idx_psychologist_profiles_verified ON "psychologist_profiles"(is_verified);
CREATE INDEX IF NOT EXISTS idx_users_email ON "users"(email);

-- 5. [0003] RLS Performance: auth.uid() usage
-- Using auth.uid() directly is generally efficient. 
-- We ensure that tables used in subqueries (like psychologist_profiles and appointments) have proper indexes.
-- (Already handled by PKs and previous indexes).

-- 6. [0013] RLS Enabled on Internal Tables
-- Prisma internal table should also have RLS enabled even if not exposed.
ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "verification_tokens" ENABLE ROW LEVEL SECURITY;

-- 7. [0015] RLS References User Metadata
-- We confirm that all policies use auth.uid() rather than vulnerable auth.jwt() claims where possible.
-- The policies in 011 and 012 follow this best practice.

-- Success message
DO $$ BEGIN RAISE NOTICE 'Supabase Best Practices Migration (012) Applied'; END $$;
