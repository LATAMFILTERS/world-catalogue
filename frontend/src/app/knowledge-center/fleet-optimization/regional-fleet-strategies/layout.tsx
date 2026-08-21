import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/regional-fleet-strategies/';

export const metadata: Metadata = {
  title: 'Regional Fleet Strategies | ELIMFILTERS Knowledge Center',
  description: 'Technical guidance for adapting filtration, maintenance, inventory, and contamination-control strategy to regional operating environments and fleet duty cycles.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
