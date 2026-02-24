const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const sqlCommands = [
        // Drop the too permissive policies I added earlier
        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "profiles";`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "profiles";`,

        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "psychologist_profiles";`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "psychologist_profiles";`,

        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "schedule_overrides";`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "schedule_overrides";`,

        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "appointments";`,

        // === PROFILES ===
        // 1. Anyone can read profiles
        `CREATE POLICY "Enable read access for all" ON "profiles" FOR SELECT USING (true);`,
        // 2. Users can insert their own profile
        `CREATE POLICY "Users can insert own profile" ON "profiles" FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);`,
        // 3. Users can update their own profile
        `CREATE POLICY "Users can update own profile" ON "profiles" FOR UPDATE TO authenticated USING (user_id::text = auth.uid()::text) WITH CHECK (user_id::text = auth.uid()::text);`,
        // 4. Users can delete their own profile
        `CREATE POLICY "Users can delete own profile" ON "profiles" FOR DELETE TO authenticated USING (user_id::text = auth.uid()::text);`,

        // === PSYCHOLOGIST PROFILES ===
        // 1. Anyone can read psychologist profiles
        `CREATE POLICY "Enable read access for all psychologists" ON "psychologist_profiles" FOR SELECT USING (true);`,
        // 2. Users can insert their own
        `CREATE POLICY "Users can insert own psych profile" ON "psychologist_profiles" FOR INSERT TO authenticated WITH CHECK ("userId"::text = auth.uid()::text);`,
        // 3. Users can update their own
        `CREATE POLICY "Users can update own psych profile" ON "psychologist_profiles" FOR UPDATE TO authenticated USING ("userId"::text = auth.uid()::text) WITH CHECK ("userId"::text = auth.uid()::text);`,
        // 4. Users can delete their own
        `CREATE POLICY "Users can delete own psych profile" ON "psychologist_profiles" FOR DELETE TO authenticated USING ("userId"::text = auth.uid()::text);`,

        // === APPOINTMENTS ===
        // Policy for appointments to only be accessible by patient or the specific psychologist
        // We use subquery for psychologist match.
        // Need to cast appropriately depending on UUID/text. Let's cast all to text.
        `CREATE POLICY "Users can view own appointments" ON "appointments" FOR SELECT TO authenticated USING (
      patient_id::text = auth.uid()::text OR 
      psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
    );`,
        `CREATE POLICY "Users can insert own appointments" ON "appointments" FOR INSERT TO authenticated WITH CHECK (
      patient_id::text = auth.uid()::text OR 
      psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
    );`,
        `CREATE POLICY "Users can update own appointments" ON "appointments" FOR UPDATE TO authenticated USING (
      patient_id::text = auth.uid()::text OR 
      psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
    ) WITH CHECK (
      patient_id::text = auth.uid()::text OR 
      psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
    );`,
        `CREATE POLICY "Users can delete own appointments" ON "appointments" FOR DELETE TO authenticated USING (
      patient_id::text = auth.uid()::text OR 
      psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text)
    );`,

        // === SCHEDULE OVERRIDES ===
        // 1. Anyone can read schedule overrides (for availability)
        `CREATE POLICY "Enable read access for all schedule" ON "schedule_overrides" FOR SELECT USING (true);`,
        // 2. Only the owner psychologist can insert/update/delete
        `CREATE POLICY "Psychologist can insert schedule overrides" ON "schedule_overrides" FOR INSERT TO authenticated 
     WITH CHECK (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));`,

        `CREATE POLICY "Psychologist can update schedule overrides" ON "schedule_overrides" FOR UPDATE TO authenticated 
     USING (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text))
     WITH CHECK (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));`,

        `CREATE POLICY "Psychologist can delete schedule overrides" ON "schedule_overrides" FOR DELETE TO authenticated 
     USING (psychologist_id::text IN (SELECT id::text FROM psychologist_profiles WHERE "userId"::text = auth.uid()::text));`,
    ];

    for (const sql of sqlCommands) {
        try {
            console.log(`Executing: ${sql}`);
            await prisma.$executeRawUnsafe(sql);
        } catch (err) {
            console.error("Error executing rule:", sql);
            console.error(err);
        }
    }

    console.log('✅ Secure RLS commands executed successfully.');
}

main()
    .catch((e) => {
        console.error('Script Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
