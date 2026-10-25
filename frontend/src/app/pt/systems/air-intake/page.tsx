import type { Metadata } from 'next';
import { AirIntakeSystemPage } from '@/components/AirIntakeSystemPage';
import { languageAlternates } from '@/lib/localized-routes';
const URL = 'https://elimfilters.com/pt/systems/air-intake/';
export const metadata: Metadata = {
  title: 'Engenharia da admissão e fluxo de ar | ELIMFILTERS',
  description: 'Arquiteturas tecnológicas MACROCORE™, INTEKCORE™, MICROKAPPA™ e DRYCORE™: contaminação do ar, vedação, admissão, HVAC, secagem pneumática e validação OEM.',
  alternates: { canonical: URL, languages: languageAlternates('/systems/air-intake') },
  openGraph: { title: 'Proteção da admissão e fluxo de ar | ELIMFILTERS', url: URL, description: 'Engenharia de filtração e proteção de ativos para quatro circuitos de ar com tecnologias próprias e aplicações verificadas.', type: 'website', siteName: 'ELIMFILTERS', locale: 'pt_BR', images: [{ url: 'https://elimfilters.com/images/carcasa.jd.avif', alt: 'Carcaça de admissão de ar industrial' }] }
};
export default function AdmissaoDeArPage() {
  return <AirIntakeSystemPage lang="pt" />;
}
