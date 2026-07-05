'use client';

import { TechDetailPage } from '@/components/TechDetailPage';
import type { TechDetailData } from '@/components/TechDetailPage';

const DATA: TechDetailData = {
  categoryTag: 'COMMERCIAL LINE · MARINE',
  heroTitle: 'MARINECLEAN™',
  heroSubtitle: 'SALT-RESISTANT MARINE FILTRATION',
  heroTagline: 'Salt-resistant filtration line for commercial marine, offshore, and coastal operations. IMO certified for continuous saltwater aerosol exposure in diesel fuel, hydraulic, and lube oil systems.',
  heroImage: '/images/marine-hero.avif',
  logoSrc: '/assets/MARINECLEAN.avif',
  breadcrumbParent: { label: 'COMMERCIAL LINES', href: '/commercial-lines' },
  heroStats: [
    { key: 'CERTIFICATION', value: 'IMO' },
    { key: 'PROTECTION', value: 'EPOXY + BRINE' },
    { key: 'SYSTEMS', value: 'FUEL · HYD · LUBE' },
  ],
  systemHeadline: 'Marine-Grade Asset Protection\nEngineered for Saltwater Environments',
  systemParagraphs: [
    'MARINECLEAN™ applies epoxy brine-rejection coating to housings and elements in marine environments. Standard industrial filtration degrades rapidly in saltwater conditions — salt aerosol penetrates seals, corrodes housings, and compromises element integrity within months of exposure.',
    'MARINECLEAN™ is engineered from the ground up for wet-dry cycling in harbor, offshore, and deep-sea operating environments. Certified to IMO (International Maritime Organization) standards for commercial marine use, it protects diesel fuel filtration, hydraulic steering and deck machinery circuits, and lube oil systems aboard commercial vessels, offshore platforms, and coastal industrial equipment.',
    'The line covers three interrelated failure mechanisms: saltwater aerosol ingress through housing seals, brine penetration at the element interface, and accelerated corrosion from wet-dry cycling. Each mechanism is addressed by a distinct engineering feature in the MARINECLEAN™ construction.',
  ],
  productImageSrc: '/assets/MARINECLEAN.avif',
  productImageCaption: 'MARINECLEAN™ — IMO Certified Marine Filtration Line',
  stagesHeading: 'THREE LAYERS OF MARINE PROTECTION',
  stages: [
    {
      number: '01',
      tag: 'HOUSING BARRIER',
      title: 'Epoxy Barrier Coating',
      body: 'Marine-grade epoxy coating on all external housing surfaces prevents salt-accelerated oxidation and corrosion in continuous saltwater aerosol environments. Rated for harbor, coastal, and deep-sea conditions where salt-laden air contacts filter housings during every operating hour.',
      stat: 'EPOXY',
      statLabel: 'Marine-grade barrier coating',
    },
    {
      number: '02',
      tag: 'ELEMENT INTERFACE',
      title: 'Brine Rejection Geometry',
      body: 'Internal flow geometry engineered to reject brine ingress at the element interface, preventing salt contamination of the protected fluid. The geometry creates a seal path that forces saltwater away from the filtration media — eliminating the primary route for salt to reach diesel fuel or hydraulic circuits.',
      stat: 'BRINE',
      statLabel: 'Rejection geometry at element interface',
    },
    {
      number: '03',
      tag: 'INTERNAL COMPONENTS',
      title: 'Corrosion-Shield Internals',
      body: 'All internal metal components use corrosion-resistant alloys and coatings rated for the wet-dry cycling experienced in harbor and offshore operations. Wet-dry cycling is the most damaging corrosion mechanism in marine environments — components must survive repeated salt deposition and re-wetting events across multi-year service periods.',
      stat: 'IMO',
      statLabel: 'International Maritime Organization certified',
    },
  ],
  specs: [
    { label: 'Certification', value: 'IMO', sub: 'International Maritime Organization certification for commercial marine use in fuel and hydraulic filtration systems.' },
    { label: 'Coating System', value: 'EPOXY', sub: 'Marine-grade epoxy barrier coating on all external housing surfaces. Rated for continuous saltwater aerosol exposure.' },
    { label: 'Rejection Design', value: 'BRINE', sub: 'Brine rejection geometry at the element interface prevents salt ingress into the protected fluid circuit.' },
    { label: 'Internal Alloys', value: 'CRA', sub: 'Corrosion-resistant alloys (CRA) on all internal metal components for wet-dry cycling resistance across multi-year service.' },
    { label: 'Systems Protected', value: '3', sub: 'Diesel fuel filtration, hydraulic steering and deck machinery, and lube oil circuits — all in marine-rated assemblies.' },
    { label: 'Operating Contexts', value: '3', sub: 'Harbor operations, offshore platforms, and deep-sea environments — each representing distinct saltwater exposure profiles.' },
  ],
  applicationsHeading: 'MARINE OPERATIONAL CONTEXTS',
  applicationsSubtext: 'MARINECLEAN™ is deployed across commercial marine operations where continuous saltwater aerosol exposure would degrade standard industrial filtration within months.',
  applications: [
    {
      sector: 'COMMERCIAL VESSELS',
      detail: 'Main engine fuel filtration, hydraulic steering and deck machinery circuits, lube oil systems aboard cargo ships, ferries, passenger vessels, and workboats. Salt aerosol exposure is continuous in harbor and coastal routes. MARINECLEAN™ epoxy housings and brine rejection geometry prevent salt contamination of fuel and hydraulic circuits across multi-year vessel service intervals.',
    },
    {
      sector: 'OFFSHORE PLATFORMS',
      detail: 'Diesel generator fuel systems, hydraulic BOP and wellhead control circuits, crane hydraulics in permanent platforms, semi-submersible rigs, and jack-up units. Offshore environments combine continuous salt spray with high-vibration operating conditions — both of which accelerate corrosion and seal degradation in standard filtration assemblies.',
    },
    {
      sector: 'COASTAL INFRASTRUCTURE',
      detail: 'Port machinery, coastal construction equipment, and shore-based industrial operations subject to continuous salt aerosol exposure. Includes port cranes, reach stackers, ship loaders, and harbor workboats operating within the marine aerosol zone where salt deposition occurs even without direct water contact.',
    },
  ],
  ctaTag: 'MARINECLEAN™ PRODUCT RANGE',
  ctaHeading: 'Find Your Marine Filtration SKU',
  ctaBody: 'Cross-reference vessel model, engine type, and OEM specification to identify the correct MARINECLEAN™ element for your fuel, hydraulic, or lube system.',
};

export default function MarinecleanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'MARINECLEAN™',
            description: 'Salt-resistant filtration line for commercial marine, offshore, and coastal operations. Epoxy barrier coating, brine rejection geometry, and corrosion-shield internals. IMO certified for diesel fuel, hydraulic, and lube oil systems.',
            brand: { '@type': 'Brand', name: 'ELIMFILTERS' },
            manufacturer: { '@type': 'Organization', name: 'ELIMFILTERS', url: 'https://elimfilters.com' },
            url: 'https://elimfilters.com/commercial-lines/marineclean/',
            category: 'Industrial Filtration — Marine',
            additionalProperty: [
              { '@type': 'PropertyValue', name: 'Certification', value: 'IMO' },
              { '@type': 'PropertyValue', name: 'Coating', value: 'Marine-grade epoxy barrier' },
              { '@type': 'PropertyValue', name: 'Systems Protected', value: 'Diesel fuel · Hydraulic · Lube oil' },
            ],
          }),
        }}
      />
      <TechDetailPage data={DATA} />
    </>
  );
}
