import type { Metadata } from 'next';
import { ManufacturingIndustryPage } from '@/components/ManufacturingIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/manufacturing/';
export const metadata: Metadata = { title: "Filtração industrial para manufatura | ELIMFILTERS", description: "Controle de contaminação para unidades hidráulicas, compressores, bombas e máquinas de produção.", alternates: { canonical, languages: languageAlternates('/industries/manufacturing') }, openGraph: { title: "Filtração industrial para manufatura | ELIMFILTERS", description: "Controle de contaminação para unidades hidráulicas, compressores, bombas e máquinas de produção.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function ManufacturingLocalizedPage() { return <ManufacturingIndustryPage lang="pt" />; }
