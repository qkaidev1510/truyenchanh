/**
 * Image processor — runs as a separate worker process.
 * Handles: Sharp compress to AVIF+WebP, generate scramble metadata.
 * Start with: node dist/image/image.processor.js
 */

import { Worker } from 'bullmq';
import sharp from 'sharp';
import { getBullConnection } from '../config/bull.config.js';
import { getMinioClient, BUCKET_IMAGES } from '../config/minio.config.js';
import { getPrismaClient } from '../config/database.config.js';
import { QUEUE_NAMES } from '@manga/shared';
import type { ImageProcessJobData } from './image.queue.js';

const prisma = getPrismaClient();
const minio = getMinioClient();

const worker = new Worker<ImageProcessJobData>(
  QUEUE_NAMES.IMAGE_PROCESS,
  async (job) => {
    const { pageId, sourceStorageKey, mangaSlug, chapterSlug, pageNumber } = job.data;

    console.log(`Processing image: ${sourceStorageKey}`);

    // Download source from MinIO
    const stream = await minio.getObject(BUCKET_IMAGES, sourceStorageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
    }
    const sourceBuffer = Buffer.concat(chunks);

    // Process with Sharp
    const sharpInstance = sharp(sourceBuffer);
    const metadata = await sharpInstance.metadata();
    const { width = 800, height = 1200 } = metadata;

    // Generate AVIF
    const avifBuffer = await sharp(sourceBuffer)
      .avif({ quality: 75, effort: 4 })
      .toBuffer();

    // Generate WebP fallback
    const webpBuffer = await sharp(sourceBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    const basePath = `${mangaSlug}/${chapterSlug}/page-${String(pageNumber).padStart(3, '0')}`;

    // Upload both formats
    await minio.putObject(BUCKET_IMAGES, `${basePath}.avif`, avifBuffer, avifBuffer.length, {
      'Content-Type': 'image/avif',
    });
    await minio.putObject(BUCKET_IMAGES, `${basePath}.webp`, webpBuffer, webpBuffer.length, {
      'Content-Type': 'image/webp',
    });

    // Generate scramble metadata (tile-based, every 3rd page is scrambled)
    const shouldScramble = pageNumber % 3 === 0;
    const scrambleMetadata = shouldScramble
      ? {
          tileWidth: Math.floor(width / 4),
          tileHeight: Math.floor(height / 4),
          seed: pageNumber * 1337,
          version: 1,
        }
      : null;

    // Update page record
    await prisma.page.update({
      where: { id: pageId },
      data: {
        storageKey: `${basePath}.webp`,
        scrambleMetadata,
      },
    });

    console.log(`Done: ${basePath}`);
  },
  {
    connection: getBullConnection(),
    concurrency: 3,
  },
);

worker.on('failed', (job, err) => {
  console.error(`Image job ${job?.id} failed:`, err);
});

console.log('Image processor worker started');
