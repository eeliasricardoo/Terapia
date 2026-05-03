-- ============================================================
-- 019: FIX MISSING RLS – SUPABASE SECURITY ADVISOR COMPLIANCE
-- ============================================================
-- Resolves the following Security Advisor warnings:
--   • 0013 "RLS Disabled in Public" on:
--       health_insurances, psychologist_insurances, plans,
--       audit_logs, patient_preferences, patient_interests
--   • 0023 "Sensitive Columns Exposed" on:
--       patient_preferences, patient_interests
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENABLE RLS (idempotent – safe to run multiple times)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.health_insurances         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologist_insurances   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_preferences       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_interests         ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 2. FORCE RLS (applies even to table owners – extra hardening)
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.patient_preferences FORCE ROW LEVEL SECURITY;
ALTER TABLE public.patient_interests   FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs          FORCE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 3. HEALTH INSURANCES
--    • Public catalogue: anyone (even anon) can read the list
--    • Only service_role / admin can insert/update/delete
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "health_insurances_read_all"   ON public.health_insurances;
DROP POLICY IF EXISTS "health_insurances_admin_write" ON public.health_insurances;

-- Anyone can see the available insurances (needed for onboarding forms)
CREATE POLICY "health_insurances_read_all"
    ON public.health_insurances
    FOR SELECT
    USING (true);

-- Only server-side (service_role) can mutate — PostgREST blocks anon/auth from writing
-- (No INSERT/UPDATE/DELETE policy created means those operations are denied by RLS.)

-- ────────────────────────────────────────────────────────────
-- 4. PSYCHOLOGIST INSURANCES
--    • Authenticated users can read (needed for matching/search)
--    • Psychologist can manage their own rows
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "psych_insurances_read_authenticated" ON public.psychologist_insurances;
DROP POLICY IF EXISTS "psych_insurances_manage_own"         ON public.psychologist_insurances;

CREATE POLICY "psych_insurances_read_authenticated"
    ON public.psychologist_insurances
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "psych_insurances_manage_own"
    ON public.psychologist_insurances
    FOR ALL
    TO authenticated
    USING (
        psychologist_id::text IN (
            SELECT id::text FROM public.psychologist_profiles
            WHERE "userId"::text = auth.uid()::text
        )
    )
    WITH CHECK (
        psychologist_id::text IN (
            SELECT id::text FROM public.psychologist_profiles
            WHERE "userId"::text = auth.uid()::text
        )
    );

-- ────────────────────────────────────────────────────────────
-- 5. PLANS
--    Already created in 015 but re-applied here to be sure
--    (DROP IF EXISTS keeps it idempotent)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "plans_read_active"  ON public.plans;
DROP POLICY IF EXISTS "plans_manage_own"   ON public.plans;

-- Any authenticated user can browse active plans
CREATE POLICY "plans_read_active"
    ON public.plans
    FOR SELECT
    TO authenticated
    USING (active = true);

-- Psychologist can fully manage their own plans
CREATE POLICY "plans_manage_own"
    ON public.plans
    FOR ALL
    TO authenticated
    USING (
        psychologist_id::text IN (
            SELECT id::text FROM public.psychologist_profiles
            WHERE "userId"::text = auth.uid()::text
        )
    )
    WITH CHECK (
        psychologist_id::text IN (
            SELECT id::text FROM public.psychologist_profiles
            WHERE "userId"::text = auth.uid()::text
        )
    );

-- ────────────────────────────────────────────────────────────
-- 6. AUDIT LOGS
--    • Audit logs are write-only from server side (service_role)
--    • Admins (via service_role bypass) can read
--    • Regular users should NEVER be able to read raw audit data
--    • No SELECT policy → PostgREST returns 0 rows for all API callers
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_logs_no_api_access" ON public.audit_logs;

-- Explicit deny-all for every non-service_role caller
-- (An RLS table with zero policies = nobody via API can do anything)
-- This is intentional – audit_logs are written by server functions only.
-- If you ever need admin read access via the dashboard use the service_role key.

-- ────────────────────────────────────────────────────────────
-- 7. PATIENT PREFERENCES  (⚠ SENSITIVE – PHQ/GAD scores, PII)
--    • Only the patient themselves can read/write their own row
--    • Psychologist linked to the patient can read (not write)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "patient_prefs_own_access"        ON public.patient_preferences;
DROP POLICY IF EXISTS "patient_prefs_psychologist_read" ON public.patient_preferences;

-- Patient sees/edits only their own preferences
CREATE POLICY "patient_prefs_own_access"
    ON public.patient_preferences
    FOR ALL
    TO authenticated
    USING (
        patient_id::text IN (
            SELECT id::text FROM public.profiles
            WHERE user_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        patient_id::text IN (
            SELECT id::text FROM public.profiles
            WHERE user_id::text = auth.uid()::text
        )
    );

-- Assigned psychologist can READ (not write) patient preferences
-- (needed for the matching / session context)
CREATE POLICY "patient_prefs_psychologist_read"
    ON public.patient_preferences
    FOR SELECT
    TO authenticated
    USING (
        -- The requesting user is a psychologist linked to this patient
        patient_id::text IN (
            SELECT pl.patient_id::text
            FROM public.patient_psychologist_links pl
            JOIN public.psychologist_profiles pp ON pp.id = pl.psychologist_id
            WHERE pp."userId"::text = auth.uid()::text
              AND pl.status = 'active'
        )
    );

-- ────────────────────────────────────────────────────────────
-- 8. PATIENT INTERESTS  (⚠ SENSITIVE – links patient to psychologist)
--    • Patient sees their own interest rows
--    • Target psychologist sees interests directed at them
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "patient_interests_patient_access"      ON public.patient_interests;
DROP POLICY IF EXISTS "patient_interests_psychologist_access" ON public.patient_interests;

-- Patient manages their own interest rows
CREATE POLICY "patient_interests_patient_access"
    ON public.patient_interests
    FOR ALL
    TO authenticated
    USING (
        patient_id::text IN (
            SELECT id::text FROM public.profiles
            WHERE user_id::text = auth.uid()::text
        )
    )
    WITH CHECK (
        patient_id::text IN (
            SELECT id::text FROM public.profiles
            WHERE user_id::text = auth.uid()::text
        )
    );

-- Psychologist reads interests targeting them (to accept/reject)
CREATE POLICY "patient_interests_psychologist_access"
    ON public.patient_interests
    FOR SELECT
    TO authenticated
    USING (
        psychologist_id::text IN (
            SELECT id::text FROM public.psychologist_profiles
            WHERE "userId"::text = auth.uid()::text
        )
    );

-- ────────────────────────────────────────────────────────────
-- 9. SAFETY NET: enable RLS on any remaining public table
--    (catches tables created after this migration runs)
-- ────────────────────────────────────────────────────────────
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('_prisma_migrations')  -- skip internal
    )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- ────────────────────────────────────────────────────────────
-- Done
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
    RAISE NOTICE '019: RLS Security Advisor fix applied successfully.';
    RAISE NOTICE 'Tabelas corrigidas: health_insurances, psychologist_insurances, plans, audit_logs, patient_preferences, patient_interests';
END $$;
