import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Asset Protection Systems | ELIMFILTERS',
  description: 'Engineering guidance for air intake, fuel, lubrication, hydraulic, and cooling-system protection in industrial assets.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/systems/',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
