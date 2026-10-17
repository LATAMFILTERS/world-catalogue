import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { languageAlternates } from '@/lib/localized-routes';

const TITLE = "ELIMFILTERS — Ingeniería avanzada de filtración e inteligencia técnica";
const DESCRIPTION = "ELIMFILTERS integra tecnologías de filtración, ingeniería, conocimiento especializado e inteligencia técnica digital en una plataforma internacional orientada a la protección de activos industriales, equipos pesados y aplicaciones automotrices.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/es/',
    languages: languageAlternates('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'es_419',
    url: '/es/',
    siteName: 'ELIMFILTERS',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/assets/logo-elimfilters.png'] },
};

export default function SpanishHomePage() {
  return <HomePage />;
}
