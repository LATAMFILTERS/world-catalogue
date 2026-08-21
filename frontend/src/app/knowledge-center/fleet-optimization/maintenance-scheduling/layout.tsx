import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/maintenance-scheduling/';

export const metadata: Metadata = {
  title: 'Maintenance Scheduling for Industrial Fleets | ELIMFILTERS Knowledge Center',
  description: 'Technical guidance for structuring maintenance intervals around duty cycle, contamination exposure, operating conditions, and validated service requirements.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
