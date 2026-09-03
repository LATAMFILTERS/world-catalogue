export default function SchemaMarkup() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://elimfilters.com/#organization',
        name: 'ELIMFILTERS',
        legalName: 'Kleo Technology LLC',
        url: 'https://elimfilters.com/',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://elimfilters.com/#logo',
          url: 'https://elimfilters.com/assets/elimfilters-logo-transparent.png',
        },
        description: 'Industrial filtration engineering organization focused on contamination control, equipment reliability, and Total Asset Protection Systems.',
        address: {
          '@type': 'PostalAddress',
          addressCity: 'Frisco',
          addressRegion: 'Texas',
          addressCountry: 'US',
        },
        email: 'info@elimfilters.com',
        telephone: '+1-281-965-9142',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support and commercial inquiries',
          telephone: '+1-281-965-9142',
          email: 'info@elimfilters.com',
          areaServed: 'Worldwide',
          availableLanguage: ['English', 'Spanish'],
        },
        areaServed: 'Worldwide',
        sameAs: [
          'https://www.linkedin.com/company/133064152/',
          'https://www.facebook.com/elimfilters/',
          'https://www.instagram.com/elimfilters.global',
          'https://x.com/elimfilters',
          'https://www.youtube.com/@elimfilters9112',
          'https://www.amazon.com/stores/Elimfilters/page/B7619BD8-A04B-48A2-B275-FF4976181C55',
        ],
        brand: {
          '@id': 'https://elimfilters.com/#brand',
        },
      },
      {
        '@type': 'Brand',
        '@id': 'https://elimfilters.com/#brand',
        name: 'ELIMFILTERS',
        alternateName: 'ELIMFILTERS® Total Asset Protection',
        url: 'https://elimfilters.com/',
        owner: {
          '@id': 'https://elimfilters.com/#organization',
        },
        description: 'Industrial filtration engineering brand for contamination control, protected systems, equipment reliability, and asset protection.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://elimfilters.com/#website',
        url: 'https://elimfilters.com/',
        name: 'ELIMFILTERS',
        publisher: {
          '@id': 'https://elimfilters.com/#organization',
        },
        about: {
          '@id': 'https://elimfilters.com/#brand',
        },
        inLanguage: 'en',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
