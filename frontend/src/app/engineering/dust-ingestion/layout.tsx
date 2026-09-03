import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dust Ingestion in Diesel Engines | ELIMFILTERS',
  description:
    'Learn how silica dust damages diesel engines, how ISO 5011 defines air-filter performance, and how to prevent abrasive wear, turbo failure, and premature overhaul.',
  alternates: {
    canonical: 'https://elimfilters.com/engineering/dust-ingestion/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'article',
    url: 'https://elimfilters.com/engineering/dust-ingestion/',
    title: 'How Dust Ingestion Damages Diesel Engines',
    description:
      'Technical guidance on silica ingestion, abrasive engine wear, ISO 5011 filtration performance, diagnosis, and prevention.',
    siteName: 'ELIMFILTERS',
  },
};

export default function DustIngestionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
