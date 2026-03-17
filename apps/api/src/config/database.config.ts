import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readReplicas } from '@prisma/extension-read-replicas';
import { Pool } from 'pg';

function createPrismaClient() {
  const primaryPool = new Pool({ connectionString: process.env['DATABASE_URL'] });
  const primaryAdapter = new PrismaPg(primaryPool);

  const replicaUrl = process.env['DATABASE_READ_URL'] ?? process.env['DATABASE_URL'];
  const replicaPool = new Pool({ connectionString: replicaUrl });
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
