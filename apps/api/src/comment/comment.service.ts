import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { getPrismaClient } from '../config/database.config.js';
import { MAX_COMMENT_DEPTH, PAGINATION_DEFAULTS } from '@manga/shared';

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

@Injectable()
export class CommentService {
  private prisma = getPrismaClient();

  async findByManga(
    mangaSlug: string,
    cursor?: string,
    limit = PAGINATION_DEFAULTS.COMMENT_LIMIT,
  ) {
    const manga = await this.prisma.manga.findUnique({ where: { slug: mangaSlug } });
    if (!manga) throw new NotFoundException('Manga not found');

    const comments = await this.prisma.comment.findMany({
      where: { mangaId: manga.id, parentId: null },
      include: {
        user: { select: { id: true, email: true } },
        replies: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    const hasMore = comments.length > limit;
    const items = hasMore ? comments.slice(0, limit) : comments;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return { data: items, meta: { nextCursor } };
  }

  async create(mangaSlug: string, userId: string, dto: CreateCommentDto) {
    const manga = await this.prisma.manga.findUnique({ where: { slug: mangaSlug } });
    if (!manga) throw new NotFoundException('Manga not found');

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent comment not found');
      // Enforce max depth
      if (parent.parentId !== null) {
        throw new BadRequestException(`Max comment nesting depth is ${MAX_COMMENT_DEPTH}`);
      }
    }

    return this.prisma.comment.create({
      data: {
        mangaId: manga.id,
        userId,
        content: dto.content,
        parentId: dto.parentId ?? null,
      },
      include: { user: { select: { id: true, email: true } } },
    });
  }
}
