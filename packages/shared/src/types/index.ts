// ============================================================
// Shared TypeScript interfaces for Manga Platform
// ============================================================

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';
export type MangaStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  totpEnabled: boolean;
  createdAt: string; // ISO date string
}

export interface UserProfile extends User {
  preferences: UserPreferences;
}

export interface UserPreferences {
  readingDirection: 'ltr' | 'rtl' | 'vertical';
  pageLayout: 'single' | 'double' | 'strip';
  autoNextChapter: boolean;
}

export interface Manga {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverUrl: string;
  status: MangaStatus;
  viewCount: number;
  createdAt: string;
}

export interface MangaDetail extends Manga {
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  mangaId: string;
  number: number;
  slug: string;
  title: string;
  pagesCount: number;
  createdAt: string;
}

export interface Page {
  id: string;
  chapterId: string;
  pageNumber: number;
  /** Signed URL for fetching the image (5 min expiry) */
  signedUrl: string;
  /** Whether this page needs WASM descrambling */
  isScrambled: boolean;
  /** Scramble metadata passed to WASM module */
  scrambleMetadata: ScrambleMetadata | null;
}

export interface ScrambleMetadata {
  tileWidth: number;
  tileHeight: number;
  /** Seed for tile re-ordering algorithm */
  seed: number;
  /** Version of the scramble algorithm */
  version: number;
}

export interface Comment {
  id: string;
  mangaId: string;
  userId: string;
  user: Pick<User, 'id' | 'email'>;
  parentId: string | null;
  content: string;
  replies?: Comment[];
  createdAt: string;
}

// ---- API Response wrappers ----

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginationMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  /** Cursor for next page (cursor-based pagination) */
  nextCursor?: string | null;
  prevCursor?: string | null;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface OffsetPaginationParams {
  page?: number;
  pageSize?: number;
}
