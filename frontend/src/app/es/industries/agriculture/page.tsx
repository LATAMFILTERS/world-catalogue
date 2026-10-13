import type { Metadata } from 'next';
import { AgricultureIndustryPage } from '@/components/AgricultureIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/agriculture/';
export const metadata: Metadata = {
  title: "Filtración agrícola para tractores y cosechadoras | ELIMFILTERS",
  description: "Filtración para tractores, cosechadoras, pulverizadoras, motores de riego y equipos agrícolas. Control de contaminación y protección de activos en ciclos estacionales.",
  alternates: { canonical, languages: languageAlternates('/industries/agriculture') },
  openGraph: { title: "Filtración agrícola para tractores y cosechadoras | ELIMFILTERS", description: "Filtración para tractores, cosechadoras, pulverizadoras, motores de riego y equipos agrícolas. Control de contaminación y protección de activos en ciclos estacionales.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'es_419' },
};
export default function AgricultureLocalizedPage() { return <AgricultureIndustryPage lang="es" />; }
