import type { Metadata } from 'next';
import { AirIntakeSystemPage } from '@/components/AirIntakeSystemPage';
import { languageAlternates } from '@/lib/localized-routes';
const URL = 'https://elimfilters.com/es/systems/air-intake/';
export const metadata: Metadata = {
  title: 'Ingeniería de admisión y flujo de aire | ELIMFILTERS',
  description: 'Arquitecturas tecnológicas MACROCORE™, INTEKCORE™, MICROKAPPA™ y DRYCORE™: contaminación del aire, sellado, admisión, HVAC, secado neumático y validación OEM.',
  alternates: { canonical: URL, languages: languageAlternates('/systems/air-intake') },
  openGraph: { title: 'Protección de admisión y flujo de aire | ELIMFILTERS', url: URL, description: 'Ingeniería de filtración y protección de activos para cuatro circuitos de aire con tecnologías propias y aplicaciones verificadas.', type: 'website', siteName: 'ELIMFILTERS', locale: 'es_419', images: [{ url: 'https://elimfilters.com/images/carcasa.jd.avif', alt: 'Carcasa de admisión de aire industrial' }] }
};
export default function AdmisionDeAirePage() {
  return <AirIntakeSystemPage lang="es" />;
}
