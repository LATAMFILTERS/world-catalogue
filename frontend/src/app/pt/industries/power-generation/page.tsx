import type { Metadata } from 'next';
import { PowerGenerationIndustryPage } from '@/components/PowerGenerationIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/power-generation/';
export const metadata: Metadata = { title: "Filtração de geradores industriais | ELIMFILTERS", description: "Filtração e controle de contaminação para geradores de reserva, emergência e geração principal.", alternates: { canonical, languages: languageAlternates('/industries/power-generation') }, openGraph: { title: "Filtração de geradores industriais | ELIMFILTERS", description: "Filtração e controle de contaminação para geradores de reserva, emergência e geração principal.", url: canonical, locale: 'pt_BR', type: 'website', siteName: 'ELIMFILTERS' } };
export default function PowerGenerationLocalizedPage() { return <PowerGenerationIndustryPage lang="pt" />; }
