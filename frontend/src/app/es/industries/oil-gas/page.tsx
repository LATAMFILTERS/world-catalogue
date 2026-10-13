import type { Metadata } from 'next';
import { OilGasIndustryPage } from '@/components/OilGasIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/oil-gas/';
export const metadata: Metadata = { title: "Filtración industrial para petróleo y gas | ELIMFILTERS", description: "Control de contaminación en perforación, compresores, bombas, sistemas hidráulicos y equipos de campo.", alternates: { canonical, languages: languageAlternates('/industries/oil-gas') }, openGraph: { title: "Filtración industrial para petróleo y gas | ELIMFILTERS", description: "Control de contaminación en perforación, compresores, bombas, sistemas hidráulicos y equipos de campo.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function OilGasLocalizedPage() { return <OilGasIndustryPage lang="es" />; }
