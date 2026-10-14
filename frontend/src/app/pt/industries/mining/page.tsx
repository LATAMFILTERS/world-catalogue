import type { Metadata } from 'next';
import { MiningIndustryPageV2 } from '@/components/MiningIndustryPageV2';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/mining/';
export const metadata: Metadata = {
  title: "Filtração para mineração e equipamentos pesados | ELIMFILTERS",
  description: "Controle de contaminação de ar, combustível, óleo e sistemas hidráulicos para caminhões fora de estrada, escavadeiras e equipamentos de mineração.",
  alternates: { canonical, languages: languageAlternates('/industries/mining') },
  openGraph: { title: "Filtração para mineração e equipamentos pesados | ELIMFILTERS", description: "Controle de contaminação de ar, combustível, óleo e sistemas hidráulicos para caminhões fora de estrada, escavadeiras e equipamentos de mineração.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'pt_BR' },
};
export default function MiningLocalizedPage() { return <MiningIndustryPageV2 lang="pt" />; }
