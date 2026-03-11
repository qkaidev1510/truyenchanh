import React from 'react';
import type { Manga } from '@manga/shared';
import { MangaStatusBadge } from './Badge.js';

interface MangaCardProps {
  manga: Manga;
  onClick?: (manga: Manga) => void;
}

export function MangaCard({ manga, onClick }: MangaCardProps) {
  return (
    <div
      onClick={() => onClick?.(manga)}
      className="group flex flex-col cursor-pointer"
    >
      {/* Cover image */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-100">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <MangaStatusBadge status={manga.status} />
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
          {manga.title}
        </h3>
        <p className="text-xs text-gray-500">
          {manga.viewCount.toLocaleString()} views
        </p>
      </div>
    </div>
  );
}
