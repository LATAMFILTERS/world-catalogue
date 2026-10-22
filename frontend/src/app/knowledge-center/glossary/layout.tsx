import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Engineering Terminology Glossary | ELIMFILTERS Knowledge Center',
  description:
    'Canonical definitions for filtration engineering terms. Each term carries a permanent TERM-xxx identifier and is referenced by ID across all Knowledge Center content.',
  alternates: {
    languages: languageAlternates('/knowledge-center/glossary'),
    canonical: 'https://elimfilters.com/knowledge-center/glossary/',
  },
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
