import { Injectable } from '@nestjs/common';
import { getRedisClient } from '../config/redis.config';

// Preserve BigInt values across JSON serialization.
// Prisma returns BigInt for fields like viewCount; standard JSON.stringify throws on them.
const BIGINT_PREFIX = '__bigint__:';

function replacer(_key: string, value: unknown): unknown {
  return typeof value === 'bigint' ? `${BIGINT_PREFIX}${value.toString()}` : value;
}

function reviver(_key: string, value: unknown): unknown {
  if (typeof value === 'string' && value.startsWith(BIGINT_PREFIX)) {
    return BigInt(value.slice(BIGINT_PREFIX.length));
  }
  return value;
}

@Injectable()
export class CacheService {
  private readonly redis = getRedisClient();

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    if (raw === null) return null;
    return JSON.parse(raw, reviver) as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value, replacer), 'EX', ttlSeconds);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) await this.redis.del(...keys);
  }
}
