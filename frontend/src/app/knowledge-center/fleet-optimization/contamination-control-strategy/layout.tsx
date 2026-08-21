import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/contamination-control-strategy/';

export const metadata: Metadata = {
  title: 'Contamination Control Strategy | ELIMFILTERS Knowledge Center',
  description: 'Technical framework for identifying contamination sources, defining cleanliness objectives, selecting controls, and validating protection strategies in industrial fleets.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
