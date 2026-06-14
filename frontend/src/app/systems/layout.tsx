import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Asset Protection Systems — ELIMFILTERS',
  description: 'Five industrial asset protection systems: Air Intake & Airflow, Fuel Cleanliness, Lubrication Reliability, Hydraulic Contamination Control, and Cooling & Environmental Protection. Nine proprietary architectures across 12 heavy industry sectors.',
  keywords: [
    'industrial asset protection systems',
    'air intake contamination control',
    'HPCR fuel system protection',
    'hydraulic contamination control',
    'lubrication reliability engineering',
    'ELIMFILTERS',
    'industrial contamination control',
    'contamination control engineering',
  ],
  alternates: { canonical: 'https://elimfilters.com/systems/' },
  openGraph: {
    title: 'Industrial Asset Protection Systems | ELIMFILTERS',
    description: 'Five contamination control systems — air intake, fuel cleanliness, lubrication, hydraulic, cooling — each engineered around a specific failure mechanism across heavy industry equipment.',
    url: 'https://elimfilters.com/systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/images/system-hero.avif', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    title: 'Industrial Asset Protection Systems | ELIMFILTERS',
    description: 'Five contamination control systems — air intake, fuel cleanliness, lubrication, hydraulic, cooling — each engineered around a specific failure mechanism across heavy industry equipment.',
    card: 'summary_large_image',
    images: ['https://elimfilters.com/images/system-hero.avif'],
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
