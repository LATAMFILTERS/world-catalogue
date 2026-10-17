import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { languageAlternates } from '@/lib/localized-routes';

const TITLE = "ELIMFILTERS — Engenharia avançada de filtração e inteligência técnica";
const DESCRIPTION = "A ELIMFILTERS integra tecnologias de filtração, engenharia, conhecimento especializado e inteligência técnica digital em uma plataforma internacional voltada à proteção de ativos industriais, equipamentos pesados e aplicações automotivas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: '/pt/',
    languages: languageAlternates('/'),
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/pt/',
    siteName: 'ELIMFILTERS',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/assets/logo-elimfilters.png'] },
};

export default function PortugueseHomePage() {
  return <HomePage />;
}
