import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChapterService } from './chapter.service';

@ApiTags('chapters')
@Controller('manga/:mangaSlug/chapters')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @Get()
  findAll(@Param('mangaSlug') mangaSlug: string) {
    return this.chapterService.findByManga(mangaSlug);
  }

  @Get(':chapterSlug')
  findOne(
    @Param('mangaSlug') mangaSlug: string,
    @Param('chapterSlug') chapterSlug: string,
  ) {
    return this.chapterService.findChapterWithPages(mangaSlug, chapterSlug);
  }
}
