import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Asset Protection Systems — ELIMFILTERS®',
  description: 'Five industrial asset protection systems engineered for contamination control in air intake, fuel cleanliness, lubrication, hydraulic, and cabin/compressed air domains across 12 heavy industry sectors.',
  keywords: ['industrial asset protection', 'air intake protection system', 'fuel cleanliness protection', 'hydraulic contamination control', 'lubrication reliability', 'ELIMFILTERS®', 'contamination control systems'],
  alternates: {
    canonical: 'https://elimfilters.com/systems/',
  },
  openGraph: {
    title: 'Industrial Asset Protection Systems | ELIMFILTERS®',
    description: 'Five protection systems — air intake, fuel cleanliness, lubrication, hydraulic, cabin and compressed air — each targeting a specific contamination pathway across heavy industry equipment.',
    url: 'https://elimfilters.com/systems/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/images/system-hero.avif', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    title: 'Industrial Asset Protection Systems | ELIMFILTERS®',
    description: 'Five protection systems — air intake, fuel cleanliness, lubrication, hydraulic, cabin and compressed air — each targeting a specific contamination pathway across heavy industry equipment.',
    card: 'summary_large_image',
    images: ['https://elimfilters.com/images/system-hero.avif'],
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
