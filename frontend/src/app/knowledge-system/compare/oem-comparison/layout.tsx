import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'OEM vs Aftermarket Filters — System Comparison Guide | ELIMFILTERS®',
  },
  description: 'OEM vs aftermarket filtration comparison: warranty compliance, specification matching, contamination control performance, total cost analysis, and when filter brand matters for equipment reliability.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare/oem-comparison/',
  },
  openGraph: {
    title: 'OEM vs Aftermarket Filters — System Comparison Guide | ELIMFILTERS®',
    description: 'OEM vs aftermarket filtration comparison: warranty compliance, specification matching, contamination control performance, total cost analysis, and when filter brand matters for equipment reliability.',
    url: 'https://elimfilters.com/knowledge-system/compare/oem-comparison/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OEM vs Aftermarket Filters — System Comparison Guide | ELIMFILTERS®',
    description: 'OEM vs aftermarket filtration comparison: warranty compliance, specification matching, contamination control performance, total cost analysis, and when filter brand matters for equipment reliability.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
