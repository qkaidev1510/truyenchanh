import { Injectable, NotFoundException } from '@nestjs/common';
import { MeiliSearch as MeilisearchService } from 'meilisearch';
import { getPrismaClient } from '../config/database.config.js';
import type { CreateMangaDto, UpdateMangaDto, MangaQueryDto } from './dto/manga.dto.js';
import { PAGINATION_DEFAULTS } from '@manga/shared';

@Injectable()
export class MangaService {
  private prisma = getPrismaClient();
  private meili: InstanceType<typeof MeilisearchService> | null = null;

  private getMeili() {
    if (!this.meili) {
      const { MeiliSearch } = require('meilisearch') as typeof import('meilisearch');
      this.meili = new MeiliSearch({
        host: process.env['MEILI_HOST'] ?? 'http://localhost:7700',
        apiKey: process.env['MEILI_MASTER_KEY'],
      }) as unknown as InstanceType<typeof MeilisearchService>;
    }
    return this.meili;
  }

  async findAll(query: MangaQueryDto) {
    const page = query.page ?? PAGINATION_DEFAULTS.PAGE;
    const pageSize = Math.min(
      query.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
      PAGINATION_DEFAULTS.MAX_PAGE_SIZE,
    );
    const skip = (page - 1) * pageSize;

    // Full-text search via Meilisearch
    if (query.q) {
      try {
        const client = this.getMeili() as unknown as import('meilisearch').MeiliSearch;
        const results = await client.index('manga').search(query.q, {
          limit: pageSize,
          offset: skip,
          filter: query.status ? `status = ${query.status}` : undefined,
        });
        return {
          data: results.hits,
          meta: { total: results.estimatedTotalHits, page, pageSize },
        };
      } catch {
        // Fallback to DB if Meilisearch is unavailable
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.manga.findMany({
        where: query.status ? { status: query.status } : undefined,
        orderBy: { viewCount: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.manga.count({
        where: query.status ? { status: query.status } : undefined,
      }),
    ]);

    return { data: items, meta: { total, page, pageSize } };
  }

  async findBySlug(slug: string) {
    const manga = await this.prisma.manga.findUnique({
      where: { slug },
      include: {
        chapters: { orderBy: { number: 'asc' } },
      },
    });
    if (!manga) throw new NotFoundException('Manga not found');
    return manga;
  }

  async create(dto: CreateMangaDto) {
    const manga = await this.prisma.manga.create({ data: { ...dto, coverUrl: dto.coverUrl ?? '' } });
    // Index in Meilisearch
    try {
      const client = this.getMeili() as unknown as import('meilisearch').MeiliSearch;
      await client.index('manga').addDocuments([{ ...manga, viewCount: Number(manga.viewCount) }]);
    } catch { /* non-critical */ }
    return manga;
  }

  async update(slug: string, dto: UpdateMangaDto) {
    const manga = await this.prisma.manga.update({
      where: { slug },
      data: dto,
    });
    try {
      const client = this.getMeili() as unknown as import('meilisearch').MeiliSearch;
      await client.index('manga').updateDocuments([{ ...manga, id: manga.id }]);
    } catch { /* non-critical */ }
    return manga;
  }

  async incrementViewCount(mangaId: string) {
    await this.prisma.manga.update({
      where: { id: mangaId },
      data: { viewCount: { increment: 1 } },
    });
  }
}
