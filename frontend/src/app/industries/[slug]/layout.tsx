import type { ReactNode } from 'react';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';

export default function IndustryLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return (
    <>
      {children}
      <CanonicalEntitySchema kind="industry" slug={params.slug} />
    </>
  );
}
