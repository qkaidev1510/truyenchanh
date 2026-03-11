import { Module } from '@nestjs/common';
import { MangaService } from './manga.service.js';
import { MangaController } from './manga.controller.js';

@Module({
  providers: [MangaService],
  controllers: [MangaController],
  exports: [MangaService],
})
export class MangaModule {}
