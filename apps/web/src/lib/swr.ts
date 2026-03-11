import type { SWRConfiguration } from 'swr';
import { api } from './api.js';

export const swrConfig: SWRConfiguration = {
  fetcher: (url: string) => api.get(url).then((r) => r.data),
  revalidateOnFocus: false,
  shouldRetryOnError: false,
  dedupingInterval: 5000,
};
