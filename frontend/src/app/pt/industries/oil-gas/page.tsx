import type { Metadata } from 'next';
import { OilGasIndustryPage } from '@/components/OilGasIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/oil-gas/';
export const metadata: Metadata = { title: "Filtração para manutenção em petróleo e gás | ELIMFILTERS", description: "Engenharia de filtração para manutenção em petróleo e gás: proteção hidráulica, combustível diesel, admissão e lubrificação de equipamentos.", alternates: { canonical, languages: languageAlternates('/industries/oil-gas') }, openGraph: { title: "Filtração para manutenção em petróleo e gás | ELIMFILTERS", description: "Engenharia de filtração para manutenção em petróleo e gás: proteção hidráulica, combustível diesel, admissão e lubrificação de equipamentos.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function OilGasLocalizedPage() { return <OilGasIndustryPage lang="pt" />; }
