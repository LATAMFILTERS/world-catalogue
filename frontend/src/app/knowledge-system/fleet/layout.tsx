import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fleet Optimization Strategies',
  description: 'Industrial fleet optimization through contamination control: reducing downtime, improving fuel efficiency, and total cost of ownership analysis for heavy equipment fleets.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet',
  },
  openGraph: {
    title: 'Fleet Optimization Strategies',
    description: 'Industrial fleet optimization through contamination control: reducing downtime, improving fuel efficiency, and total cost of ownership analysis for heavy equipment fleets.',
    url: 'https://elimfilters.com/knowledge-system/fleet',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Optimization Strategies',
    description: 'Industrial fleet optimization through contamination control: reducing downtime, improving fuel efficiency, and total cost of ownership analysis for heavy equipment fleets.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
