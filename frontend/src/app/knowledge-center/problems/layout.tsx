import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Contamination Failure Modes | ELIMFILTERS',
  description: 'Technical guidance on contamination-driven failure modes, affected components, root causes, and filtration-control strategies.',
  alternates: {
    languages: languageAlternates('/knowledge-center/problems'),
    canonical: 'https://elimfilters.com/knowledge-center/problems/',
  },
};

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
