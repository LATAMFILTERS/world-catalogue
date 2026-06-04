import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Filtration Knowledge Base | ELIMFILTERS®',
  },
  description: 'Deep technical resources on filtration science, ISO standards, contamination control, fleet maintenance, and OEM comparison — built for engineers and procurement teams.',
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
  return (
    <>
      <style>{`
        .ks-pullquote {
          border-left: 3px solid #FFF12D;
          background: rgba(255,241,45,0.04);
          padding: 1.25rem 1.5rem;
          margin: 2rem 0;
          font-family: Outfit, sans-serif;
          font-size: 1.05rem;
          line-height: 1.7;
          color: rgba(255,255,255,0.85);
          font-style: italic;
        }
        .ks-metric {
          color: #FFF12D;
          font-weight: 700;
          font-size: 1.15em;
        }
        @media (max-width: 900px) {
          .ks-progress-rail { display: none !important; }
        }
      `}</style>
      {children}
    </>
  );
}
