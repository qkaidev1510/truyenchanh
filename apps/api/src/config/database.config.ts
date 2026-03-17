import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { Pool, type PoolConfig } from 'pg';

/**
 * Returns a pg.Pool config tuned for PgBouncer transaction-mode pooling.
 *
 * PgBouncer limits should be:
 *   PGBOUNCER_DEFAULT_POOL_SIZE  ≥  DB_POOL_MAX × number-of-API-instances
 *
 * Keep idleTimeoutMillis well below PgBouncer's server_idle_timeout (600 s)
 * so the client releases connections before PgBouncer forcibly reclaims them.
 */
function buildPoolConfig(connectionString: string): PoolConfig {
  return {
    connectionString,
    // Client-side pool size per API instance. PgBouncer multiplies this across instances.
    max: parseInt(process.env['DB_POOL_MAX'] ?? '10', 10),
    // Release idle connections after 10 s (< PgBouncer server_idle_timeout of 600 s)
    idleTimeoutMillis: parseInt(process.env['DB_POOL_IDLE_TIMEOUT_MS'] ?? '10000', 10),
    // Fail fast if no connection is available within 5 s
    connectionTimeoutMillis: parseInt(process.env['DB_POOL_CONNECTION_TIMEOUT_MS'] ?? '5000', 10),
    // Allow the Node process to exit naturally when the pool drains (useful in tests/scripts)
    allowExitOnIdle: false,
  };
}

function createPrismaClient() {
  const primaryPool = new Pool(buildPoolConfig(process.env['DATABASE_URL'] ?? ''));
  const primaryAdapter = new PrismaPg(primaryPool);

  const replicaUrl = process.env['DATABASE_READ_URL'] ?? process.env['DATABASE_URL'] ?? '';
  const replicaPool = new Pool(buildPoolConfig(replicaUrl));
  const replicaAdapter = new PrismaPg(replicaPool);

  const replicaClient = new PrismaClient({
    adapter: replicaAdapter,
    log: process.env['NODE_ENV'] === 'development' ? ['error', 'warn'] : ['error'],
  });

  return new PrismaClient({
    adapter: primaryAdapter,
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
  }).$extends(readReplicas({ replicas: [replicaClient] }));
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

let prismaInstance: ExtendedPrismaClient | null = null;

export function getPrismaClient(): ExtendedPrismaClient {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
  }
  return prismaInstance;
}

export { PrismaClient };
