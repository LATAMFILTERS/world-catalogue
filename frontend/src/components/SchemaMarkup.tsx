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
          url: 'https://elimfilters.com/assets/logo-elimfilters.png',
        },
        description: 'Industrial filtration engineering organization focused on contamination control, equipment reliability, and Total Asset Protection Systems.',
        address: {
          '@type': 'PostalAddress',
          addressCity: 'Frisco',
          addressRegion: 'Texas',
          addressCountry: 'US',
        },
        areaServed: 'Worldwide',
        brand: {
          '@id': 'https://elimfilters.com/#brand',
        },
        sameAs: [
          'https://www.instagram.com/elimfilters.global/',
          'https://www.facebook.com/elimfilters/',
          'https://www.linkedin.com/company/133064152/',
        ],
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
      {
        '@type': 'CollectionPage',
        '@id': 'https://elimfilters.com/knowledge-center/#collection',
        url: 'https://elimfilters.com/knowledge-center/',
        name: 'ELIMFILTERS Knowledge Center',
        description: 'Industrial filtration engineering reference covering contamination control, protection systems, technologies, standards, industries, and technical guidance.',
        isPartOf: {
          '@id': 'https://elimfilters.com/#website',
        },
        publisher: {
          '@id': 'https://elimfilters.com/#organization',
        },
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
