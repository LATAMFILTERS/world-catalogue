import type { Metadata } from 'next';
import { HydrocoreLocalizedPage } from '@/components/HydrocoreLocalizedPage';
import { languageAlternates } from '@/lib/localized-routes';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/pt/technologies/hydrocore/`;
const HERO = `${BASE_URL}/images/fuellseparator-hero.avif`;
const TITLE = 'HYDROCORE™: separador de água e combustível diesel | ELIMFILTERS';
const DESCRIPTION = 'O HYDROCORE™ é a arquitetura de separação de água e combustível da ELIMFILTERS para aplicações aprovadas de separadores diesel padrão, nas quais a água, a vazão, a drenagem e a restrição precisam ser controladas antes que o combustível chegue às bombas e aos injetores de precisão.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['HYDROCORE', 'separador de água e combustível', 'separador de água diesel', 'filtro separador de água', 'água no diesel', 'dreno do separador', 'restrição de combustível', 'falta de combustível sob carga', 'corrosão do sistema de combustível', 'contaminação microbiana do diesel', 'ELIMFILTERS'],
  alternates: { canonical: URL, languages: languageAlternates('/technologies/hydrocore') },
  openGraph: {
    title: TITLE,
    description: 'Arquitetura de separação de água e combustível diesel padrão, não tipo turbina, para controlar a água, a vazão, a drenagem, a restrição e a exposição dos componentes a jusante.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: HERO, width: 1200, height: 630, alt: 'Tecnologia de separação de água e combustível HYDROCORE — ELIMFILTERS' }],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Arquitetura de separação de água e combustível diesel para aplicações aprovadas de separadores padrão, não tipo turbina.',
    images: [HERO],
  },
};

export default function PortugueseHydrocorePage() { return <HydrocoreLocalizedPage lang="pt" />; }
