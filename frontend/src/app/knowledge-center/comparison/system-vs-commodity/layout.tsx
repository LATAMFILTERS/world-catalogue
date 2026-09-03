import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Approach vs Commodity Filtration | ELIMFILTERS',
  description: 'Compare system-level contamination control with commodity filter selection across equipment protection, maintenance, and lifecycle decisions.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/comparison/system-vs-commodity/' },
};

export default function ComparisonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
