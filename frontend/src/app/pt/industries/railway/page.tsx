import type { Metadata } from 'next';
import { RailwayIndustryPage } from '@/components/RailwayIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/railway/';
export const metadata: Metadata = { title: "Filtração ferroviária para locomotivas | ELIMFILTERS", description: "Filtração de ar, combustível, lubrificação e hidráulica para locomotivas e equipamentos auxiliares ferroviários.", alternates: { canonical, languages: languageAlternates('/industries/railway') }, openGraph: { title: "Filtração ferroviária para locomotivas | ELIMFILTERS", description: "Filtração de ar, combustível, lubrificação e hidráulica para locomotivas e equipamentos auxiliares ferroviários.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function RailwayLocalizedPage(){return <RailwayIndustryPage lang="pt" />;}
