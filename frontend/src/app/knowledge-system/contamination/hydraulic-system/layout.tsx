import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Hydraulic System Contamination — Valve & Actuator Protection | ELIMFILTERS®',
  },
  description: 'Hydraulic system contamination: particle wear in proportional valves, varnish formation, beta ratio filtration requirements, and ISO 16889 contamination control for heavy industrial machinery.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/hydraulic-system/',
  },
  openGraph: {
    title: 'Hydraulic System Contamination — Valve & Actuator Protection | ELIMFILTERS®',
    description: 'Hydraulic system contamination: particle wear in proportional valves, varnish formation, beta ratio filtration requirements, and ISO 16889 contamination control for heavy industrial machinery.',
    url: 'https://elimfilters.com/knowledge-system/contamination/hydraulic-system/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hydraulic System Contamination — Valve & Actuator Protection | ELIMFILTERS®',
    description: 'Hydraulic system contamination: particle wear in proportional valves, varnish formation, beta ratio filtration requirements, and ISO 16889 contamination control for heavy industrial machinery.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
