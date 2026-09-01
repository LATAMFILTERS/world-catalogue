import { PageHeader } from '@/components/PageHeader';
import ContactIntentRouter from '@/components/ContactIntentRouter';

const schemaContact = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://elimfilters.com/contact/#contact-page',
  name: 'Contact ELIMFILTERS',
  url: 'https://elimfilters.com/contact/',
  description: 'Contact ELIMFILTERS for technical support, product-intelligence lookups, distributor applications and commercial inquiries.',
  isPartOf: { '@id': 'https://elimfilters.com/#website' },
};

export default function ContactPage() {
  return (
    <main style={{ background: '#050505', color: '#fff', minHeight: '100vh', fontFamily: 'Barlow,Arial,sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaContact) }} />
      <PageHeader currentPage="Contact" />
      <ContactIntentRouter />
    </main>
  );
}
