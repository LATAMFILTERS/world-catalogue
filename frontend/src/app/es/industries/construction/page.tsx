import type { Metadata } from 'next';
import { ConstructionIndustryPage } from '@/components/ConstructionIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/construction/';
export const metadata: Metadata = { title: "Filtración de maquinaria para construcción | ELIMFILTERS", description: "Control de contaminación para excavadoras, cargadoras, topadoras, motoniveladoras y equipos de construcción con servicio severo.", alternates: { canonical, languages: languageAlternates('/industries/construction') }, openGraph: { title: "Filtración de maquinaria para construcción | ELIMFILTERS", description: "Control de contaminación para excavadoras, cargadoras, topadoras, motoniveladoras y equipos de construcción con servicio severo.", type: 'website', siteName: 'ELIMFILTERS', url: canonical, locale: 'es_419' } };
export default function ConstructionLocalizedPage() { return <ConstructionIndustryPage lang="es" />; }
