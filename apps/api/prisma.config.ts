import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  // datasource.url is used only by prisma migrate / prisma studio.
  // Point to the direct Postgres connection so migrations bypass PgBouncer
  // (DDL requires a persistent session, which transaction-mode pooling doesn't support).
  // Runtime queries use the PrismaClient adapter configured in database.config.ts.
  datasource: {
    // Fall back to DATABASE_URL if DATABASE_DIRECT_URL is not set (e.g. during prisma generate)
    url: process.env['DATABASE_DIRECT_URL'] ?? process.env['DATABASE_URL'],
  },
});
