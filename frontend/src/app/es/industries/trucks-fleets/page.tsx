import type { Metadata } from 'next';
import { TrucksFleetsIndustryPage } from '@/components/TrucksFleetsIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/trucks-fleets/';
export const metadata: Metadata = { title: "Filtración y mantenimiento de flotas | ELIMFILTERS", description: "Filtración para responsables de flotas, ingenieros y técnicos: combustible diésel, aire, lubricación y filtros de refrigeración, secado neumático y cabina solo en aplicaciones OEM verificadas.", alternates: { canonical, languages: languageAlternates('/industries/trucks-fleets') }, openGraph: { title: "Filtración y mantenimiento de flotas | ELIMFILTERS", description: "Filtración para responsables de flotas, ingenieros y técnicos: combustible diésel, aire, lubricación y filtros de refrigeración, secado neumático y cabina solo en aplicaciones OEM verificadas.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function TrucksFleetsLocalizedPage() { return <TrucksFleetsIndustryPage lang="es" />; }
