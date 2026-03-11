import useSWR from 'swr';
import { useEffect } from 'react';
import { useReaderStore } from '../store/readerStore.js';
import type { Chapter, Page } from '@manga/shared';

interface ChapterData extends Chapter {
  pages: Page[];
}

export function useReader(mangaSlug: string, chapterSlug: string) {
  const { data, error, isLoading } = useSWR<ChapterData>(
    `/manga/${mangaSlug}/chapters/${chapterSlug}`,
  );

  const { currentPage, updateVirtualWindow } = useReaderStore();

  useEffect(() => {
    if (data?.pages) {
      updateVirtualWindow(currentPage, data.pages.length);
    }
  }, [currentPage, data?.pages, updateVirtualWindow]);

  return {
    chapter: data,
    pages: data?.pages ?? [],
    totalPages: data?.pages.length ?? 0,
    error,
    isLoading,
  };
}
