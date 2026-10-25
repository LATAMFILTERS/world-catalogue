import type { Metadata } from 'next';
import { SystemsLanding } from '@/components/SystemsLanding';
import { languageAlternates } from '@/lib/localized-routes';

const canonical = 'https://elimfilters.com/es/systems/';
export const metadata: Metadata = {
  title: 'Sistemas de protección de activos | ELIMFILTERS',
  description: 'Cinco sistemas técnicos de protección de activos: admisión y flujo de aire, limpieza del combustible diésel, lubricación, hidráulica y refrigeración compatible.',
  alternates: { canonical, languages: languageAlternates('/systems') },
  openGraph: {
    title: 'Cinco sistemas de protección de activos | ELIMFILTERS',
    description: 'Conozca las vías de contaminación, tecnologías de filtración y aplicaciones verificadas que integran la arquitectura ELIMFILTERS.',
    url: canonical, type: 'website', siteName: 'ELIMFILTERS', locale: 'es_419',
    images: [{ url: 'https://elimfilters.com/images/sistems-hero.avif', alt: 'Sistemas de protección de activos ELIMFILTERS' }]
  }
};

export default function SistemasPage() {
  return <SystemsLanding lang="es" />;
}
