'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useManga } from '../../../hooks/useManga.js';
import { ChapterList } from '../../../components/manga/ChapterList.js';
import { MangaStatusBadge, Skeleton } from '@manga/ui';

export default function MangaDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0]! : (params.slug as string);
  const { data: manga, isLoading } = useManga(slug);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <Skeleton className="w-48 h-72 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!manga) return <div className="p-8 text-center">Manga not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="flex-shrink-0">
          <Image
            src={manga.coverUrl}
            alt={manga.title}
            width={192}
            height={288}
            className="rounded-lg shadow-md object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{manga.title}</h1>
          <div className="mb-3">
            <MangaStatusBadge status={manga.status} />
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{manga.description}</p>
          <p className="text-xs text-gray-500">
            {manga.viewCount.toLocaleString()} views · {manga.chapters?.length ?? 0} chapters
          </p>
        </div>
      </div>

      {/* Chapter list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chapters</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <ChapterList mangaSlug={slug} chapters={manga.chapters ?? []} />
        </div>
      </div>
    </div>
  );
}
