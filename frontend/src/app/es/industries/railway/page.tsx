import type { Metadata } from 'next';
import { RailwayIndustryPage } from '@/components/RailwayIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/railway/';
export const metadata: Metadata = { title: "Filtración ferroviaria para locomotoras | ELIMFILTERS", description: "Filtración de aire, combustible, lubricación e hidráulica para locomotoras y equipos auxiliares ferroviarios.", alternates: { canonical, languages: languageAlternates('/industries/railway') }, openGraph: { title: "Filtración ferroviaria para locomotoras | ELIMFILTERS", description: "Filtración de aire, combustible, lubricación e hidráulica para locomotoras y equipos auxiliares ferroviarios.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function RailwayLocalizedPage(){return <RailwayIndustryPage lang="es" />;}
