import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Filtration Engineering Comparisons | ELIMFILTERS',
  description: 'Technical comparisons of filtration standards, efficiency metrics, cleanliness codes, and engineering selection criteria.',
  alternates: { canonical: 'https://elimfilters.com/knowledge-center/comparisons', languages: languageAlternates('/knowledge-center/comparisons') },
};

export default function ComparisonsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
