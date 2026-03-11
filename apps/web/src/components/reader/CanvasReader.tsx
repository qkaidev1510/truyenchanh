'use client';

import React, { useEffect, useCallback } from 'react';
import type { Page } from '@manga/shared';
import { READER } from '@manga/shared';
import { useReaderStore } from '../../store/readerStore.js';
import { usePreloader } from '../../hooks/usePreloader.js';
import { VirtualizedPageList } from './VirtualizedPageList.js';

interface CanvasReaderProps {
  pages: Page[];
  mangaTitle: string;
  chapterTitle: string;
}

export function CanvasReader({ pages, mangaTitle, chapterTitle }: CanvasReaderProps) {
  const { currentPage, zoom, setPage, setZoom, nextPage, prevPage, updateVirtualWindow } =
    useReaderStore();

  const imageCache = usePreloader(pages, currentPage);

  // Initialize virtual window
  useEffect(() => {
    updateVirtualWindow(0, pages.length);
  }, [pages.length, updateVirtualWindow]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextPage();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          prevPage();
          break;
        case '+':
        case '=':
          setZoom(zoom + 0.1);
          break;
        case '-':
          setZoom(zoom - 0.1);
          break;
        case '0':
          setZoom(READER.DEFAULT_ZOOM);
          break;
      }
    },
    [nextPage, prevPage, setZoom, zoom],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-800 px-4 py-2 flex items-center justify-between">
        <div>
          <span className="font-semibold">{mangaTitle}</span>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-gray-300">{chapterTitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Page {currentPage + 1} / {pages.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(zoom - 0.1)}
              className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
            >
              −
            </button>
            <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(zoom + 0.1)}
              className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-sm"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="max-w-3xl mx-auto py-4 px-2">
        <VirtualizedPageList pages={pages} imageCache={imageCache} />
      </div>

      {/* Navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 px-4 py-3 flex items-center justify-center gap-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        <input
          type="range"
          min={0}
          max={pages.length - 1}
          value={currentPage}
          onChange={(e) => setPage(parseInt(e.target.value))}
          className="w-48"
        />
        <button
          onClick={nextPage}
          disabled={currentPage >= pages.length - 1}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
