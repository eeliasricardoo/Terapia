-- Enable RLS on all tables
ALTER TABLE IF EXISTS "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "verification_tokens" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "schedule_overrides" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "psychologist_profiles" ENABLE ROW LEVEL SECURITY;

-- Drop permissive policies if they exist (cleanup)
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "profiles";
DROP POLICY IF EXISTS "Enable read access for all" ON "profiles";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Enable read access for all" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "schedule_overrides";
DROP POLICY IF EXISTS "Enable read access for all" ON "schedule_overrides";
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "appointments";

-- Clean up existing ones to be re-created underneath
DROP POLICY IF EXISTS "Users can insert own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can delete own profile" ON "profiles";
DROP POLICY IF EXISTS "Enable read access for all psychologists" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Users can insert own psych profile" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Users can update own psych profile" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Users can delete own psych profile" ON "psychologist_profiles";
DROP POLICY IF EXISTS "Users can view own appointments" ON "appointments";
DROP POLICY IF EXISTS "Users can insert own appointments" ON "appointments";
DROP POLICY IF EXISTS "Users can update own appointments" ON "appointments";
DROP POLICY IF EXISTS "Users can delete own appointments" ON "appointments";
DROP POLICY IF EXISTS "Enable read access for all schedule" ON "schedule_overrides";
DROP POLICY IF EXISTS "Psychologist can insert schedule overrides" ON "schedule_overrides";
DROP POLICY IF EXISTS "Psychologist can update schedule overrides" ON "schedule_overrides";
DROP POLICY IF EXISTS "Psychologist can delete schedule overrides" ON "schedule_overrides";


-- === PROFILES ===
CREATE POLICY "Enable read access for all" ON "profiles" FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON "profiles" FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can update own profile" ON "profiles" FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);
CREATE POLICY "Users can delete own profile" ON "profiles" FOR DELETE TO authenticated USING (user_id::text = auth.uid()::text);

-- === PSYCHOLOGIST PROFILES ===
CREATE POLICY "Enable read access for all psychologists" ON "psychologist_profiles" FOR SELECT USING (true);
CREATE POLICY "Users can insert own psych profile" ON "psychologist_profiles" FOR INSERT TO authenticated WITH CHECK ("userId"::text = auth.uid()::text);
CREATE POLICY "Users can update own psych profile" ON "psychologist_profiles" FOR UPDATE TO authenticated USING ("userId"::text = auth.uid()::text) WITH CHECK ("userId"::text = auth.uid()::text);
CREATE POLICY "Users can delete own psych profile" ON "psychologist_profiles" FOR DELETE TO authenticated USING ("userId"::text = auth.uid()::text);

-- === APPOINTMENTS ===
CREATE POLICY "Users can view own appointments" ON "appointments" FOR SELECT TO authenticated USING (
    patient_id::text = auth.uid()::text OR 
    psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can insert own appointments" ON "appointments" FOR INSERT TO authenticated WITH CHECK (
    patient_id::text = auth.uid()::text OR 
    psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can update own appointments" ON "appointments" FOR UPDATE TO authenticated USING (
    patient_id::text = auth.uid()::text OR 
    psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
) WITH CHECK (
    patient_id::text = auth.uid()::text OR 
    psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
);
CREATE POLICY "Users can delete own appointments" ON "appointments" FOR DELETE TO authenticated USING (
    patient_id::text = auth.uid()::text OR 
    psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
);

-- === SCHEDULE OVERRIDES ===
CREATE POLICY "Enable read access for all schedule" ON "schedule_overrides" FOR SELECT USING (true);
CREATE POLICY "Psychologist can insert schedule overrides" ON "schedule_overrides" FOR INSERT TO authenticated 
WITH CHECK (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));

CREATE POLICY "Psychologist can update schedule overrides" ON "schedule_overrides" FOR UPDATE TO authenticated 
USING (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text))
WITH CHECK (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));

CREATE POLICY "Psychologist can delete schedule overrides" ON "schedule_overrides" FOR DELETE TO authenticated 
USING (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));
