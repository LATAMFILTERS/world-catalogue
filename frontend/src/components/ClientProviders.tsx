'use client';

import { CustomCursor } from './CustomCursor';
import { ScrollProgress } from './ScrollProgress';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      {children}
    </>
  );
}
