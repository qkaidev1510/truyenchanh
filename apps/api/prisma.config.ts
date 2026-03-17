import { defineConfig } from 'prisma/config';
import { PrismaPg } from '@prisma/adapter-pg';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrate: {
    async adapter(env) {
      const { Pool } = await import('pg');
      // Use DATABASE_DIRECT_URL for migrations so they bypass PgBouncer.
      // DDL (CREATE TABLE, ALTER, etc.) requires a persistent session connection.
      const pool = new Pool({
        connectionString: (env['DATABASE_DIRECT_URL'] ?? env['DATABASE_URL']) as string,
      });
      return new PrismaPg(pool);
    },
  },
});
