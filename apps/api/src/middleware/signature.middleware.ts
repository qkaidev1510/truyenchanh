import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { generateSignature, isTimestampValid, hashIp } from '@manga/shared';

@Injectable()
export class SignatureMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    // Skip in dev when disabled
    if (process.env['DISABLE_SIGNATURE_CHECK'] === 'true') {
      return next();
    }

    // Skip health + docs endpoints
    const skipPaths = ['/api/docs', '/api/health'];
    if (skipPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const timestampHeader = req.headers['x-timestamp'];
    const signatureHeader = req.headers['x-signature'];

    if (!timestampHeader || !signatureHeader) {
      throw new UnauthorizedException('Missing signature headers');
    }

    const timestamp = parseInt(Array.isArray(timestampHeader) ? timestampHeader[0]! : timestampHeader);
    if (!isTimestampValid(timestamp)) {
      throw new UnauthorizedException('Signature timestamp expired');
    }

    const userAgent = req.headers['user-agent'] ?? 'unknown';
    const rawIp = req.ip ?? req.socket.remoteAddress ?? '0.0.0.0';
    const hashedIp = await hashIp(rawIp);

    const secret = process.env['SIGNATURE_SECRET'];
    if (!secret) throw new Error('SIGNATURE_SECRET not configured');

    const expected = await generateSignature({ timestamp, userAgent, hashedIp }, secret);
    const provided = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

    if (expected !== provided) {
      throw new UnauthorizedException('Invalid signature');
    }

    next();
  }
}
