import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sqlCommands = [
        // Enable RLS on all tables
        `ALTER TABLE IF EXISTS "profiles" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "accounts" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "sessions" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "verification_tokens" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "schedule_overrides" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "users" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "appointments" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "_prisma_migrations" ENABLE ROW LEVEL SECURITY;`,
        `ALTER TABLE IF EXISTS "psychologist_profiles" ENABLE ROW LEVEL SECURITY;`,

        // Profiles permissive policy
        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "profiles";`,
        `CREATE POLICY "Enable all access for authenticated users" ON "profiles" TO authenticated USING (true) WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "profiles";`,
        `CREATE POLICY "Enable read access for all" ON "profiles" FOR SELECT USING (true);`,

        // Psychologist permissive policy
        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "psychologist_profiles";`,
        `CREATE POLICY "Enable all access for authenticated users" ON "psychologist_profiles" TO authenticated USING (true) WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "psychologist_profiles";`,
        `CREATE POLICY "Enable read access for all" ON "psychologist_profiles" FOR SELECT USING (true);`,

        // Schedule overrides permissive policy
        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "schedule_overrides";`,
        `CREATE POLICY "Enable all access for authenticated users" ON "schedule_overrides" TO authenticated USING (true) WITH CHECK (true);`,
        `DROP POLICY IF EXISTS "Enable read access for all" ON "schedule_overrides";`,
        `CREATE POLICY "Enable read access for all" ON "schedule_overrides" FOR SELECT USING (true);`,

        // Appointments permissive policy
        `DROP POLICY IF EXISTS "Enable all access for authenticated users" ON "appointments";`,
        `CREATE POLICY "Enable all access for authenticated users" ON "appointments" TO authenticated USING (true) WITH CHECK (true);`,

        // For Prisma models we just block PostgREST API (no policies = deny all for anon/authenticated).
        // Prisma will still access them unaffected because Prisma uses postgres role which bypasses RLS.
    ];

    for (const sql of sqlCommands) {
        console.log(`Executing: ${sql}`);
        await prisma.$executeRawUnsafe(sql);
    }

    console.log('✅ All RLS commands executed successfully.');
}

main()
    .catch((e) => {
        console.error('Error executing SQL:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
