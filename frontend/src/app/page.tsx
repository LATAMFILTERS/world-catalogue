import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { languageAlternates } from '@/lib/localized-routes';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    languages: languageAlternates('/'),
  },
};

export default function Page() {
  return <HomePage />;
}
