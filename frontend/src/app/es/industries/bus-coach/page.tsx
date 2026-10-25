import type { Metadata } from 'next';
import { BusCoachIndustryPage } from '@/components/BusCoachIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/bus-coach/';
export const metadata: Metadata = { title: "Filtración para autobuses y autocares | ELIMFILTERS", description: "Filtración para operadores y técnicos de transporte de pasajeros: motores diésel, separación de agua, lubricación, secadores neumáticos, climatización y refrigeración compatible.", alternates: { canonical, languages: languageAlternates('/industries/bus-coach') }, openGraph: { title: "Filtración para autobuses y autocares | ELIMFILTERS", description: "Filtración para operadores y técnicos de transporte de pasajeros: motores diésel, separación de agua, lubricación, secadores neumáticos, climatización y refrigeración compatible.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function BusCoachLocalizedPage() { return <BusCoachIndustryPage lang="es" />; }
