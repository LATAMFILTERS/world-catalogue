import type { Metadata } from 'next';
import { AgricultureIndustryPage } from '@/components/AgricultureIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/pt/industries/agriculture/';
export const metadata: Metadata = {
  title: "Filtração agrícola para tratores e colheitadeiras | ELIMFILTERS",
  description: "Filtração para tratores, colheitadeiras, pulverizadores, motores de irrigação e equipamentos agrícolas. Controle de contaminação e proteção de ativos em ciclos sazonais.",
  alternates: { canonical, languages: languageAlternates('/industries/agriculture') },
  openGraph: { title: "Filtração agrícola para tratores e colheitadeiras | ELIMFILTERS", description: "Filtração para tratores, colheitadeiras, pulverizadores, motores de irrigação e equipamentos agrícolas. Controle de contaminação e proteção de ativos em ciclos sazonais.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'pt_BR' },
};
export default function AgricultureLocalizedPage() { return <AgricultureIndustryPage lang="pt" />; }
