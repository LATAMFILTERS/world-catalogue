import type { Metadata } from 'next';
import IndustriesPage from '@/app/industries/page';
import { languageAlternates } from '@/lib/localized-routes';

const canonical = 'https://elimfilters.com/es/industries/';
export const metadata: Metadata = {
  title: "Filtración industrial por industria | ELIMFILTERS",
  description: "Soluciones de filtración y control de contaminación para minería, agricultura, construcción, marina, generación eléctrica, transporte e industria.",
  alternates: { canonical, languages: languageAlternates('/industries') },
  openGraph: { title: "Filtración industrial por industria | ELIMFILTERS", description: "Soluciones de filtración y control de contaminación para minería, agricultura, construcción, marina, generación eléctrica, transporte e industria.", url: canonical, locale: 'es_419', siteName: 'ELIMFILTERS', type: 'website' },
};
export default function LocalizedIndustriesPage() {
  return <IndustriesPage lang="es" />;
}
