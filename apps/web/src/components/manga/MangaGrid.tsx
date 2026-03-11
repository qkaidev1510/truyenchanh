'use client';

import React from 'react';
import type { Manga } from '@manga/shared';
import { MangaCard, MangaCardSkeleton } from '@manga/ui';

interface MangaGridProps {
  mangas: Manga[];
  isLoading?: boolean;
  onMangaClick?: (manga: Manga) => void;
}

export function MangaGrid({ mangas, isLoading, onMangaClick }: MangaGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {mangas.map((manga) => (
        <MangaCard key={manga.id} manga={manga} onClick={onMangaClick} />
      ))}
    </div>
  );
}
