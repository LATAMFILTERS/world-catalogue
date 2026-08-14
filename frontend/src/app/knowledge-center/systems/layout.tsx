import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Protection Systems | ELIMFILTERS',
  description: 'Engineering guidance for the five canonical ELIMFILTERS protection systems: Air Intake & Airflow, Fuel Cleanliness, Lubrication, Hydraulic, and Cooling System Protection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-center/systems/',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
