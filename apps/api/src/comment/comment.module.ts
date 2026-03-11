import { Module } from '@nestjs/common';
import { CommentService } from './comment.service.js';
import { CommentController } from './comment.controller.js';

@Module({
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
