import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';
import PartnersClient from '@/app/partners/PartnersClient';

export const metadata: Metadata = {
  title: 'Parceiros Comerciais | ELIMFILTERS',
  description: 'Explore novas oportunidades de negócio, decisões comerciais mais ágeis e mais valor para seus clientes com a ELIMFILTERS.',
  alternates: { canonical: 'https://elimfilters.com/pt/partners/', languages: languageAlternates('/partners') },
  robots: { index: false, follow: false },
};

export default function PartnersPagePt() {
  return <PartnersClient />;
}
