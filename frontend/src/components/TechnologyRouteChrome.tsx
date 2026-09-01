'use client';

import { usePathname } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';

export default function TechnologyRouteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const normalized = (pathname || '').replace(/\/+$/, '') || '/';
  const isTechnologyHub = normalized === '/technologies';

  return (
    <>
      {!isTechnologyHub && <PageHeader currentPage="Technologies" />}
      {children}
    </>
  );
}
