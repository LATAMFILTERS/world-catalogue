import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filter Evaluation Framework | ELIMFILTERS',
  description: 'A five-step engineering framework for evaluating filtration targets, efficiency, bypass settings, replacement triggers, and system results.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/comparison/evaluation-framework/' },
};

export default function ComparisonLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
