import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/';

export const metadata: Metadata = {
  title: 'Fleet Optimization & Asset Reliability | ELIMFILTERS Knowledge Center',
  description:
    'Engineering guidance for maintenance strategy, contamination control, asset lifecycle planning, predictive monitoring, and total cost of ownership in industrial fleets.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: {
    title: 'Fleet Optimization & Asset Reliability | ELIMFILTERS',
    description:
      'Engineering guidance for maintenance strategy, contamination control, asset lifecycle planning, predictive monitoring, and total cost of ownership in industrial fleets.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
};

export default function FleetOptimizationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
