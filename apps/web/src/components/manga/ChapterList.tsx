'use client';

import React from 'react';
import Link from 'next/link';
import type { Chapter } from '@manga/shared';

interface ChapterListProps {
  mangaSlug: string;
  chapters: Chapter[];
}

export function ChapterList({ mangaSlug, chapters }: ChapterListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {chapters.map((chapter) => (
        <Link
          key={chapter.id}
          href={`/read/${mangaSlug}/${chapter.slug}`}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div>
            <span className="font-medium text-sm">
              Chapter {chapter.number}
              {chapter.title && ` — ${chapter.title}`}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {chapter.pagesCount} pages · {new Date(chapter.createdAt).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
