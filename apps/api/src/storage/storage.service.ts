import { Injectable } from '@nestjs/common';
import { getMinioClient, BUCKET_IMAGES } from '../config/minio.config.js';
import type { BucketItemStat } from 'minio';

@Injectable()
export class StorageService {
  private client = getMinioClient();

  async upload(
    bucketName: string,
    objectName: string,
    data: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.putObject(bucketName, objectName, data, data.length, {
      'Content-Type': contentType,
    });
  }

  async getSignedUrl(storageKey: string, expirySeconds: number): Promise<string> {
    // In dev, fall back to a placeholder if the key doesn't exist
    try {
      return await this.client.presignedGetObject(BUCKET_IMAGES, storageKey, expirySeconds);
    } catch {
      return `http://localhost:9000/${BUCKET_IMAGES}/${storageKey}`;
    }
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    await this.client.removeObject(bucketName, objectName);
  }

  async objectExists(bucketName: string, objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(bucketName, objectName) as BucketItemStat;
      return true;
    } catch {
      return false;
    }
  }

  async ensureBucket(bucketName: string): Promise<void> {
    const exists = await this.client.bucketExists(bucketName);
    if (!exists) {
      await this.client.makeBucket(bucketName);
    }
  }
}
