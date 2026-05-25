import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Diesel Water Contamination — Fuel Injector Protection | ELIMFILTERS',
  },
  description: 'Diesel water contamination: root cause analysis of free and emulsified water in fuel, injector corrosion and cavitation failure mechanisms, microbial growth, and water separation technology.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/diesel-water/',
  },
  openGraph: {
    title: 'Diesel Water Contamination — Fuel Injector Protection | ELIMFILTERS',
    description: 'Diesel water contamination: root cause analysis of free and emulsified water in fuel, injector corrosion and cavitation failure mechanisms, microbial growth, and water separation technology.',
    url: 'https://elimfilters.com/knowledge-system/contamination/diesel-water/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diesel Water Contamination — Fuel Injector Protection | ELIMFILTERS',
    description: 'Diesel water contamination: root cause analysis of free and emulsified water in fuel, injector corrosion and cavitation failure mechanisms, microbial growth, and water separation technology.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
