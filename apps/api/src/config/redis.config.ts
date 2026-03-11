import Redis from 'ioredis';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env['REDIS_HOST'] ?? 'localhost',
      port: parseInt(process.env['REDIS_PORT'] ?? '6379'),
      password: process.env['REDIS_PASSWORD'] || undefined,
      maxRetriesPerRequest: null, // Required for BullMQ
    });
  }
  return redisClient;
}
