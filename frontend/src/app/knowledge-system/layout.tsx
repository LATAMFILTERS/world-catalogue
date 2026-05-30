import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Filtration Knowledge Base | ELIMFILTERS®',
  },
  description: 'Deep technical resources on filtration science, ISO standards, contamination control, and fleet optimization — built for engineers and procurement teams.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/',
  },
  openGraph: {
    title: 'Industrial Filtration Knowledge Base | ELIMFILTERS®',
    description: 'Deep technical resources on filtration science, ISO standards, contamination control, and fleet optimization.',
    url: 'https://elimfilters.com/knowledge-system/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Industrial Filtration Knowledge Base | ELIMFILTERS®',
    description: 'Deep technical resources on filtration science, ISO standards, contamination control, and fleet optimization.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function KnowledgeSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
