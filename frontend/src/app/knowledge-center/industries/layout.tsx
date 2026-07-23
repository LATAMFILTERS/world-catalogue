import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration by Industry | ELIMFILTERS Knowledge Center',
  description: 'Engineering guidance for filtration challenges across mining, agriculture, construction, transportation, marine, energy, and manufacturing.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/industries',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
