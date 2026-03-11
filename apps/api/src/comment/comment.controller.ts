import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { IsString, IsOptional } from 'class-validator';

class CreateCommentDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  parentId?: string;
}

@ApiTags('comments')
@Controller('manga/:mangaSlug/comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get()
  findAll(
    @Param('mangaSlug') mangaSlug: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ) {
    return this.commentService.findByManga(mangaSlug, cursor, limit);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(
    @Param('mangaSlug') mangaSlug: string,
    @Request() req: { user: { id: string } },
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentService.create(mangaSlug, req.user.id, dto);
  }
}
