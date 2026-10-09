
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Socios Comerciales | ELIMFILTERS',
  description: 'Explore nuevas oportunidades de negocio, decisiones comerciales más ágiles y mayor valor para sus clientes con ELIMFILTERS.',
  robots: { index: false, follow: false },
};


import PartnersClient from './PartnersClient';

export default function PartnersPage() {
  return <PartnersClient />;
}
