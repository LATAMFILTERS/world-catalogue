import type { Metadata } from 'next';
import { IndustriesLanding } from '@/components/IndustriesLanding';
import { languageAlternates } from '@/lib/localized-routes';

const canonical = 'https://elimfilters.com/pt/industries/';
export const metadata: Metadata = {
  title: "Filtração industrial por setor | ELIMFILTERS",
  description: "Soluções de filtração e controle de contaminação para mineração, agricultura, construção, setor marítimo, geração de energia, transporte e indústria.",
  alternates: { canonical, languages: languageAlternates('/industries') },
  openGraph: { title: "Filtração industrial por setor | ELIMFILTERS", description: "Soluções de filtração e controle de contaminação para mineração, agricultura, construção, setor marítimo, geração de energia, transporte e indústria.", url: canonical, locale: 'pt_BR', siteName: 'ELIMFILTERS', type: 'website' },
};
export default function LocalizedIndustriesPage() {
  return <IndustriesLanding lang="pt" />;
}
