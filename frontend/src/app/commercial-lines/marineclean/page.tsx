'use client';

import { TechDetailPage, TechDetailData } from '@/components/TechDetailPage';

const DATA: TechDetailData = {
  categoryTag: 'SPECIALIZED SOLUTION · MARINE',
  heroTitle: 'MARINECLEAN™',
  heroSubtitle: 'MARINE ASSET-PROTECTION SYSTEMS',
  heroTagline: 'A specialized ELIMFILTERS solution for applying contamination-control and asset-protection architecture in marine operating environments.',
  heroImage: '/images/marine-hero.avif',
  logoSrc: '/assets/MARINECLEAN_final.avif',
  breadcrumbParent: { label: 'COMMERCIAL LINES', href: '/commercial-lines/' },
  heroStats: [
    { key: 'ENVIRONMENT', value: 'MARINE' },
    { key: 'APPROACH', value: 'SYSTEM-LEVEL' },
    { key: 'SELECTION', value: 'APPLICATION-SPECIFIC' },
  ],
  systemHeadline: 'Marine operating conditions require application-specific contamination control.',
  systemParagraphs: [
    'MARINECLEAN™ extends the ELIMFILTERS Asset Protection Systems architecture into marine operating environments. Selection begins with the protected asset, the contamination exposure, the fluid or air circuit, the equipment duty cycle and the available application evidence.',
    'Marine environments can combine moisture, airborne salt, fuel and fluid contamination, long duty cycles and constrained maintenance access. MARINECLEAN™ does not represent a universal material, coating, certification or performance claim; the applicable filtration components and protection functions must be defined for the specific vessel, machine or marine system.',
  ],
  productImageSrc: '/images/marino-taller.avif',
  productImageCaption: 'MARINECLEAN™ — specialized marine asset-protection solution.',
  stagesHeading: 'IDENTIFY THE ASSET. DEFINE THE EXPOSURE. APPLY THE RIGHT PROTECTION SYSTEM.',
  stages: [
    {
      number: '01',
      tag: 'ASSET',
      title: 'Identify the protected equipment',
      body: 'Begin with the vessel, engine, hydraulic equipment, auxiliary system or other marine asset and define the operating duty that must be protected.',
      stat: 'STEP 1',
      statLabel: 'Asset definition',
    },
    {
      number: '02',
      tag: 'EXPOSURE',
      title: 'Define the contamination environment',
      body: 'Evaluate the relevant exposure conditions such as moisture, airborne particulate, salt atmosphere, fuel or fluid condition and maintenance access without assuming one universal marine contamination profile.',
      stat: 'STEP 2',
      statLabel: 'Exposure assessment',
    },
    {
      number: '03',
      tag: 'SYSTEM',
      title: 'Map the required protection functions',
      body: 'Apply the appropriate ELIMFILTERS air, fuel, lubrication, hydraulic, cooling or other approved protection architecture according to the actual marine application.',
      stat: 'STEP 3',
      statLabel: 'System mapping',
    },
    {
      number: '04',
      tag: 'APPLICATION',
      title: 'Validate component selection',
      body: 'Component selection remains application-specific and must follow available technical evidence, equipment requirements and approved ELIMFILTERS application relationships.',
      stat: 'GOVERNED',
      statLabel: 'Evidence-based selection',
    },
  ],
  specsHeading: 'GOVERNED SOLUTION SCOPE',
  specs: [
    { label: 'Solution Type', value: 'Marine', sub: 'Specialized Asset Protection Systems application' },
    { label: 'Architecture', value: 'System-Level', sub: 'Protection function selected by application' },
    { label: 'Component Selection', value: 'Application-Specific', sub: 'Equipment and evidence govern selection' },
    { label: 'Performance Claims', value: 'Evidence-Governed', sub: 'No universal coating, certification or efficiency claim' },
  ],
  applicationsHeading: 'MARINE OPERATING CONTEXTS',
  applications: [
    {
      sector: 'Commercial Vessels',
      detail: 'Protection architecture can be mapped to propulsion, auxiliary and onboard equipment according to the vessel application and documented component requirements.',
    },
    {
      sector: 'Workboats & Offshore Support',
      detail: 'Marine duty, contamination exposure and maintenance access are evaluated before selecting the applicable protection systems and components.',
    },
    {
      sector: 'Ports & Coastal Equipment',
      detail: 'Coastal and port equipment can require marine-specific application assessment where moisture, airborne salt and industrial contamination interact with normal equipment duty.',
    },
  ],
  ctaTag: 'MARINECLEAN™ APPLICATION IDENTIFICATION',
  ctaHeading: 'Identify the protection architecture for your marine asset',
  ctaBody: 'Use the equipment, protected system and operating environment to identify the appropriate ELIMFILTERS marine application and component path.',
};

export default function MarinecleanPage() {
  return <TechDetailPage data={DATA} />;
}
