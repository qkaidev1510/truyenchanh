import type { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { MangaModule } from './manga/manga.module';
import { ChapterModule } from './chapter/chapter.module';
import { CommentModule } from './comment/comment.module';
import { ImageModule } from './image/image.module';
import { StorageModule } from './storage/storage.module';
import { SignatureMiddleware } from './middleware/signature.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CacheModule,
    AuthModule,
    UserModule,
    MangaModule,
    ChapterModule,
    CommentModule,
    ImageModule,
    StorageModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware, SignatureMiddleware).forRoutes('*');
  }
}
