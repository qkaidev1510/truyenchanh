import { Injectable } from '@nestjs/common';
import { imageProcessQueue, type ImageProcessJobData } from './image.queue.js';

@Injectable()
export class ImageService {
  async queueImageProcessing(data: ImageProcessJobData) {
    return imageProcessQueue.add('process', data, {
      jobId: `page-${data.pageId}`,
    });
  }
}
