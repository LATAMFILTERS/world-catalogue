import type { ReactNode } from 'react';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';

export const dynamicParams = false;

export default function IndustryLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return (
    <>
      {children}
      <CanonicalEntitySchema kind="industry" slug={params.slug} />
    </>
  );
}
