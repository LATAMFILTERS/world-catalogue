import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Protection Systems | ELIMFILTERS',
  description: 'Engineering guidance for air intake, fuel, lubrication, hydraulic, cooling, and cabin air protection systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/systems',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
