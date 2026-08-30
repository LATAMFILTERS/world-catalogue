import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/equipment-lifecycle-optimization/';

export const metadata: Metadata = {
  title: 'Equipment Lifecycle Optimization | ELIMFILTERS Knowledge Center',
  description: 'Engineering guidance for extending useful asset life through contamination control, maintenance planning, condition awareness, and application-specific filtration decisions.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
