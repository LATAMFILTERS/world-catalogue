import type { Metadata } from 'next';
import { MicrokappaStablePage } from '@/components/MicrokappaStablePage';

export const metadata: Metadata = {
  title: 'MICROKAPPA™ Cabin Air Filtration Technology | ELIMFILTERS',
  description: 'MICROKAPPA™ is the ELIMFILTERS cabin air filtration architecture for controlling airborne dust, pollen and fine particulate matter while balancing HVAC airflow resistance.',
  keywords: ['MICROKAPPA','cabin air filtration technology','cabin air filter','HVAC filtration','pollen filtration','fine particulate matter','cabin filter airflow resistance','commercial fleet cabin filter','heavy duty cabin filter','ELIMFILTERS'],
  alternates: { canonical: 'https://elimfilters.com/technologies/microkappa/' },
  openGraph: { title: 'MICROKAPPA™ Cabin Air Filtration Technology | ELIMFILTERS', description: 'Cabin air filtration architecture balancing particle retention, HVAC airflow resistance and sealing integrity.', url: 'https://elimfilters.com/technologies/microkappa/', type: 'website', siteName: 'ELIMFILTERS', images: [{ url: 'https://elimfilters.com/images/cabin-hero.avif', width: 1200, height: 630, alt: 'MICROKAPPA cabin air filtration technology' }] },
  twitter: { card: 'summary_large_image', title: 'MICROKAPPA™ Cabin Air Filtration Technology | ELIMFILTERS', description: 'Cabin air filtration architecture for particulate control and HVAC airflow management.', images: ['https://elimfilters.com/images/cabin-hero.avif'] },
};

export default function MicrokappaPage(){ return <MicrokappaStablePage/>; }
