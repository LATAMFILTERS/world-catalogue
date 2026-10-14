import type { Metadata } from 'next';
import { WasteMunicipalIndustryPage } from '@/components/WasteMunicipalIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/waste-municipal/';
export const metadata: Metadata = { title: "Filtración para flotas municipales y residuos | ELIMFILTERS", description: "Filtración de vehículos recolectores, barredoras, camiones de vacío y maquinaria municipal de servicio severo.", alternates: { canonical, languages: languageAlternates('/industries/waste-municipal') }, openGraph: { title: "Filtración para flotas municipales y residuos | ELIMFILTERS", description: "Filtración de vehículos recolectores, barredoras, camiones de vacío y maquinaria municipal de servicio severo.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function WasteMunicipalLocalizedPage() { return <WasteMunicipalIndustryPage lang="es" />; }
