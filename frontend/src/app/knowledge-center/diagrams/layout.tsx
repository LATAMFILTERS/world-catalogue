import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Engineering Diagrams — ELIMFILTERS Knowledge Center',
  description:
    'Standards-accurate engineering diagrams covering ISO 16889 filter test circuits, ISO 4406 cleanliness scales, hydraulic contamination paths, lubrication oil circuits, fuel filtration stages, and more.',
  alternates: {
    languages: languageAlternates('/knowledge-center/diagrams'),
    canonical: 'https://elimfilters.com/knowledge-center/diagrams',
  },
};

export default function DiagramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
