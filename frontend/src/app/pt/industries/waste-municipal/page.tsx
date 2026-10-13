import type { Metadata } from 'next';
import { WasteMunicipalIndustryPage } from '@/components/WasteMunicipalIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/waste-municipal/';
export const metadata: Metadata = { title: "Filtração para frotas municipais e resíduos | ELIMFILTERS", description: "Filtração de caminhões coletores, varredeiras, caminhões de vácuo e equipamentos municipais de serviço severo.", alternates: { canonical, languages: languageAlternates('/industries/waste-municipal') }, openGraph: { title: "Filtração para frotas municipais e resíduos | ELIMFILTERS", description: "Filtração de caminhões coletores, varredeiras, caminhões de vácuo e equipamentos municipais de serviço severo.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function WasteMunicipalLocalizedPage() { return <WasteMunicipalIndustryPage lang="pt" />; }
