import type { ReactNode } from 'react';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';

export const dynamicParams = false;

export default function SystemLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return (
    <>
      {children}
      <CanonicalEntitySchema kind="system" slug={params.slug} />
    </>
  );
}
