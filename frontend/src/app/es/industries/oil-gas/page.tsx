import type { Metadata } from 'next';
import { OilGasIndustryPage } from '@/components/OilGasIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/oil-gas/';
export const metadata: Metadata = { title: "Filtración para mantenimiento petrolero y gasífero | ELIMFILTERS", description: "Ingeniería de filtración para mantenimiento de equipos petroleros y gasíferos: protección hidráulica, combustible diésel, admisión y lubricación.", alternates: { canonical, languages: languageAlternates('/industries/oil-gas') }, openGraph: { title: "Filtración para mantenimiento petrolero y gasífero | ELIMFILTERS", description: "Ingeniería de filtración para mantenimiento de equipos petroleros y gasíferos: protección hidráulica, combustible diésel, admisión y lubricación.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function OilGasLocalizedPage() { return <OilGasIndustryPage lang="es" />; }
