import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Hydraulic Filtration Systems — ISO 16889, NFPA T2.14 | ELIMFILTERS®',
  },
  description: 'Hydraulic system filtration engineering: ISO 16889 beta ratio, NFPA T2.14 cleanliness targets, proportional valve protection, and DIN 51524 oil specification for industrial machinery.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/hydraulic-systems/',
  },
  openGraph: {
    title: 'Hydraulic Filtration Systems — ISO 16889, NFPA T2.14 | ELIMFILTERS®',
    description: 'Hydraulic system filtration engineering: ISO 16889 beta ratio, NFPA T2.14 cleanliness targets, proportional valve protection, and DIN 51524 oil specification for industrial machinery.',
    url: 'https://elimfilters.com/knowledge-system/standards/hydraulic-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hydraulic Filtration Systems — ISO 16889, NFPA T2.14 | ELIMFILTERS®',
    description: 'Hydraulic system filtration engineering: ISO 16889 beta ratio, NFPA T2.14 cleanliness targets, proportional valve protection, and DIN 51524 oil specification for industrial machinery.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
