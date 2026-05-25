import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Filtration Selection Guides — Application Guides | ELIMFILTERS®',
  },
  description: 'Application-based filtration selection guides for OEM replacement, aftermarket evaluation, fleet solutions, and industrial filtration system design — grounded in contamination control engineering.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges/',
  },
  openGraph: {
    title: 'Industrial Filtration Selection Guides | ELIMFILTERS®',
    description: 'Application-based filtration selection: OEM replacement, aftermarket evaluation, fleet solutions, and system design guides.',
    url: 'https://elimfilters.com/knowledge-system/bridges/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration Selection Guides | ELIMFILTERS®',
    description: 'Application-based guides: OEM replacement, aftermarket evaluation, fleet solutions, system design.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function BridgesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
