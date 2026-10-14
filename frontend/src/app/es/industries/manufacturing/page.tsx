import type { Metadata } from 'next';
import { ManufacturingIndustryPage } from '@/components/ManufacturingIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/manufacturing/';
export const metadata: Metadata = { title: "Filtración industrial para manufactura | ELIMFILTERS", description: "Control de contaminación para unidades hidráulicas, compresores, bombas y maquinaria de producción.", alternates: { canonical, languages: languageAlternates('/industries/manufacturing') }, openGraph: { title: "Filtración industrial para manufactura | ELIMFILTERS", description: "Control de contaminación para unidades hidráulicas, compresores, bombas y maquinaria de producción.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function ManufacturingLocalizedPage() { return <ManufacturingIndustryPage lang="es" />; }
