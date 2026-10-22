import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Engineering Reference Library | ELIMFILTERS Knowledge Center',
  description:
    'ELIMFILTERS Engineering Reference Library — 20-section industrial filtration reference covering standards, filtration science, particle science, contamination control, test methods, and reliability engineering.',
  alternates: {
    languages: languageAlternates('/knowledge-center/engineering-reference'),
    canonical: 'https://elimfilters.com/knowledge-center/engineering-reference',
  },
};

export default function EngineeringReferenceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
