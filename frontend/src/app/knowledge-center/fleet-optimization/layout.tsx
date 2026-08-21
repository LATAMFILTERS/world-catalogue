import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/';
const DESCRIPTION = 'Engineering guidance for fleet maintenance, contamination control, asset reliability, lifecycle planning, and total cost of ownership.';

export const metadata: Metadata = {
  title: 'Fleet Optimization & Reliability | ELIMFILTERS',
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
  openGraph: {
    title: 'Fleet Optimization & Reliability | ELIMFILTERS',
    description: DESCRIPTION,
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
  },
};

export default function FleetOptimizationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
