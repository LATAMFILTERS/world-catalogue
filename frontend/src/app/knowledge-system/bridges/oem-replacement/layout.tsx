import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'OEM Filter Replacement Guide — Direct Replacement Standards | ELIMFILTERS®',
  },
  description: 'OEM filter replacement guide: direct replacement validation, ISO standard compliance verification, warranty compliance requirements, and performance specification matching for industrial equipment.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges/oem-replacement/',
  },
  openGraph: {
    title: 'OEM Filter Replacement Guide — Direct Replacement Standards | ELIMFILTERS®',
    description: 'OEM filter replacement guide: direct replacement validation, ISO standard compliance verification, warranty compliance requirements, and performance specification matching for industrial equipment.',
    url: 'https://elimfilters.com/knowledge-system/bridges/oem-replacement/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OEM Filter Replacement Guide — Direct Replacement Standards | ELIMFILTERS®',
    description: 'OEM filter replacement guide: direct replacement validation, ISO standard compliance verification, warranty compliance requirements, and performance specification matching for industrial equipment.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
