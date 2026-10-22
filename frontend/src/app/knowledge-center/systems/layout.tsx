import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  title: 'Asset Protection Systems | ELIMFILTERS',
  description: 'Engineering guidance for air intake, fuel, lubrication, hydraulic, and cooling-system protection in industrial assets.',
  alternates: {
    languages: languageAlternates('/knowledge-center/systems'),
    canonical: 'https://elimfilters.com/knowledge-center/systems/',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
