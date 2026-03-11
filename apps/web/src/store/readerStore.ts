import { create } from 'zustand';
import { READER } from '@manga/shared';

interface ReaderState {
  currentPage: number;
  zoom: number;
  /** Indices of pages rendered in the virtual window */
  virtualWindow: number[];
  direction: 'ltr' | 'rtl' | 'vertical';

  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setZoom: (zoom: number) => void;
  setDirection: (dir: 'ltr' | 'rtl' | 'vertical') => void;
  updateVirtualWindow: (currentPage: number, totalPages: number) => void;
}

function buildVirtualWindow(current: number, total: number): number[] {
  const half = Math.floor(READER.VIRTUAL_WINDOW_SIZE / 2);
  const start = Math.max(0, current - half);
  const end = Math.min(total - 1, current + half);
  const window: number[] = [];
  for (let i = start; i <= end; i++) window.push(i);
  return window;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentPage: 0,
  zoom: READER.DEFAULT_ZOOM,
  virtualWindow: [],
  direction: 'ltr',

  setPage: (page) => {
    set({ currentPage: page });
  },

  nextPage: () => {
    set((s) => ({ currentPage: s.currentPage + 1 }));
  },

  prevPage: () => {
    set((s) => ({ currentPage: Math.max(0, s.currentPage - 1) }));
  },

  setZoom: (zoom) => {
    const clamped = Math.min(READER.MAX_ZOOM, Math.max(READER.MIN_ZOOM, zoom));
    set({ zoom: clamped });
  },

  setDirection: (direction) => set({ direction }),

  updateVirtualWindow: (currentPage, totalPages) => {
    set({ virtualWindow: buildVirtualWindow(currentPage, totalPages) });
  },
}));
