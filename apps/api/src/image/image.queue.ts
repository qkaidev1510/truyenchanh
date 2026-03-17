import { Queue } from 'bullmq';
import { getBullConnection } from '../config/bull.config';
import { QUEUE_NAMES } from '@manga/shared';

export const imageProcessQueue = new Queue(QUEUE_NAMES.IMAGE_PROCESS, {
  connection: getBullConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

export const scrambleQueue = new Queue(QUEUE_NAMES.SCRAMBLE, {
  connection: getBullConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});

export const viewCountQueue = new Queue(QUEUE_NAMES.VIEW_COUNT, {
  connection: getBullConnection(),
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: 50,
  },
});

export interface ImageProcessJobData {
  pageId: string;
  chapterId: string;
  sourceStorageKey: string;
  mangaSlug: string;
  chapterSlug: string;
  pageNumber: number;
}

export interface ScrambleJobData {
  pageId: string;
  storageKey: string;
  seed: number;
}

export interface ViewCountJobData {
  mangaId: string;
  increment: number;
}
