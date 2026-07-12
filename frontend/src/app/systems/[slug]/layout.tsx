import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getProtectionSystemBySlug } from '@/lib/protection-systems-data';
import { CanonicalEntitySchema } from '@/components/CanonicalEntitySchema';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const system = getProtectionSystemBySlug(params.slug);
  if (!system) return { title: 'System Not Found' };
  const url = `https://elimfilters.com/systems/${system.slug}`;
  const title = `${system.name} | ELIMFILTERS`;
  return {
    title,
    description: system.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: system.tagline, url, type: 'website', siteName: 'ELIMFILTERS' },
    twitter: { title, description: system.tagline, card: 'summary_large_image' },
  };
}

export default function SystemLayout({ children, params }: { children: ReactNode; params: { slug: string } }) {
  return (
    <>
      {children}
      <CanonicalEntitySchema kind="system" slug={params.slug} />
    </>
  );
}
