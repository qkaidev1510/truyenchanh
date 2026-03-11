/**
 * View Counter Worker — batch updates manga.viewCount every 30s from queue.
 */

import { Worker } from 'bullmq';
import { getBullConnection } from '../config/bull.config.js';
import { getPrismaClient } from '../config/database.config.js';
import { QUEUE_NAMES } from '@manga/shared';
import type { ViewCountJobData } from '../image/image.queue.js';

const prisma = getPrismaClient();

const worker = new Worker<ViewCountJobData>(
  QUEUE_NAMES.VIEW_COUNT,
  async (job) => {
    const { mangaId, increment } = job.data;
    await prisma.manga.update({
      where: { id: mangaId },
      data: { viewCount: { increment: BigInt(increment) } },
    });
  },
  {
    connection: getBullConnection(),
    concurrency: 5,
    // Batch: process accumulated jobs every 30s
    limiter: { max: 100, duration: 30000 },
  },
);

worker.on('failed', (job, err) => {
  console.error(`ViewCount job ${job?.id} failed:`, err);
});

console.log('View counter worker started');
