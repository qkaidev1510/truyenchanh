/**
 * Scramble Worker — tile-based image scrambling + watermark.
 * Runs after image compression as a separate pass.
 */

import { Worker } from 'bullmq';
import sharp from 'sharp';
import { getBullConnection } from '../config/bull.config.js';
import { getMinioClient, BUCKET_IMAGES } from '../config/minio.config.js';
import { QUEUE_NAMES } from '@manga/shared';
import type { ScrambleJobData } from '../image/image.queue.js';

const minio = getMinioClient();

const worker = new Worker<ScrambleJobData>(
  QUEUE_NAMES.SCRAMBLE,
  async (job) => {
    const { storageKey, seed } = job.data;
    console.log(`Scrambling: ${storageKey} (seed=${seed})`);

    // Download image
    const stream = await minio.getObject(BUCKET_IMAGES, storageKey);
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as Uint8Array));
    }
    const imgBuffer = Buffer.concat(chunks);

    const { width = 800, height = 1200 } = await sharp(imgBuffer).metadata();
    const tileW = Math.floor(width / 4);
    const tileH = Math.floor(height / 4);
    const tilesX = Math.floor(width / tileW);
    const tilesY = Math.floor(height / tileH);

    // Generate deterministic permutation from seed
    const totalTiles = tilesX * tilesY;
    const perm = Array.from({ length: totalTiles }, (_, i) => i);
    // LCG shuffle
    let rng = seed;
    for (let i = totalTiles - 1; i > 0; i--) {
      rng = (rng * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(rng) % (i + 1);
      [perm[i], perm[j]] = [perm[j]!, perm[i]!];
    }

    // Extract and reorder tiles using Sharp composite
    const tiles: sharp.OverlayOptions[] = [];
    for (let idx = 0; idx < totalTiles; idx++) {
      const srcIdx = perm[idx]!;
      const srcX = (srcIdx % tilesX) * tileW;
      const srcY = Math.floor(srcIdx / tilesX) * tileH;
      const dstX = (idx % tilesX) * tileW;
      const dstY = Math.floor(idx / tilesX) * tileH;

      const tileBuffer = await sharp(imgBuffer)
        .extract({ left: srcX, top: srcY, width: tileW, height: tileH })
        .toBuffer();

      tiles.push({ input: tileBuffer, left: dstX, top: dstY });
    }

    // Build scrambled image
    const scrambledBuffer = await sharp({
      create: { width, height, channels: 3, background: { r: 0, g: 0, b: 0 } },
    })
      .composite(tiles)
      .webp({ quality: 80 })
      .toBuffer();

    // Upload scrambled version
    await minio.putObject(BUCKET_IMAGES, storageKey, scrambledBuffer, scrambledBuffer.length, {
      'Content-Type': 'image/webp',
    });

    console.log(`Scrambled: ${storageKey}`);
  },
  {
    connection: getBullConnection(),
    concurrency: 2,
  },
);

worker.on('failed', (job, err) => {
  console.error(`Scramble job ${job?.id} failed:`, err);
});

console.log('Scramble worker started');
