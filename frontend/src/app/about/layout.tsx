import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELIMFILTERS — Industrial Filtration Engineering & Asset Protection',
  description: 'Learn how ELIMFILTERS approaches industrial filtration, asset protection, engineering governance, commercial execution, and its human-governed AI-native operating model.',
  alternates: {
    canonical: 'https://elimfilters.com/about',
  },
  openGraph: {
    title: 'About ELIMFILTERS — Industrial Filtration Engineering & Asset Protection',
    description: 'Who we are, what we protect, how we operate, our engineering philosophy, leadership model, and corporate structure.',
    url: 'https://elimfilters.com/about',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ELIMFILTERS',
    description: 'Industrial filtration engineering organized around asset protection, evidence, capability, and accountable execution.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
