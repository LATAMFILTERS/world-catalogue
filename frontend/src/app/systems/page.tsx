import type { Metadata } from 'next';
import { SystemsLanding } from '@/components/SystemsLanding';
import { languageAlternates } from '@/lib/localized-routes';

const canonical = 'https://elimfilters.com/systems/';
export const metadata: Metadata = {
  title: 'Asset Protection Systems | ELIMFILTERS',
  description: 'Explore five engineering-led asset protection systems: air intake and airflow, diesel-fuel cleanliness, lubrication, hydraulics and compatible cooling circuits.',
  alternates: { canonical, languages: languageAlternates('/systems') },
  openGraph: {
    title: 'Five Asset Protection Systems | ELIMFILTERS',
    description: 'Understand the contamination pathways, filtration technologies and validated applications behind five ELIMFILTERS asset protection systems.',
    url: canonical, type: 'website', siteName: 'ELIMFILTERS', locale: 'en_US',
    images: [{ url: 'https://elimfilters.com/images/sistems-hero.avif', alt: 'ELIMFILTERS asset protection systems' }]
  }
};

export default function SystemsPage() {
  return <SystemsLanding lang="en" />;
}
