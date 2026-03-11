#!/bin/sh
# MinIO bucket initialization script
# Run this after MinIO container starts to create default buckets.

set -e

MINIO_HOST="${MINIO_HOST:-http://localhost:9000}"
ACCESS_KEY="${MINIO_ACCESS_KEY:-minioadmin}"
SECRET_KEY="${MINIO_SECRET_KEY:-minioadmin}"

echo "Waiting for MinIO to be ready..."
until curl -sf "${MINIO_HOST}/minio/health/live"; do
  sleep 2
done
echo "MinIO is ready."

# Configure mc (MinIO Client)
mc alias set manga "${MINIO_HOST}" "${ACCESS_KEY}" "${SECRET_KEY}"

# Create buckets
mc mb --ignore-existing manga/manga-images
mc mb --ignore-existing manga/manga-covers

# Set public download policy for covers (CDN-friendly)
mc anonymous set download manga/manga-covers

echo "MinIO buckets initialized:"
mc ls manga
