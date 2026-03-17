import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SIGNED_URL_EXPIRY_SECONDS } from '@manga/shared';

@Injectable()
export class ChapterService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findByManga(mangaSlug: string) {
    const manga = await this.prisma.manga.findUnique({ where: { slug: mangaSlug } });
    if (!manga) throw new NotFoundException('Manga not found');

    return this.prisma.chapter.findMany({
      where: { mangaId: manga.id },
      orderBy: { number: 'asc' },
    });
  }

  async findChapterWithPages(mangaSlug: string, chapterSlug: string) {
    const manga = await this.prisma.manga.findUnique({ where: { slug: mangaSlug } });
    if (!manga) throw new NotFoundException('Manga not found');

    const chapter = await this.prisma.chapter.findUnique({
      where: { mangaId_slug: { mangaId: manga.id, slug: chapterSlug } },
      include: {
        pages: { orderBy: { pageNumber: 'asc' } },
      },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');

    // Generate signed URLs for all pages
    const pagesWithUrls = await Promise.all(
      chapter.pages.map(async (page) => {
        const signedUrl = await this.storageService.getSignedUrl(
          page.storageKey,
          SIGNED_URL_EXPIRY_SECONDS,
        );
        return {
          id: page.id,
          chapterId: page.chapterId,
          pageNumber: page.pageNumber,
          signedUrl,
          isScrambled: page.scrambleMetadata !== null,
          scrambleMetadata: page.scrambleMetadata,
        };
      }),
    );

    return {
      ...chapter,
      pages: pagesWithUrls,
    };
  }
}
