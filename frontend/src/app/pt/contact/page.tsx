import type { Metadata } from 'next';
import { languageAlternates } from '@/lib/localized-routes';
import { PageHeader } from '@/components/PageHeader';
import ContactIntentRouter from '@/components/ContactIntentRouter';

const CANONICAL = 'https://elimfilters.com/pt/contact/';
const TITLE = 'Contato e suporte técnico | ELIMFILTERS';
const DESCRIPTION = 'Fale com a ELIMFILTERS para validação técnica, consultas de distribuidores autorizados e consultoria em proteção de ativos. Atendimento global para mineração, agricultura, setor marítimo e indústria pesada.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: CANONICAL, languages: languageAlternates('/contact') },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'Fale com a ELIMFILTERS — suporte em filtração industrial' }],
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Fale com a ELIMFILTERS para suporte técnico, referências cruzadas OEM e consultas de distribuidores autorizados.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

const schemaContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${CANONICAL}#contact-page`,
  name: 'Contato ELIMFILTERS',
  url: CANONICAL,
  inLanguage: 'pt-BR',
  description: 'Fale com a ELIMFILTERS para suporte técnico, pesquisas de inteligência de produto, candidaturas de distribuidores e consultas comerciais.',
  isPartOf: { '@id': 'https://elimfilters.com/#website' },
};

export default function PortugueseContactPage() {
  return (
    <main style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'Barlow,Arial,sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }} />
      <PageHeader currentPage="Contact" />
      <ContactIntentRouter />
    </main>
  );
}
