import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';
import PartnersClient from '@/app/partners/PartnersClient';

export const metadata: Metadata = {
  title: 'Socios Comerciales | ELIMFILTERS',
  description: 'Explore nuevas oportunidades de negocio, decisiones comerciales más ágiles y mayor valor para sus clientes con ELIMFILTERS.',
  alternates: { canonical: 'https://elimfilters.com/es/partners/', languages: languageAlternates('/partners') },
  robots: { index: false, follow: false },
};

export default function PartnersPageEs() {
  return <PartnersClient />;
}
