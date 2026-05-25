import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Compressed Air Systems — ISO 8573-1 Purity Classes | ELIMFILTERS',
  },
  description: 'Compressed air filtration engineering: ISO 8573-1 purity classes, ISO 8573-2 oil aerosol testing, ISO 8573-3 humidity measurement, dew point control, and pneumatic system protection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/compressed-air-systems/',
  },
  openGraph: {
    title: 'Compressed Air Systems — ISO 8573-1 Purity Classes | ELIMFILTERS',
    description: 'Compressed air filtration engineering: ISO 8573-1 purity classes, ISO 8573-2 oil aerosol testing, ISO 8573-3 humidity measurement, dew point control, and pneumatic system protection.',
    url: 'https://elimfilters.com/knowledge-system/standards/compressed-air-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compressed Air Systems — ISO 8573-1 Purity Classes | ELIMFILTERS',
    description: 'Compressed air filtration engineering: ISO 8573-1 purity classes, ISO 8573-2 oil aerosol testing, ISO 8573-3 humidity measurement, dew point control, and pneumatic system protection.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
