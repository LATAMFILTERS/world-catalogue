import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Standards Library',
  description: 'Industrial filtration standards explained in operational context: ISO 16889, ISO 4406, ISO 5011, ISO 11155, ISO 8573, ASTM D6304, SAE J1539. System-level contamination control framework.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards',
  },
  openGraph: {
    title: 'Filtration Standards Library',
    description: 'Industrial filtration standards explained in operational context: ISO 16889, ISO 4406, ISO 5011, ISO 11155, ISO 8573, ASTM D6304, SAE J1539. System-level contamination control framework.',
    url: 'https://elimfilters.com/knowledge-system/standards',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filtration Standards Library',
    description: 'Industrial filtration standards explained in operational context: ISO 16889, ISO 4406, ISO 5011, ISO 11155, ISO 8573, ASTM D6304, SAE J1539.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
