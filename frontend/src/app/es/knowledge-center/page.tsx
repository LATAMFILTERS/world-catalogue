import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';

export { default } from '@/app/knowledge-center/page';

const TITLE = 'Centro de Conocimiento en Filtración Industrial | ELIMFILTERS';
const DESCRIPTION = 'Conocimiento de ingeniería en filtración industrial, control de contaminación, normas, diagnóstico de fallas, confiabilidad de equipos, mantenimiento de flotas y protección de activos.';
const URL = 'https://elimfilters.com/es/knowledge-center/';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL, languages: languageAlternates('/knowledge-center') },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website', siteName: 'ELIMFILTERS', locale: 'es_419' },
};
