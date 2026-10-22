import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Filtration Standards Library | ELIMFILTERS',
  description: 'Technical guidance for ISO, SAE, ASTM, DIN, NFPA, and related filtration and contamination-control standards.',
  alternates: {
    languages: languageAlternates('/knowledge-center/standards'),
    canonical: 'https://elimfilters.com/knowledge-center/standards/',
  },
};

export default function StandardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
