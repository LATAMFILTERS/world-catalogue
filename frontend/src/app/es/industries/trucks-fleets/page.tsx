import type { Metadata } from 'next';
import { TrucksFleetsIndustryPage } from '@/components/TrucksFleetsIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/trucks-fleets/';
export const metadata: Metadata = { title: "Filtración para flotas de camiones | ELIMFILTERS", description: "Filtros de aire, combustible, aceite, refrigerante, aire comprimido y cabina para flotas comerciales y camiones de servicio pesado.", alternates: { canonical, languages: languageAlternates('/industries/trucks-fleets') }, openGraph: { title: "Filtración para flotas de camiones | ELIMFILTERS", description: "Filtros de aire, combustible, aceite, refrigerante, aire comprimido y cabina para flotas comerciales y camiones de servicio pesado.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function TrucksFleetsLocalizedPage() { return <TrucksFleetsIndustryPage lang="es" />; }
