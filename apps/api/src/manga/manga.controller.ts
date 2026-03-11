import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MangaService } from './manga.service.js';
import { CreateMangaDto, UpdateMangaDto, MangaQueryDto } from './dto/manga.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('manga')
@Controller('manga')
export class MangaController {
  constructor(private mangaService: MangaService) {}

  @Get()
  findAll(@Query() query: MangaQueryDto) {
    return this.mangaService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.mangaService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() dto: CreateMangaDto) {
    return this.mangaService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':slug')
  update(@Param('slug') slug: string, @Body() dto: UpdateMangaDto) {
    return this.mangaService.update(slug, dto);
  }
}
