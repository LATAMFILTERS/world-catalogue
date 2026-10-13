import type { Metadata } from 'next';
import { AutomotiveIndustryPage } from '@/components/AutomotiveIndustryPage';
import { languageAlternates } from '@/lib/localized-routes';
const canonical = 'https://elimfilters.com/es/industries/automotive/';
export const metadata: Metadata = { title: "Filtración automotriz para vehículos livianos | ELIMFILTERS", description: "Filtros de aire, combustible, aceite y cabina para vehículos de pasajeros, comerciales livianos y flotas.", alternates: { canonical, languages: languageAlternates('/industries/automotive') }, openGraph: { title: "Filtración automotriz para vehículos livianos | ELIMFILTERS", description: "Filtros de aire, combustible, aceite y cabina para vehículos de pasajeros, comerciales livianos y flotas.", url: canonical, locale: 'es_419', type: 'website', siteName: 'ELIMFILTERS' } };
export default function AutomotiveLocalizedPage() { return <AutomotiveIndustryPage lang="es" />; }
