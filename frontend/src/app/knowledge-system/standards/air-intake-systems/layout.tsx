import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Air Intake Filtration Systems — SAE J1539, ISO 5011 | ELIMFILTERS',
  },
  description: 'Air intake filtration engineering: SAE J1539 volumetric efficiency, ISO 5011 filter test standard, bypass mechanisms, and dust particle control for turbocharged diesel engines.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/air-intake-systems/',
  },
  openGraph: {
    title: 'Air Intake Filtration Systems — SAE J1539, ISO 5011 | ELIMFILTERS',
    description: 'Air intake filtration engineering: SAE J1539 volumetric efficiency, ISO 5011 filter test standard, bypass mechanisms, and dust particle control for turbocharged diesel engines.',
    url: 'https://elimfilters.com/knowledge-system/standards/air-intake-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Air Intake Filtration Systems — SAE J1539, ISO 5011 | ELIMFILTERS',
    description: 'Air intake filtration engineering: SAE J1539 volumetric efficiency, ISO 5011 filter test standard, bypass mechanisms, and dust particle control for turbocharged diesel engines.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
