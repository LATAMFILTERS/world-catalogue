import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Knowledge System Index — Full Site Map | ELIMFILTERS',
  },
  description: 'A direct navigation index of every page published under the ELIMFILTERS Knowledge System, grouped by section: Standards, Contamination, Fleet, Compare, Bridges, and Science.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/index/',
  },
  openGraph: {
    title: 'Knowledge System Index — Full Site Map | ELIMFILTERS',
    description: 'A direct navigation index of every page published under the ELIMFILTERS Knowledge System, grouped by section: Standards, Contamination, Fleet, Compare, Bridges, and Science.',
    url: 'https://elimfilters.com/knowledge-system/index/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knowledge System Index — Full Site Map | ELIMFILTERS',
    description: 'A direct navigation index of every page published under the ELIMFILTERS Knowledge System, grouped by section: Standards, Contamination, Fleet, Compare, Bridges, and Science.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
