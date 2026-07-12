'use client';

import { TechDetailPage, TechDetailData } from '@/components/TechDetailPage';

const DATA: TechDetailData = {
  categoryTag: 'COMMERCIAL LINE · FLEET',
  heroTitle: 'DURATECH™',
  heroSubtitle: 'FLEET MASTER KIT SYSTEM',
  heroTagline: 'Platform-specific filtration kits for on-road and off-road mixed-fleet operations — oil, fuel, air, and cabin in one service order.',
  heroImage: '/images/npr-01_converted.avif',
  logoSrc: '/assets/Duratech.avif',
  breadcrumbParent: { label: 'COMMERCIAL LINES', href: '/commercial-lines' },
  heroStats: [
    { key: 'ELEMENTS/KIT', value: '3–8' },
    { key: 'SOURCING', value: 'SINGLE ORDER' },
    { key: 'COMPATIBILITY', value: 'OEM-MATCHED' },
  ],
  systemHeadline: 'Fleet Maintenance Standardisation System',
  systemParagraphs: [
    'DURATECH™ consolidates OEM-interchangeable filtration components into platform-specific master kits. Each kit covers one vehicle service cycle with 3 to 8 elements — oil, fuel, air, and cabin filters as applicable per platform — all specified to the application, all sourced in a single order.',
    'Designed for mixed-fleet operations in mining, construction, agriculture, and on-road transport. Eliminates wrong-element installations across multi-brand fleets and converts filter inventory to a predictable kit-based structure. One kit number per vehicle platform reduces purchasing complexity and ensures service technicians apply the correct specification on every service event.',
  ],
  productImageSrc: '/images/kits-npr.avif',
  productImageCaption: 'DURATECH™ fleet master kit — platform-matched elements per vehicle, one service cycle.',
  productImageFit: 'contain',
  stagesHeading: 'PLATFORM-MATCHED ELEMENTS. ONE KIT. ONE SERVICE CYCLE.',
  stages: [
    {
      number: '01',
      tag: 'LUBRICATION',
      title: 'Oil Filter — SYNTRAX™ Element',
      body: 'SYNTRAX™ synthetic media lube oil element matched to engine platform viscosity grade and crankcase capacity. Controls particle contamination to ISO 4406 cleanliness target for the engine bearing specification.',
      stat: 'ISO 4406',
      statLabel: 'Cleanliness Target',
    },
    {
      number: '02',
      tag: 'FUEL CLEANLINESS',
      title: 'Fuel Filter — HYDROCORE™ or SYNTEPORE™',
      body: 'Fuel element selected to match injection system pressure specification. HYDROCORE™ for water-separation requirements; SYNTEPORE™ for HPCR systems requiring sub-4µm particle removal. Prevents injector stiction and tip erosion.',
      stat: '4µm',
      statLabel: 'HPCR Particle Target',
    },
    {
      number: '03',
      tag: 'AIR INTAKE',
      title: 'Air Filter — MACROCORE™ Element',
      body: 'MACROCORE™ multi-layer air intake element sized to the engine air circuit. Controls inlet contamination to ISO 5011 efficiency specification. Maintains volumetric efficiency and prevents abrasive ingression to turbocharger and cylinder bore.',
      stat: 'ISO 5011',
      statLabel: 'Efficiency Standard',
    },
    {
      number: '04',
      tag: 'CABIN AIR',
      title: 'Cabin Filter — MICROKAPPA™ Element',
      body: 'MICROKAPPA™ cabin air element for operator protection. Included where the platform cabin filtration circuit is present. Controls PM10/PM2.5 particle exposure and chemical vapour ingress per ISO 11155.',
      stat: 'ISO 11155',
      statLabel: 'Cabin Air Standard',
    },
  ],
  specsHeading: 'KIT SPECIFICATIONS',
  specs: [
    { label: 'Kit Configuration', value: '3–8 Elements', sub: 'Oil · Fuel · Air · Cabin (platform-matched)' },
    { label: 'Platform Matching', value: 'OEM-Spec', sub: 'Make · Model · Engine' },
    { label: 'Order Structure', value: 'Single SKU', sub: 'Per vehicle platform' },
    { label: 'Lube Standard', value: 'ISO 4406', sub: 'Cleanliness code compliance' },
    { label: 'Fuel Standard', value: 'ISO 12937', sub: 'Water content measurement' },
    { label: 'Air Standard', value: 'ISO 5011', sub: 'Dust arrestance efficiency' },
  ],
  applicationsHeading: 'FLEET APPLICATIONS',
  applications: [
    {
      sector: 'Trucks & Fleets',
      detail: 'On-road commercial transport fleets with mixed makes and models — long-haul trucks, regional distribution, and last-mile delivery vehicles.',
    },
    {
      sector: 'Mining & Construction',
      detail: 'Off-road heavy equipment fleets — excavators, loaders, haul trucks, and drill rigs operating across multiple equipment brands.',
    },
    {
      sector: 'Agriculture',
      detail: 'Agricultural machinery fleets — tractors, harvesters, and self-propelled sprayers across seasonal maintenance cycles.',
    },
  ],
  ctaTag: 'DURATECH™ FLEET KITS',
  ctaHeading: 'Find Your Platform Kit by Vehicle Model',
  ctaBody: 'Cross-reference your vehicle make, model, and engine specification to identify the correct DURATECH™ fleet kit for your service cycle.',
};

export default function DuratechPage() {
  return <TechDetailPage data={DATA} />;
}
