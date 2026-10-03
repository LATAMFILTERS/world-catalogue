import type { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { languageAlternates } from '@/lib/localized-routes';

const TITLE = 'ELIMFILTERS | Filtros industriales y para servicio pesado';
const DESCRIPTION = 'Filtros para servicio pesado e industrial: filtros de combustible diésel, separadores de agua, filtros de aire, aceite, hidráulicos, refrigerante y cabina, diseñados por ELIMFILTERS para proteger motores y equipos.';

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
