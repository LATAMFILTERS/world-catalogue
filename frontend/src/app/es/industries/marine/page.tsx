import type { Metadata } from 'next';
import { MarineIndustryPage } from '@/components/MarineIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/marine/';
export const metadata: Metadata = { title: "Filtración marina y separación de agua | ELIMFILTERS", description: "Control de contaminación para buques, motores marinos, propulsión, cubierta, combustible e hidráulica.", alternates: { canonical, languages: languageAlternates('/industries/marine') }, openGraph: { title: "Filtración marina y separación de agua | ELIMFILTERS", description: "Control de contaminación para buques, motores marinos, propulsión, cubierta, combustible e hidráulica.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function MarineLocalizedPage() { return <MarineIndustryPage lang="es" />; }
