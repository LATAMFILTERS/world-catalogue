import type { Metadata } from 'next';
import { MarineIndustryPage } from '@/components/MarineIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/marine/';
export const metadata: Metadata = { title: "Filtración marina para propietarios e ingenieros | ELIMFILTERS", description: "Filtración para propietarios de embarcaciones, ingenieros y técnicos de mantenimiento: motores de propulsión, diésel, hidráulica de cubierta y sistemas auxiliares.", alternates: { canonical, languages: languageAlternates('/industries/marine') }, openGraph: { title: "Filtración marina para propietarios e ingenieros | ELIMFILTERS", description: "Filtración para propietarios de embarcaciones, ingenieros y técnicos de mantenimiento: motores de propulsión, diésel, hidráulica de cubierta y sistemas auxiliares.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function MarineLocalizedPage() { return <MarineIndustryPage lang="es" />; }
