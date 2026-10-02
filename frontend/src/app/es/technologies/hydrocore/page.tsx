import type { Metadata } from 'next';
import { HydrocoreStablePageEs } from '@/components/HydrocoreStablePageEs';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/es/technologies/hydrocore/`;
const EN_URL = `${BASE_URL}/technologies/hydrocore/`;
const HERO = `${BASE_URL}/images/fuellseparator-hero.avif`;
const TITLE = 'HYDROCORE™: separador de agua y combustible diésel | ELIMFILTERS';
const DESCRIPTION = 'HYDROCORE™ es la arquitectura de separación de agua y combustible de ELIMFILTERS para aplicaciones aprobadas de separadores diésel estándar, donde el agua, el caudal, el drenaje y la restricción deben controlarse antes de que el combustible llegue a bombas e inyectores de precisión.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['HYDROCORE', 'separador de agua y combustible', 'separador de agua diésel', 'filtro separador de agua', 'agua en el combustible diésel', 'drenaje del separador', 'restricción de combustible', 'falta de combustible bajo carga', 'corrosión del sistema de combustible', 'contaminación microbiana del diésel', 'ELIMFILTERS'],
  alternates: { canonical: URL, languages: { en: EN_URL, es: URL, 'x-default': EN_URL } },
  openGraph: {
    title: TITLE,
    description: 'Arquitectura de separación de agua y combustible diésel estándar, no tipo turbina, para controlar el agua, el caudal, el drenaje, la restricción y la exposición de los componentes aguas abajo.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: HERO, width: 1200, height: 630, alt: 'Tecnología de separación de agua y combustible HYDROCORE — ELIMFILTERS' }],
    locale: 'es_419',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Arquitectura de separación de agua y combustible diésel para aplicaciones aprobadas de separadores estándar, no tipo turbina.',
    images: [HERO],
  },
};

export default function SpanishHydrocorePage() { return <HydrocoreStablePageEs />; }
