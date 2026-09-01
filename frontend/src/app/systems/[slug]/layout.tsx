import type { ReactNode } from 'react';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';

export const dynamicParams = false;

export default async function SystemLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <>
      {children}
      <CanonicalEntitySchema kind="system" slug={slug} />
    </>
  );
}
