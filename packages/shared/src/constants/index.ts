// ============================================================
// Shared constants for Manga Platform
// ============================================================

export const MANGA_STATUS = {
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  HIATUS: 'HIATUS',
  CANCELLED: 'CANCELLED',
} as const;

export const USER_ROLE = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CURSOR_LIMIT: 20,
  COMMENT_LIMIT: 30,
} as const;

export const SIGNED_URL_EXPIRY_SECONDS = 300; // 5 minutes

export const SIGNATURE_WINDOW_SECONDS = 300; // 5 minutes

export const IMAGE_FORMATS = {
  AVIF: 'avif',
  WEBP: 'webp',
  JPEG: 'jpeg',
} as const;

export const QUEUE_NAMES = {
  IMAGE_PROCESS: 'IMAGE_PROCESS',
  SCRAMBLE: 'SCRAMBLE',
  VIEW_COUNT: 'VIEW_COUNT',
} as const;

export const MAX_COMMENT_DEPTH = 2;

export const REDIS_KEYS = {
  // Rate limiting — sliding window counter per IP
  rateLimit: (ip: string) => `tc:rl:${ip}`,
  // Application cache
  cache: {
    manga: (slug: string) => `tc:cache:manga:${slug}`,
    chapter: (id: string) => `tc:cache:chapter:${id}`,
  },
} as const;

export const READER = {
  PRELOAD_AHEAD: 2,
  VIRTUAL_WINDOW_SIZE: 7,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 3.0,
  DEFAULT_ZOOM: 1.0,
} as const;
