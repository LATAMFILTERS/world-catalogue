import type { Metadata } from 'next';
import { PowerGenerationIndustryPage } from '@/components/PowerGenerationIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/power-generation/';
export const metadata: Metadata = { title: "Filtración para generadores y mantenimiento | ELIMFILTERS", description: "Protección de combustible diésel, aire y lubricación para ingenieros y técnicos de mantenimiento de grupos electrógenos de reserva y potencia principal.", alternates: { canonical, languages: languageAlternates('/industries/power-generation') }, openGraph: { title: "Filtración para generadores y mantenimiento | ELIMFILTERS", description: "Protección de combustible diésel, aire y lubricación para ingenieros y técnicos de mantenimiento de grupos electrógenos de reserva y potencia principal.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function PowerGenerationLocalizedPage() { return <PowerGenerationIndustryPage lang="es" />; }
