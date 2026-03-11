import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service.js';
import { ChapterController } from './chapter.controller.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [StorageModule],
  providers: [ChapterService],
  controllers: [ChapterController],
})
export class ChapterModule {}
