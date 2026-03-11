'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Manga } from '@manga/shared';
import { useMangaList } from '../hooks/useManga.js';
import { MangaGrid } from '../components/manga/MangaGrid.js';

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useMangaList({ q: search || undefined });

  const mangas: Manga[] = data?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Latest Manga</h1>
        <input
          type="search"
          placeholder="Search manga..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <MangaGrid
        mangas={mangas}
        isLoading={isLoading}
        onMangaClick={(manga) => router.push(`/manga/${manga.slug}`)}
      />
    </div>
  );
}
