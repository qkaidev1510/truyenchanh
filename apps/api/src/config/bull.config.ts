import type { ConnectionOptions } from 'bullmq';

export function getBullConnection(): ConnectionOptions {
  return {
    host: process.env['REDIS_HOST'] ?? 'localhost',
    port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
    password: process.env['REDIS_PASSWORD'] || undefined,
  };
}
