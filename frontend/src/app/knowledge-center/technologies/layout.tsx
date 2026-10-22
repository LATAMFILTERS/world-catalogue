import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Filtration Technologies | ELIMFILTERS Knowledge Center',
  description: 'Explore ELIMFILTERS filtration technologies for air, fuel, lubrication, hydraulic, and cooling-system protection.',
  alternates: {
    languages: languageAlternates('/knowledge-center/technologies'),
    canonical: 'https://elimfilters.com/knowledge-center/technologies/',
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
