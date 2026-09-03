import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OEM vs Aftermarket Filter Selection | ELIMFILTERS',
  description: 'Engineering criteria for comparing OEM and aftermarket filters by verified fit, performance, contamination control, and total ownership impact.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/comparison/oem-vs-aftermarket/' },
};

export default function ComparisonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
