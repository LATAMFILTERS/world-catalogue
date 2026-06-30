import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contamination Case Studies',
  description: 'Detailed technical case studies on industrial contamination: diesel water contamination, particle wear in engines, hydraulic system contamination, and varnish formation.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination',
  },
  openGraph: {
    title: 'Contamination Case Studies',
    description: 'Detailed technical case studies on industrial contamination: diesel water contamination, particle wear in engines, hydraulic system contamination, and varnish formation.',
    url: 'https://elimfilters.com/knowledge-system/contamination',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contamination Case Studies',
    description: 'Detailed technical case studies on industrial contamination: diesel water contamination, particle wear in engines, hydraulic system contamination, and varnish formation.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ContaminationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
