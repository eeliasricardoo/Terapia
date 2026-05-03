
-- === 013 FORCE SECURITY AUDIT & RLS FIX ===
-- This migration resolves the critical errors reported by the Supabase Linter (0013 and 0023).

-- 1. FORCE ENABLE RLS ON ALL TABLES IN THE PUBLIC SCHEMA (Error 0013 resolution)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
        RAISE NOTICE 'RLS enabled for table: %', r.tablename;
    END LOOP;
END $$;

-- 2. SENSITIVE COLUMNS PROTECTION (Error 0023 resolution)
-- The 'password' column in 'public.users' is a critical risk.
-- We ensure that the row access is strictly limited to the owner.

DROP POLICY IF EXISTS "users_own_access" ON "users";
CREATE POLICY "users_own_access" ON "users" 
    FOR ALL TO authenticated 
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

-- BEST PRACTICE: Block 'password' column reading via API for everyone.
-- This ensures that even authenticated users cannot select their own password via PostgREST.
REVOKE SELECT (password) ON public.users FROM public, anon, authenticated;

-- 3. REINFORCE PII (patient_id) PROTECTION
-- The linter warned about anamnesis, appointments, evolutions, and links for containing patient_id without active RLS.
-- By enabling RLS in step 1, we now ensure that professional/personal access policies are strictly enforced.

ALTER TABLE public.anamnesis FORCE ROW LEVEL SECURITY;
ALTER TABLE public.evolutions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patient_psychologist_links FORCE ROW LEVEL SECURITY;

-- 4. REINFORCE EXTENSIONS ISOLATION (Advisor 0014)
CREATE SCHEMA IF NOT EXISTS extensions;
-- Move uuid-ossp to the protected schema if it exists in public
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    BEGIN
      ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not move uuid-ossp extension (it might already be in another schema or managed by the platform).';
    END;
  END IF;
END $$;

-- Success log
DO $$ BEGIN RAISE NOTICE 'Security Audit Fix Migration (013) Completed Successfully'; END $$;
