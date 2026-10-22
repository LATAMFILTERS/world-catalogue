import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export { default } from '@/app/knowledge-center/page';

const TITLE = 'Centro de Conhecimento em Filtração Industrial | ELIMFILTERS';
const DESCRIPTION = 'Conhecimento de engenharia em filtração industrial, controle de contaminação, normas, diagnóstico de falhas, confiabilidade de equipamentos, manutenção de frotas e proteção de ativos.';
const URL = 'https://elimfilters.com/pt/knowledge-center/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: languageAlternates('/knowledge-center') },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website', siteName: 'ELIMFILTERS', locale: 'pt_BR' },
};
