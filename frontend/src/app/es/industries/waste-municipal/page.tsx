import type { Metadata } from 'next';
import { WasteMunicipalIndustryPage } from '@/components/WasteMunicipalIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/waste-municipal/';
export const metadata: Metadata = { title: "Filtración para servicios públicos municipales | ELIMFILTERS", description: "Protección de flotas de recolección, saneamiento y obras públicas para operadores, supervisores, ingenieros y técnicos de mantenimiento municipal.", alternates: { canonical, languages: languageAlternates('/industries/waste-municipal') }, openGraph: { title: "Filtración para servicios públicos municipales | ELIMFILTERS", description: "Protección de flotas de recolección, saneamiento y obras públicas para operadores, supervisores, ingenieros y técnicos de mantenimiento municipal.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function WasteMunicipalLocalizedPage() { return <WasteMunicipalIndustryPage lang="es" />; }
