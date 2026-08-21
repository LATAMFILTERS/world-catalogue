import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/total-cost-ownership/';

export const metadata: Metadata = {
  title: 'Total Cost of Ownership for Industrial Fleets | ELIMFILTERS Knowledge Center',
  description: 'Engineering framework for evaluating filtration and maintenance decisions through lifecycle cost, downtime exposure, service effort, and asset reliability.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
