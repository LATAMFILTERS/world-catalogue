import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Diagrams — ELIMFILTERS Knowledge Center',
  description:
    'Standards-accurate engineering diagrams covering ISO 16889 filter test circuits, ISO 4406 cleanliness scales, hydraulic contamination paths, lubrication oil circuits, fuel filtration stages, and more.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/diagrams',
  },
};

export default function DiagramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
