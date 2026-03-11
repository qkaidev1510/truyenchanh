import useSWR from 'swr';
import type { ApiResponse, Manga, MangaDetail, Chapter } from '@manga/shared';

export function useMangaList(params?: { q?: string; status?: string; page?: number }) {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.status) query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));

  const url = `/manga?${query.toString()}`;
  return useSWR<ApiResponse<Manga[]>>(url);
}

export function useManga(slug: string | null) {
  return useSWR<MangaDetail>(slug ? `/manga/${slug}` : null);
}

export function useChapters(mangaSlug: string | null) {
  return useSWR<Chapter[]>(mangaSlug ? `/manga/${mangaSlug}/chapters` : null);
}
