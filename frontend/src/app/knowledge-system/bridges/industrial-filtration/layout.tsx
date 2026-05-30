import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Filtration System Design — Selection Guide | ELIMFILTERS®',
  },
  description: 'Industrial filtration system design guide: contamination target identification, standard selection, technology mapping, and implementation strategy for air, fuel, hydraulic, and lube oil systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges/industrial-filtration/',
  },
  openGraph: {
    title: 'Industrial Filtration System Design — Selection Guide | ELIMFILTERS®',
    description: 'Industrial filtration system design guide: contamination target identification, standard selection, technology mapping, and implementation strategy for air, fuel, hydraulic, and lube oil systems.',
    url: 'https://elimfilters.com/knowledge-system/bridges/industrial-filtration/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration System Design — Selection Guide | ELIMFILTERS®',
    description: 'Industrial filtration system design guide: contamination target identification, standard selection, technology mapping, and implementation strategy for air, fuel, hydraulic, and lube oil systems.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
