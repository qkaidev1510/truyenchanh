'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useReader } from '../../../../hooks/useReader.js';
import { CanvasReader } from '../../../../components/reader/CanvasReader.js';

export default function ReaderPage() {
  const params = useParams();
  const mangaSlug = Array.isArray(params.mangaSlug)
    ? params.mangaSlug[0]!
    : (params.mangaSlug as string);
  const chapterSlug = Array.isArray(params.chapterSlug)
    ? params.chapterSlug[0]!
    : (params.chapterSlug as string);

  const { chapter, pages, isLoading, error } = useReader(mangaSlug, chapterSlug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading chapter...
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Chapter not found
      </div>
    );
  }

  return (
    <CanvasReader
      pages={pages}
      mangaTitle={mangaSlug}
      chapterTitle={chapter.title}
    />
  );
}
