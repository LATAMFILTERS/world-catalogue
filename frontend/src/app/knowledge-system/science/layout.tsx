import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Filtration Science — Engineering Principles & Media Technology | ELIMFILTERS®',
  },
  description: 'Engineering principles behind industrial filtration: Beta ratio, multi-layer media, bypass valves, collapse ratings, and the science of particle size distribution in contamination control systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/science/',
  },
  openGraph: {
    title: 'Filtration Science — Engineering Principles & Media Technology | ELIMFILTERS®',
    description: 'Beta ratio, multi-layer media, bypass valves, collapse ratings, and particle size distribution in contamination control.',
    url: 'https://elimfilters.com/knowledge-system/science/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filtration Science — Engineering Principles & Media Technology | ELIMFILTERS®',
    description: 'Beta ratio, media layers, bypass valves, collapse ratings, and particle size distribution in filtration.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ScienceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
