export default function SchemaMarkup() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://elimfilters.com/#organization',
        name: 'ELIMFILTERS',
        url: 'https://elimfilters.com/',
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://elimfilters.com/#logo',
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
