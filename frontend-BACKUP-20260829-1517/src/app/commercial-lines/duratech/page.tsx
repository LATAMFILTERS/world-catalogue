'use client';

import { TechDetailPage, TechDetailData } from '@/components/TechDetailPage';

const DATA: TechDetailData = {
  categoryTag: 'SPECIALIZED SOLUTION · INTEGRATED MAINTENANCE',
  heroTitle: 'DURATECH™',
  heroSubtitle: 'INTEGRATED ASSET-PROTECTION KITS',
  heroTagline: 'Application-specific maintenance kits that coordinate the filtration components required for a defined service interval.',
  heroImage: '/images/npr-01_converted.avif',
  logoSrc: '/images/kits-npr.avif',
  breadcrumbParent: { label: 'COMMERCIAL LINES', href: '/commercial-lines/' },
  heroStats: [
    { key: 'ON-ROAD INTERVAL', value: '15,000 KM' },
    { key: 'SCOPE', value: 'APPLICABLE TRUCKS' },
    { key: 'GOVERNANCE', value: 'APPLICATION-SPECIFIC' },
  ],
  systemHeadline: 'One governed maintenance interval. Coordinated protection components.',
  systemParagraphs: [
    'DURATECH™ is an integrated maintenance and asset-protection kit architecture. The kit is configured around the vehicle, machine or equipment application so the required filtration components are managed as one maintenance decision rather than as unrelated replacement parts.',
    'For approved On-Road truck and commercial-vehicle applications, DURATECH™ carries a governed 15,000 km protection interval. That interval applies only to approved applications and remains subject to ELIMFILTERS application, installation, maintenance and coverage conditions. It is not a universal durability claim for individual filters or for off-road, marine or industrial equipment.',
  ],
  productImageSrc: '/images/kits-npr.avif',
  productImageCaption: 'DURATECH™ — integrated maintenance and asset-protection kit architecture.',
  productImageFit: 'contain',
  stagesHeading: 'APPLICATION IDENTIFICATION. COMPONENT COORDINATION. GOVERNED INTERVAL.',
  stages: [
    { number: '01', tag: 'APPLICATION', title: 'Identify the protected asset', body: 'Kit selection starts with the specific vehicle, truck, machine or equipment application and its maintenance requirements.', stat: 'STEP 1', statLabel: 'Application identification' },
    { number: '02', tag: 'PROTECTION', title: 'Coordinate required filtration components', body: 'The kit groups the filtration components required by the approved application so maintenance can be planned at the asset level rather than as isolated filter replacement.', stat: 'STEP 2', statLabel: 'Component coordination' },
    { number: '03', tag: 'INTERVAL', title: 'Apply the approved maintenance interval', body: 'The service interval is governed by the approved application. The 15,000 km claim is reserved for applicable On-Road trucks and commercial vehicles and must not be generalized to other duty classes.', stat: '15,000 KM', statLabel: 'Approved On-Road interval' },
    { number: '04', tag: 'SERVICE', title: 'Maintain application and installation discipline', body: 'Coverage and protection language remains conditional on the correct application, installation and maintenance requirements defined by ELIMFILTERS.', stat: 'GOVERNED', statLabel: 'Application conditions apply' },
  ],
  specsHeading: 'GOVERNED COMMERCIAL POSITION',
  specs: [
    { label: 'Solution Type', value: 'Integrated Kit', sub: 'Maintenance and asset-protection architecture' },
    { label: 'On-Road Scope', value: 'Trucks', sub: 'Applicable trucks and commercial vehicles' },
    { label: 'Approved Interval', value: '15,000 km', sub: 'On-Road approved applications only' },
    { label: 'Off-Road / Industrial', value: 'Application-Specific', sub: 'No universal 15,000 km claim' },
  ],
  applicationsHeading: 'APPLICATION SCOPE',
  applications: [
    { sector: 'On-Road Trucks & Commercial Vehicles', detail: 'Approved applications may use the governed 15,000 km integrated protection interval, subject to ELIMFILTERS application, installation and maintenance conditions.' },
    { sector: 'Machines & Equipment', detail: 'DURATECH™ can organize required filtration components into an integrated maintenance kit, with interval and coverage defined by the specific approved application.' },
    { sector: 'Mixed Fleets', detail: 'Kit-based maintenance can simplify service planning across multiple asset types without converting application-specific intervals into universal claims.' },
  ],
  ctaTag: 'DURATECH™ APPLICATION IDENTIFICATION',
  ctaHeading: 'Identify the approved kit for your asset',
  ctaBody: 'Use the vehicle, machine or equipment application to identify the appropriate DURATECH™ configuration and its governed maintenance conditions.',
};

export default function DuratechPage() {
  return (
    <>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        DURATECH™ Integrated Asset-Protection Filter Kits
      </h1>
      <TechDetailPage data={DATA} />
    </>
  );
}
