import { useEffect, useRef } from 'react';
import type { Page } from '@manga/shared';
import { READER } from '@manga/shared';

export type ImageCache = Map<number, ImageBitmap>;

export function usePreloader(pages: Page[], currentPage: number): ImageCache {
  const cache = useRef<ImageCache>(new Map());

  useEffect(() => {
    if (!pages.length) return;

    const preloadPage = async (index: number) => {
      if (index < 0 || index >= pages.length) return;
      if (cache.current.has(index)) return;

      const page = pages[index];
      if (!page?.signedUrl) return;

      try {
        const response = await fetch(page.signedUrl);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        cache.current.set(index, bitmap);
      } catch (err) {
        console.warn(`Failed to preload page ${index}:`, err);
      }
    };

    // Preload current + N+1 + N+2
    for (let i = 0; i <= READER.PRELOAD_AHEAD; i++) {
      void preloadPage(currentPage + i);
    }

    // Evict pages far from current to free memory
    for (const [key] of cache.current) {
      if (Math.abs(key - currentPage) > READER.VIRTUAL_WINDOW_SIZE) {
        const bitmap = cache.current.get(key);
        bitmap?.close();
        cache.current.delete(key);
      }
    }
  }, [currentPage, pages]);

  return cache.current;
}
