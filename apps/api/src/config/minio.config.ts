import * as Minio from 'minio';

let minioClient: Minio.Client | null = null;

export function getMinioClient(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: process.env['MINIO_ENDPOINT'] ?? 'localhost',
      port: parseInt(process.env['MINIO_PORT'] ?? '9000'),
      useSSL: process.env['MINIO_USE_SSL'] === 'true',
      accessKey: process.env['MINIO_ACCESS_KEY'] ?? 'minioadmin',
      secretKey: process.env['MINIO_SECRET_KEY'] ?? 'minioadmin',
    });
  }
  return minioClient;
}

export const BUCKET_IMAGES = process.env['MINIO_BUCKET_IMAGES'] ?? 'manga-images';
export const BUCKET_COVERS = process.env['MINIO_BUCKET_COVERS'] ?? 'manga-covers';
