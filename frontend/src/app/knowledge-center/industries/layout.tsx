import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Filtration by Industry | ELIMFILTERS Knowledge Center',
  description: 'Engineering guidance for filtration challenges across mining, agriculture, construction, transportation, marine, energy, and manufacturing.',
  alternates: {
    languages: languageAlternates('/knowledge-center/industries'),
    canonical: 'https://elimfilters.com/knowledge-center/industries/',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
