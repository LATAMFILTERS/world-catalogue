import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { languageAlternates } from '@/lib/localized-routes';

const TITLE = 'ELIMFILTERS | Filtros industriais e para linha pesada';
const DESCRIPTION = 'Filtros para linha pesada e industrial: filtros de combustível diesel, separadores de água, filtros de ar, óleo, hidráulicos, líquido de arrefecimento e cabine, projetados pela ELIMFILTERS para proteger motores e equipamentos.';

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
