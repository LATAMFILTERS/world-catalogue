import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Aftermarket Filter Selection Guide — OEM Cross Reference | ELIMFILTERS',
  },
  description: 'Aftermarket filter selection methodology: OEM cross-reference validation, contamination control specification matching, quality verification, and system compatibility assessment for industrial equipment.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges/aftermarket-selection/',
  },
  openGraph: {
    title: 'Aftermarket Filter Selection Guide — OEM Cross Reference | ELIMFILTERS',
    description: 'Aftermarket filter selection methodology: OEM cross-reference validation, contamination control specification matching, quality verification, and system compatibility assessment for industrial equipment.',
    url: 'https://elimfilters.com/knowledge-system/bridges/aftermarket-selection/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aftermarket Filter Selection Guide — OEM Cross Reference | ELIMFILTERS',
    description: 'Aftermarket filter selection methodology: OEM cross-reference validation, contamination control specification matching, quality verification, and system compatibility assessment for industrial equipment.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
