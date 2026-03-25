import { PrismaClient } from '@prisma/client'

/**
 * Connection Pooling strategy:
 *
 * - DATABASE_URL   → Supabase Transaction Pooler (port 6543, pgbouncer=true)
 *                    Used for all queries at runtime. Handles serverless fan-out.
 * - DIRECT_URL     → Supabase direct connection (port 5432)
 *                    Used ONLY by Prisma Migrate (schema pushes). Not used at runtime.
 *
 * In serverless (Vercel), each Lambda function invocation creates a new Node.js
 * process. The globalThis singleton prevents re-creating the client across hot-reloads
 * in dev, but in production each cold-start gets a fresh client — which is fine because
 * we route through PgBouncer (the pooler), so the DB never sees more than
 * `connection_limit` connections per Vercel region.
 *
 * Do NOT change DATABASE_URL to the direct connection string (port 5432) — that would
 * bypass PgBouncer and exhaust the 60-connection limit of the free Supabase plan.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // datasourceUrl is read from DATABASE_URL env var automatically.
    // Explicit pool configuration is handled via the connection string params
    // (?pgbouncer=true&connection_limit=10) — no need to duplicate here.
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Reuse in development (hot-reload); in production, each cold start is fresh.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
