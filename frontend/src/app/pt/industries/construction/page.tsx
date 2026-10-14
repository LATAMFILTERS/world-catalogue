import type { Metadata } from 'next';
import { ConstructionIndustryPage } from '@/components/ConstructionIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/construction/';
export const metadata: Metadata = { title: "Filtração para máquinas de construção | ELIMFILTERS", description: "Controle de contaminação para escavadeiras, carregadeiras, tratores de esteira, motoniveladoras e equipamentos de construção em serviço severo.", alternates: { canonical, languages: languageAlternates('/industries/construction') }, openGraph: { title: "Filtração para máquinas de construção | ELIMFILTERS", description: "Controle de contaminação para escavadeiras, carregadeiras, tratores de esteira, motoniveladoras e equipamentos de construção em serviço severo.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'pt_BR' } };
export default function ConstructionLocalizedPage() { return <ConstructionIndustryPage lang="pt" />; }
