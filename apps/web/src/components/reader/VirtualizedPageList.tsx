'use client';

import React from 'react';
import type { Page } from '@manga/shared';
import { useReaderStore } from '../../store/readerStore.js';
import { PageCanvas } from './PageCanvas.js';
import type { ImageCache } from '../../hooks/usePreloader.js';

export type { ImageCache };

interface VirtualizedPageListProps {
  pages: Page[];
  imageCache: Map<number, ImageBitmap>;
}

export function VirtualizedPageList({ pages, imageCache }: VirtualizedPageListProps) {
  const { virtualWindow, zoom } = useReaderStore();
  const visibleSet = new Set(virtualWindow);

  return (
    <div className="flex flex-col gap-2">
      {pages.map((page, index) => {
        const isVisible = visibleSet.has(index);
        const cached = imageCache.get(index);

        return (
          <div
            key={page.id}
            style={{
              minHeight: isVisible ? undefined : '1400px',
              background: isVisible ? undefined : '#f3f4f6',
            }}
          >
            {isVisible && (
              <PageCanvas
                page={page}
                cachedBitmap={cached}
                zoom={zoom}
                isVisible={true}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
