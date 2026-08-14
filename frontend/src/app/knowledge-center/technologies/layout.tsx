import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Technologies | ELIMFILTERS Knowledge Center',
  description: 'Explore the nine canonical ELIMFILTERS core filtration technologies mapped to Air Intake & Airflow, Fuel Cleanliness, Lubrication, Hydraulic, and Cooling System Protection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/technologies/',
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
