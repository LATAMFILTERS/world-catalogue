import type { Metadata } from 'next';
import { ManufacturingIndustryPage } from '@/components/ManufacturingIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/manufacturing/';
export const metadata: Metadata = { title: "Filtración para mantenimiento de manufactura | ELIMFILTERS", description: "Ingeniería de filtración para mantenimiento de planta: circuitos hidráulicos y motores diésel auxiliares, aplicaciones verificadas y continuidad productiva.", alternates: { canonical, languages: languageAlternates('/industries/manufacturing') }, openGraph: { title: "Filtración para mantenimiento de manufactura | ELIMFILTERS", description: "Ingeniería de filtración para mantenimiento de planta: circuitos hidráulicos y motores diésel auxiliares, aplicaciones verificadas y continuidad productiva.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function ManufacturingLocalizedPage() { return <ManufacturingIndustryPage lang="es" />; }
