import type { Metadata } from 'next';
import { SystemsLanding } from '@/components/SystemsLanding';
import { languageAlternates } from '@/lib/localized-routes';

const canonical = 'https://elimfilters.com/pt/systems/';
export const metadata: Metadata = {
  title: 'Sistemas de proteção de ativos | ELIMFILTERS',
  description: 'Cinco sistemas técnicos de proteção de ativos: admissão e fluxo de ar, limpeza do diesel, lubrificação, hidráulica e arrefecimento compatível.',
  alternates: { canonical, languages: languageAlternates('/systems') },
  openGraph: {
    title: 'Cinco sistemas de proteção de ativos | ELIMFILTERS',
    description: 'Conheça as vias de contaminação, tecnologias de filtração e aplicações verificadas da arquitetura ELIMFILTERS.',
    url: canonical, type: 'website', siteName: 'ELIMFILTERS', locale: 'pt_BR',
    images: [{ url: 'https://elimfilters.com/images/sistems-hero.avif', alt: 'Sistemas de proteção de ativos ELIMFILTERS' }]
  }
};

export default function SistemasPage() {
  return <SystemsLanding lang="pt" />;
}
