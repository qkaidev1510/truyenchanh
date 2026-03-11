import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { MangaModule } from './manga/manga.module.js';
import { ChapterModule } from './chapter/chapter.module.js';
import { CommentModule } from './comment/comment.module.js';
import { ImageModule } from './image/image.module.js';
import { StorageModule } from './storage/storage.module.js';
import { SignatureMiddleware } from './middleware/signature.middleware.js';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    consumer
      .apply(RateLimitMiddleware, SignatureMiddleware)
      .forRoutes('*');
  }
}
