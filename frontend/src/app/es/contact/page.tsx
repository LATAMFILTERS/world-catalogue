import type { Metadata } from 'next';
import { PageHeader } from '@/components/PageHeader';
import ContactIntentRouter from '@/components/ContactIntentRouter';

const CANONICAL = 'https://elimfilters.com/es/contact/';
const EN_URL = 'https://elimfilters.com/contact/';
const TITLE = 'Contacto y soporte técnico | ELIMFILTERS';
const DESCRIPTION = 'Contacte a ELIMFILTERS para validación técnica, consultas de distribuidores autorizados y asesoría en protección de activos. Atención global para minería, agricultura, marina e industria pesada.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL, languages: { 'x-default': EN_URL, en: EN_URL, es: CANONICAL } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'Contacte a ELIMFILTERS — soporte en filtración industrial' }],
    locale: 'es_419',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Contacte a ELIMFILTERS para soporte técnico, referencias cruzadas OEM y consultas de distribuidores autorizados.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

const schemaContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${CANONICAL}#contact-page`,
  name: 'Contacto ELIMFILTERS',
  url: CANONICAL,
  inLanguage: 'es',
  description: 'Contacte a ELIMFILTERS para soporte técnico, búsquedas de inteligencia de producto, solicitudes de distribuidores y consultas comerciales.',
  isPartOf: { '@id': 'https://elimfilters.com/#website' },
};

export default function SpanishContactPage() {
  return (
    <main style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'Barlow,Arial,sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }} />
      <PageHeader currentPage="Contact" />
      <ContactIntentRouter />
    </main>
  );
}
