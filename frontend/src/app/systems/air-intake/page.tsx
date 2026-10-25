import type { Metadata } from 'next';
import { AirIntakeSystemPage } from '@/components/AirIntakeSystemPage';
import { languageAlternates } from '@/lib/localized-routes';

const URL = 'https://elimfilters.com/systems/air-intake/';
export const metadata: Metadata = {
  title: 'Air Intake & Airflow Engineering | ELIMFILTERS',
  description: 'Technical architecture of MACROCORE™, INTEKCORE™, MICROKAPPA™ and DRYCORE™: engineering roles, airflow contamination boundaries, OEM fitment and applicable testing domains.',
  keywords: ['ELIMFILTERS air intake protection','MACROCORE','INTEKCORE','MICROKAPPA','DRYCORE','engine air intake filtration','air cleaner sealing','cabin HVAC filtration','pneumatic air drying','ISO 5011','ISO 11155-1','ISO 8573-1'],
  alternates: { canonical: URL, languages: languageAlternates('/systems/air-intake') },
  openGraph: {
    title: 'Air Intake & Airflow Protection | ELIMFILTERS',
    description: 'Four ELIMFILTERS technology architectures for engine intake, housing interfaces, cabin HVAC and applicable compressed-air drying.',
    url: URL, type: 'website', siteName: 'ELIMFILTERS', locale: 'en_US',
    images: [{ url: 'https://elimfilters.com/images/carcasa.jd.avif', alt: 'Engine air-cleaner housing and airflow protection' }]
  }
};
export default function AirIntakePage() {
  return <AirIntakeSystemPage lang="en" />;
}
