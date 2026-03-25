-- === 017 SECURE APPOINTMENTS RLS ===
-- This migration tightens the Row Level Security on the `appointments` table
-- preventing patients from performing unauthorized updates via the REST API.

-- 1. Drop the overly permissive policy
-- The old policy 'appointments_participating_access' allowed FOR ALL, meaning
-- patients could arbitrarily update their appointments columns (like price or duration).
DROP POLICY IF EXISTS "appointments_participating_access" ON "appointments";

-- 2. Create the explicit SELECT policy (Read access)
-- Both patient and psychologist involved can read the session data.
CREATE POLICY "appointments_read_access" ON "appointments" 
    FOR SELECT TO authenticated 
    USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- 3. Create the explicit UPDATE policy
-- Only the psychologist involved can update the session directly via REST API (which is what ScheduleManager.tsx uses).
-- The patient side will now perform updates exclusively via Server Actions (Next.js server with Prisma, bypassing RLS securely).
CREATE POLICY "appointments_update_psych" ON "appointments" 
    FOR UPDATE TO authenticated 
    USING (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    )
    WITH CHECK (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- 4. Revoke UPDATE access to sensitive financial columns
-- Even psychologists shouldn't modify the price or the patient tied to a session via the REST API.
REVOKE UPDATE (price, duration_minutes, patient_id, psychologist_id) ON public.appointments FROM authenticated;

-- Ensure RLS is still strictly enforced
ALTER TABLE public.appointments FORCE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE 'Migration 017 applied: Appointments RLS Secured.'; END $$;
