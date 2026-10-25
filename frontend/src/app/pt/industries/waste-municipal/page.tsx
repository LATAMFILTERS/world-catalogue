import type { Metadata } from 'next';
import { WasteMunicipalIndustryPage } from '@/components/WasteMunicipalIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/waste-municipal/';
export const metadata: Metadata = { title: "Filtração para serviços públicos municipais | ELIMFILTERS", description: "Proteção de frotas de coleta, saneamento e obras públicas para operadores, supervisores, engenheiros e técnicos de manutenção municipal.", alternates: { canonical, languages: languageAlternates('/industries/waste-municipal') }, openGraph: { title: "Filtração para serviços públicos municipais | ELIMFILTERS", description: "Proteção de frotas de coleta, saneamento e obras públicas para operadores, supervisores, engenheiros e técnicos de manutenção municipal.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function WasteMunicipalLocalizedPage() { return <WasteMunicipalIndustryPage lang="pt" />; }
