import type { Metadata } from 'next';

const URL = 'https://elimfilters.com/knowledge-center/fleet-optimization/predictive-monitoring/';

export const metadata: Metadata = {
  title: 'Predictive Monitoring for Critical Assets | ELIMFILTERS Knowledge Center',
  description: 'Engineering guidance for using operating data, condition indicators, and maintenance evidence to support predictive asset-protection decisions.',
  robots: { index: true, follow: true },
  alternates: { canonical: URL },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
