import type { Metadata } from 'next';
import { RailwayIndustryPage } from '@/components/RailwayIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/railway/';
export const metadata: Metadata = { title: "Filtração para manutenção ferroviária | ELIMFILTERS", description: "Filtração para operadores ferroviários, engenheiros e técnicos de oficina: admissão, diesel, lubrificação e hidráulica auxiliar com aplicação verificada.", alternates: { canonical, languages: languageAlternates('/industries/railway') }, openGraph: { title: "Filtração para manutenção ferroviária | ELIMFILTERS", description: "Filtração para operadores ferroviários, engenheiros e técnicos de oficina: admissão, diesel, lubrificação e hidráulica auxiliar com aplicação verificada.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function RailwayLocalizedPage(){return <RailwayIndustryPage lang="pt" />;}
