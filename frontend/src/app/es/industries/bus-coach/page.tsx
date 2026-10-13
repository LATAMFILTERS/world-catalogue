import type { Metadata } from 'next';
import { BusCoachIndustryPage } from '@/components/BusCoachIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/bus-coach/';
export const metadata: Metadata = { title: "Filtración para autobuses y autocares | ELIMFILTERS", description: "Filtración de aire, combustible, aceite, refrigeración, frenos neumáticos y cabina para transporte de pasajeros.", alternates: { canonical, languages: languageAlternates('/industries/bus-coach') }, openGraph: { title: "Filtración para autobuses y autocares | ELIMFILTERS", description: "Filtración de aire, combustible, aceite, refrigeración, frenos neumáticos y cabina para transporte de pasajeros.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function BusCoachLocalizedPage() { return <BusCoachIndustryPage lang="es" />; }
