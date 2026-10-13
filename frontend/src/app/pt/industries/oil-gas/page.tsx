import type { Metadata } from 'next';
import { OilGasIndustryPage } from '@/components/OilGasIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/oil-gas/';
export const metadata: Metadata = { title: "Filtração industrial para petróleo e gás | ELIMFILTERS", description: "Controle de contaminação em perfuração, compressores, bombas, sistemas hidráulicos e equipamentos de campo.", alternates: { canonical, languages: languageAlternates('/industries/oil-gas') }, openGraph: { title: "Filtração industrial para petróleo e gás | ELIMFILTERS", description: "Controle de contaminação em perfuração, compressores, bombas, sistemas hidráulicos e equipamentos de campo.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function OilGasLocalizedPage() { return <OilGasIndustryPage lang="pt" />; }
