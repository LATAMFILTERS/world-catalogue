import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Technologies | ELIMFILTERS Knowledge Center',
  description: 'Explore ELIMFILTERS filtration technologies for air, fuel, lubrication, hydraulic, and cooling-system protection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/technologies/',
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
