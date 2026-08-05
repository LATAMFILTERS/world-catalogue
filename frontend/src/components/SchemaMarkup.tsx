export default function SchemaMarkup() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "name": "ELIMFILTERS",
    "alternateName": "ELIMFILTERS® Total Asset Protection",
    "owner": {
      "@type": "Organization",
      "name": "Kleo Technology LLC",
      "legalName": "Kleo Technology LLC",
      "address": {
        "@type": "PostalAddress",
        "addressCity": "Frisco",
        "addressRegion": "Texas",
        "addressCountry": "USA",
        "addressType": "Legal Headquarters"
      }
    },
    "description": "ELIMFILTERS® is Kleo Technology LLC's global industrial filtration brand for critical asset protection in mining, energy, agriculture, and heavy-duty fleets. Operates through authorized distributors worldwide. Includes comprehensive Knowledge Center with technical resources on filtration standards, contamination control, and engineering guidance.",
    "areaServed": {
      "@type": "Country",
      "name": "Worldwide"
    },
    "url": "https://elimfilters.com",
    "brand": {
      "@type": "Brand",
      "name": "ELIMFILTERS"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "ELIMFILTERS Knowledge Center",
      "url": "https://elimfilters.com/knowledge-system"
    },
    "sameAs": [
      "https://www.instagram.com/elimfilters.global/",
      "https://www.facebook.com/elimfilters/",
      "https://www.linkedin.com/company/133064152/"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
