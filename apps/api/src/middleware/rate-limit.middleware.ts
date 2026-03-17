import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis.config';
import { REDIS_KEYS } from '@manga/shared';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 120;

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (process.env['DISABLE_RATE_LIMIT'] === 'true') {
      return next();
    }

    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = REDIS_KEYS.rateLimit(ip);
    const redis = getRedisClient();

    const multi = redis.multi();
    multi.incr(key);
    multi.expire(key, WINDOW_SECONDS);
    const results = await multi.exec();

    const count = results?.[0]?.[1] as number;

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - count));

    if (count > MAX_REQUESTS) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    next();
  }
}
