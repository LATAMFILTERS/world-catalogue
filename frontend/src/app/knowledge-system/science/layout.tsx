import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'The Physics of Industrial Failure — The Science of Asset Protection™ | ELIMFILTERS',
  },
  description: 'Bearing life decreases 20× when fluid contamination rises from ISO 4406 14/12/09 to ≥22. The physics of how particles, water, and heat destroy industrial assets — and the contamination control science that prevents it.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/science/',
  },
  openGraph: {
    title: 'The Physics of Industrial Failure — The Science of Asset Protection™ | ELIMFILTERS',
    description: 'ISO 281:2007 data: bearing life decreases 20× between ISO 4406 14/12/09 and ≥22. Abrasive wear, surface fatigue, adhesive wear, corrosive wear — and the contamination control framework that prevents all four.',
    url: 'https://elimfilters.com/knowledge-system/science/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Physics of Industrial Failure | ELIMFILTERS',
    description: 'Bearing life drops 20× between ISO 4406 14/12/09 and ≥22. Four wear mechanisms. Ten protection technologies. The science of industrial asset protection.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ScienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
