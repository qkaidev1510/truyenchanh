'use client';

import React from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '../lib/swr.js';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
