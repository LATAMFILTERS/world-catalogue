import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Engineering Learning Paths | ELIMFILTERS',
  description: 'Structured learning paths for hydraulic filtration, lubrication engineering, fuel cleanliness, air intake, and contamination control.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/learning-paths' },
};

export default function LearningPathsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
