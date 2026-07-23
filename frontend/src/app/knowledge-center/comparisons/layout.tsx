import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Engineering Comparisons | ELIMFILTERS',
  description: 'Technical comparisons of filtration standards, efficiency metrics, cleanliness codes, and engineering selection criteria.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/comparisons' },
};

export default function ComparisonsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
