'use client';

import React, { useEffect, useRef } from 'react';
import type { Page } from '@manga/shared';
import { loadDescrambleModule } from '@manga/wasm';

interface PageCanvasProps {
  page: Page;
  cachedBitmap?: ImageBitmap;
  zoom: number;
  isVisible: boolean;
}

export function PageCanvas({ page, cachedBitmap, zoom, isVisible }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    let cancelled = false;

    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let bitmap: ImageBitmap;

      if (cachedBitmap) {
        bitmap = cachedBitmap;
      } else {
        const response = await fetch(page.signedUrl);
        const blob = await response.blob();
        bitmap = await createImageBitmap(blob);
      }

      if (cancelled) return;

      // Descramble if needed
      if (page.isScrambled && page.scrambleMetadata) {
        const wasmModule = await loadDescrambleModule();
        bitmap = await wasmModule.descramble(bitmap, page.scrambleMetadata);
      }

      if (cancelled) return;

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(bitmap, 0, 0);
    };

    void render();
    return () => { cancelled = true; };
  }, [page, cachedBitmap, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${100 * zoom}%`,
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
      aria-label={`Page ${page.pageNumber}`}
    />
  );
}
