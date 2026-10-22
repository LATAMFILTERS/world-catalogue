import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Filtration Engineering Library | ELIMFILTERS',
  description: 'Engineering articles on contamination control, filtration science, asset protection, diagnostics, and industrial system reliability.',
  alternates: {
    languages: languageAlternates('/knowledge-center/engineering'),
    canonical: 'https://elimfilters.com/knowledge-center/engineering',
  },
};

export default function EngineeringLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
