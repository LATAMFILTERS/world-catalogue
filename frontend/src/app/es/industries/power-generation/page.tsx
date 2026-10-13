import type { Metadata } from 'next';
import { PowerGenerationIndustryPage } from '@/components/PowerGenerationIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/power-generation/';
export const metadata: Metadata = { title: "Filtración de generadores industriales | ELIMFILTERS", description: "Filtración y control de contaminación para generadores de reserva, emergencia y potencia principal.", alternates: { canonical, languages: languageAlternates('/industries/power-generation') }, openGraph: { title: "Filtración de generadores industriales | ELIMFILTERS", description: "Filtración y control de contaminación para generadores de reserva, emergencia y potencia principal.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function PowerGenerationLocalizedPage() { return <PowerGenerationIndustryPage lang="es" />; }
