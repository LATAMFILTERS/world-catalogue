import type { Metadata } from 'next';
import { AutomotiveIndustryPage } from '@/components/AutomotiveIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/automotive/';
export const metadata: Metadata = { title: "Filtración para talleres y vehículos livianos | ELIMFILTERS", description: "Ingeniería de filtración para propietarios, talleres y flotas livianas: admisión, combustible, aceite, cabina y compatibilidad por motor, VIN y referencia OEM.", alternates: { canonical, languages: languageAlternates('/industries/automotive') }, openGraph: { title: "Filtración para talleres y vehículos livianos | ELIMFILTERS", description: "Ingeniería de filtración para propietarios, talleres y flotas livianas: admisión, combustible, aceite, cabina y compatibilidad por motor, VIN y referencia OEM.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function AutomotiveLocalizedPage() { return <AutomotiveIndustryPage lang="es" />; }
