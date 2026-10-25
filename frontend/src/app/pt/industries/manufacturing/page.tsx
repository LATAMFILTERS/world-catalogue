import type { Metadata } from 'next';
import { ManufacturingIndustryPage } from '@/components/ManufacturingIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/manufacturing/';
export const metadata: Metadata = { title: "Filtração para manutenção industrial | ELIMFILTERS", description: "Engenharia de filtração para manutenção industrial: circuitos hidráulicos e motores diesel auxiliares, aplicações verificadas e continuidade produtiva.", alternates: { canonical, languages: languageAlternates('/industries/manufacturing') }, openGraph: { title: "Filtração para manutenção industrial | ELIMFILTERS", description: "Engenharia de filtração para manutenção industrial: circuitos hidráulicos e motores diesel auxiliares, aplicações verificadas e continuidade produtiva.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function ManufacturingLocalizedPage() { return <ManufacturingIndustryPage lang="pt" />; }
