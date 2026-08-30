import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/asset-protection-system/';

export const metadata: Metadata = {
  title: 'Asset Protection System Strategy | ELIMFILTERS Knowledge Center',
  description: 'Engineering framework for coordinating filtration, contamination control, maintenance, and reliability decisions across critical industrial assets.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
