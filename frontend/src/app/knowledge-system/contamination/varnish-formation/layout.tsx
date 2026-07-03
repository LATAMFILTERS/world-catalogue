import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Varnish Formation in Hydraulic Systems — Servo Valve Stiction | ELIMFILTERS',
  },
  description: 'Varnish formation: thermal oxidation of hydraulic fluid producing insoluble deposits on servo valve spools and heat exchangers, detectable via ASTM D7527 MPC 200-500 hours before failure.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/varnish-formation/',
  },
  openGraph: {
    title: 'Varnish Formation in Hydraulic Systems — Servo Valve Stiction | ELIMFILTERS',
    description: 'Varnish formation: thermal oxidation of hydraulic fluid producing insoluble deposits on servo valve spools and heat exchangers, detectable via ASTM D7527 MPC 200-500 hours before failure.',
    url: 'https://elimfilters.com/knowledge-system/contamination/varnish-formation/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Varnish Formation in Hydraulic Systems — Servo Valve Stiction | ELIMFILTERS',
    description: 'Varnish formation: thermal oxidation of hydraulic fluid producing insoluble deposits on servo valve spools and heat exchangers, detectable via ASTM D7527 MPC 200-500 hours before failure.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
