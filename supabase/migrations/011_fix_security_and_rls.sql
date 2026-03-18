
-- === COMPREHENSIVE SECURITY FIX MIGRATION ===
-- This script fixes RLS issues, implements secure policies, and adds missing indexes.

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE IF EXISTS "anamnesis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "company_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "company_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "diary_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "evolutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "patient_psychologist_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "psychologist_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "schedule_overrides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING PERMISSIVE POLICIES (Sanitization)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. IMPLEMENT NEW SECURE POLICIES

-- === PROFILES ===
-- Everyone can read profiles (to see names/avatars), but only owners can edit
CREATE POLICY "profiles_read_all" ON "profiles" FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON "profiles" FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON "profiles" FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- === PSYCHOLOGIST PROFILES ===
-- Everyone can see (for the marketplace), but only owner can edit
CREATE POLICY "psych_profiles_read_all" ON "psychologist_profiles" FOR SELECT USING (true);
CREATE POLICY "psych_profiles_update_own" ON "psychologist_profiles" FOR UPDATE TO authenticated USING (auth.uid() = "userId");
CREATE POLICY "psych_profiles_insert_own" ON "psychologist_profiles" FOR INSERT TO authenticated WITH CHECK (auth.uid() = "userId");

-- === APPOINTMENTS ===
-- Only participating patient OR psychologist can see/edit
CREATE POLICY "appointments_participating_access" ON "appointments" 
    FOR ALL TO authenticated 
    USING (
        auth.uid() = patient_id OR 
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- === ANAMNESIS ===
-- Extremely sensitive. Only the psychologist assigned to the patient (or the psychologist who created it) can see/edit.
CREATE POLICY "anamnesis_psychologist_access" ON "anamnesis" 
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- === EVOLUTIONS ===
-- Only the psychologist can manage; patient can potentially read the public summary if intended? 
-- For now, restricting to participant psychologist.
CREATE POLICY "evolutions_psychologist_access" ON "evolutions" 
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- === DIARY ENTRIES ===
-- Only the owner can see/edit their own diary
CREATE POLICY "diary_entries_own_access" ON "diary_entries" 
    FOR ALL TO authenticated 
    USING (auth.uid() = user_id);

-- === CONVERSATIONS & MESSAGES ===
-- Participants only
CREATE POLICY "conversations_participant_access" ON "conversations" 
    FOR SELECT TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM "conversation_participants" WHERE conversation_id = "conversations".id AND user_id = auth.uid())
    );

CREATE POLICY "messages_participant_access" ON "messages" 
    FOR ALL TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM "conversation_participants" WHERE conversation_id = "messages".conversation_id AND user_id = auth.uid())
    );

CREATE POLICY "participants_involved_access" ON "conversation_participants" 
    FOR ALL TO authenticated 
    USING (user_id = auth.uid());

-- === COUPONS ===
-- Psychologists can manage their own; Everyone can see for validation? 
-- Restricting management to owner.
CREATE POLICY "coupons_read_all" ON "coupons" FOR SELECT USING (true);
CREATE POLICY "coupons_manage_own" ON "coupons" 
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- === SCHEDULE OVERRIDES ===
CREATE POLICY "schedule_overrides_read_all" ON "schedule_overrides" FOR SELECT USING (true);
CREATE POLICY "schedule_overrides_manage_own" ON "schedule_overrides" 
    FOR ALL TO authenticated 
    USING (
        auth.uid() IN (SELECT "userId" FROM "psychologist_profiles" WHERE id = psychologist_id)
    );

-- === PATIENT PSYCHOLOGIST LINKS ===
CREATE POLICY "links_participant_access" ON "patient_psychologist_links" 
    FOR SELECT TO authenticated 
    USING (
        patient_id IN (SELECT id FROM "profiles" WHERE user_id = auth.uid()) OR 
        psychologist_id IN (SELECT id FROM "profiles" WHERE user_id = auth.uid())
    );

-- === USERS (Public table) ===
-- Self access only
CREATE POLICY "users_own_access" ON "users" 
    FOR ALL TO authenticated 
    USING (auth.uid() = id);

-- 4. PERFORMANCE FIX: ADD MISSING INDEXES ON FOREIGN KEYS
-- Addressing "Unindexed foreign keys" warning.

CREATE INDEX IF NOT EXISTS idx_anamnesis_patient_id ON "anamnesis"(patient_id);
CREATE INDEX IF NOT EXISTS idx_anamnesis_psychologist_id ON "anamnesis"(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON "appointments"(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist_id ON "appointments"(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON "company_members"(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_profile_id ON "company_members"(profile_id);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON "conversation_participants"(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON "conversation_participants"(user_id);

CREATE INDEX IF NOT EXISTS idx_coupons_psychologist_id ON "coupons"(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_evolutions_patient_id ON "evolutions"(patient_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_psychologist_id ON "evolutions"(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON "messages"(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON "messages"(sender_id);

CREATE INDEX IF NOT EXISTS idx_patient_psych_links_patient_id ON "patient_psychologist_links"(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_psych_links_psych_id ON "patient_psychologist_links"(psychologist_id);

CREATE INDEX IF NOT EXISTS idx_schedule_overrides_psych_id ON "schedule_overrides"(psychologist_id);

-- Success message
DO $$ BEGIN RAISE NOTICE 'Security and Performance Migration Applied Successfully'; END $$;
