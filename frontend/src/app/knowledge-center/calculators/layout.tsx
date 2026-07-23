import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Engineering Calculators | ELIMFILTERS',
  description: 'Standards-based calculators for ISO cleanliness codes, beta ratio, pressure drop, service intervals, and filtration engineering analysis.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/calculators' },
};

export default function CalculatorsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
