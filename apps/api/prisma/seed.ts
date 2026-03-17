import { PrismaClient, MangaStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminHash = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@manga.dev' },
    update: {},
    create: {
      email: 'admin@manga.dev',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Regular user
  const userHash = await bcrypt.hash('user123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@manga.dev' },
    update: {},
    create: {
      email: 'user@manga.dev',
      passwordHash: userHash,
      role: 'USER',
    },
  });
  console.log(`Regular user: ${user.email}`);

  // Sample manga
  const mangas = [
    {
      slug: 'demon-chronicles',
      title: 'Demon Chronicles',
      description:
        'A young warrior discovers ancient power to battle supernatural forces threatening humanity.',
      coverUrl: 'https://picsum.photos/seed/manga1/400/600',
      status: MangaStatus.ONGOING,
      chaptersCount: 3,
    },
    {
      slug: 'celestial-blade',
      title: 'Celestial Blade',
      description:
        'In a world of martial arts and spiritual energy, a disgraced swordsman seeks redemption.',
      coverUrl: 'https://picsum.photos/seed/manga2/400/600',
      status: MangaStatus.COMPLETED,
      chaptersCount: 2,
    },
    {
      slug: 'phantom-realm',
      title: 'Phantom Realm',
      description:
        'A detective with the ability to see ghosts investigates supernatural crimes in modern Tokyo.',
      coverUrl: 'https://picsum.photos/seed/manga3/400/600',
      status: MangaStatus.HIATUS,
      chaptersCount: 2,
    },
  ];

  for (const mangaData of mangas) {
    const { chaptersCount, ...mangaFields } = mangaData;

    const manga = await prisma.manga.upsert({
      where: { slug: mangaFields.slug },
      update: {},
      create: {
        ...mangaFields,
        viewCount: BigInt(Math.floor(Math.random() * 100000)),
      },
    });
    console.log(`Manga: ${manga.title}`);

    for (let c = 1; c <= chaptersCount; c++) {
      const pagesCount = 15 + Math.floor(Math.random() * 10);
      const chapter = await prisma.chapter.upsert({
        where: { mangaId_slug: { mangaId: manga.id, slug: `chapter-${c}` } },
        update: {},
        create: {
          mangaId: manga.id,
          number: c,
          slug: `chapter-${c}`,
          title: `Chapter ${c}`,
          pagesCount,
        },
      });

      // Create page records
      for (let p = 1; p <= pagesCount; p++) {
        await prisma.page.upsert({
          where: { chapterId_pageNumber: { chapterId: chapter.id, pageNumber: p } },
          update: {},
          create: {
            chapterId: chapter.id,
            pageNumber: p,
            storageKey: `${manga.slug}/${chapter.slug}/page-${String(p).padStart(3, '0')}.webp`,
            scrambleMetadata:
              p % 3 === 0 ? { tileWidth: 4, tileHeight: 4, seed: p * 1337, version: 1 } : null,
          },
        });
      }

      console.log(`  Chapter ${c}: ${pagesCount} pages`);
    }

    // Seed a comment
    await prisma.comment.create({
      data: {
        mangaId: manga.id,
        userId: user.id,
        content: `Great manga! Can't wait for more chapters of ${manga.title}.`,
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
