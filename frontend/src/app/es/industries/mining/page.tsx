import type { Metadata } from 'next';
import { MiningIndustryPageV2 } from '@/components/MiningIndustryPageV2';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/mining/';
export const metadata: Metadata = {
  title: "Filtración minera para equipos de servicio severo | ELIMFILTERS",
  description: "Control de contaminación de aire, combustible, aceite y sistemas hidráulicos para camiones de acarreo, excavadoras y equipos mineros.",
  alternates: { canonical, languages: languageAlternates('/industries/mining') },
  openGraph: { title: "Filtración minera para equipos de servicio severo | ELIMFILTERS", description: "Control de contaminación de aire, combustible, aceite y sistemas hidráulicos para camiones de acarreo, excavadoras y equipos mineros.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'es_419' },
};
export default function MiningLocalizedPage() { return <MiningIndustryPageV2 lang="es" />; }
