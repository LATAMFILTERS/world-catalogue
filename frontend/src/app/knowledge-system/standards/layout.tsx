import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Industrial Filtration Standards — ISO, SAE, ASTM, DIN | ELIMFILTERS',
  },
  description: 'ISO 16889, ISO 4406, SAE J1211, ASTM D6304 and more — organized by filtration system domain. Standards for lube oil, fuel, hydraulic, air intake, cabin, and compressed air systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/',
  },
  openGraph: {
    title: 'Industrial Filtration Standards — ISO, SAE, ASTM, DIN | ELIMFILTERS',
    description: 'ISO 16889, ISO 4406, SAE J1211, ASTM D6304 and more — organized by filtration system domain.',
    url: 'https://elimfilters.com/knowledge-system/standards/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Industrial Filtration Standards — ISO, SAE, ASTM, DIN | ELIMFILTERS',
    description: 'ISO 16889, ISO 4406, SAE J1211, ASTM D6304 — standards by filtration system domain.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
