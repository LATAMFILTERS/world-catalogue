/**
 * edl/technology-registry.ts
 * Engineering Data Layer — Technology Entity Registry
 *
 * Governed entities for all 12 ELIMFILTERS filtration technologies.
 * Uses permanent TECH-xxx identifiers consistent with technology-architectures.ts.
 */

import type { EDLTechnologyEntity, EDLTechnologyRegistry } from './types';

export const EDL_TECHNOLOGIES: EDLTechnologyRegistry = {

  'TECH-MACROCORE': {
    id: 'TECH-MACROCORE',
    name: 'MACROCORE',
    slug: 'macrocore',
    domain: 'Air Intake Filtration',
    contaminationTarget: ['particulate', 'dust', 'silicon-dust'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Progressive density gradient air intake filtration',
    engineeringPrinciple: 'Three-zone progressive density media achieving ISO 5011 absolute performance',
  },

  'TECH-SYNTRAX': {
    id: 'TECH-SYNTRAX',
    name: 'SYNTRAX',
    slug: 'syntrax',
    domain: 'Engine Lube Oil Filtration',
    contaminationTarget: ['particulate', 'wear-particles', 'oxidation-byproducts'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Synthetic lube oil filtration for ISO 4406 cleanliness targets',
    engineeringPrinciple: 'Synthetic media multi-pass filtration per ISO 16889',
  },

  'TECH-NANOFORCE': {
    id: 'TECH-NANOFORCE',
    name: 'NANOFORCE',
    slug: 'nanoforce',
    domain: 'Hydraulic System Filtration',
    contaminationTarget: ['particulate', 'sub-micron-particles', 'varnish-precursors'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'High-precision hydraulic filtration for servo valve protection',
    engineeringPrinciple: 'Nanofiber-enhanced media for ISO 16/14/11 and tighter cleanliness codes',
  },

  'TECH-SYNTEPORE': {
    id: 'TECH-SYNTEPORE',
    name: 'SYNTEPORE',
    slug: 'syntepore',
    domain: 'Fuel HPCR Filtration',
    contaminationTarget: ['particulate', 'fuel-borne-particles'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'High-pressure common-rail injector protection filtration',
    engineeringPrinciple: 'Absolute rated synthetic fuel filtration for HPCR injector clearances',
  },

  'TECH-HYDROCORE': {
    id: 'TECH-HYDROCORE',
    name: 'HYDROCORE',
    slug: 'hydrocore',
    domain: 'Fuel Water Separation',
    contaminationTarget: ['free-water', 'emulsified-water'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Coalescing fuel-water separation',
    engineeringPrinciple: 'Coalescing media achieving >95% free water removal per ASTM D6304',
  },

  'TECH-TURBOCORE': {
    id: 'TECH-TURBOCORE',
    name: 'TURBOCORE',
    slug: 'turbocore',
    domain: 'Three-Stage Fuel Filtration',
    contaminationTarget: ['particulate', 'free-water', 'biological'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Three-stage fuel filtration per ISO 16332',
  },

  'TECH-THERMACORE': {
    id: 'TECH-THERMACORE',
    name: 'THERMACORE',
    slug: 'thermacore',
    domain: 'Cooling System Protection',
    contaminationTarget: ['scale', 'corrosion-products', 'SCA-depletion'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Coolant supplemental additive filtration',
  },

  'TECH-DRYCORE': {
    id: 'TECH-DRYCORE',
    name: 'DRYCORE',
    slug: 'drycore',
    domain: 'Compressed Air and Pneumatic Filtration',
    contaminationTarget: ['particulate', 'moisture', 'oil-aerosol'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'ISO 8573-1 classified compressed air purification',
  },

  'TECH-INTEKCORE': {
    id: 'TECH-INTEKCORE',
    name: 'INTEKCORE',
    slug: 'intekcore',
    domain: 'Filter Housing Systems',
    contaminationTarget: ['particulate'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Integrated filter housing and mounting systems',
  },

  'TECH-DURATECH': {
    id: 'TECH-DURATECH',
    name: 'DURATECH',
    slug: 'duratech',
    domain: 'Fleet Maintenance Systems',
    contaminationTarget: ['particulate', 'water', 'biological'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Fleet-wide filtration maintenance kit system',
  },

  'TECH-MARINECLEAN': {
    id: 'TECH-MARINECLEAN',
    name: 'MARINECLEAN',
    slug: 'marineclean',
    domain: 'Marine Diesel and Hydraulic Filtration',
    contaminationTarget: ['particulate', 'free-water', 'biological', 'salt'],
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'IMO-certified marine filtration for diesel and hydraulic systems',
  },

  'TECH-MICROKAPPA': {
    id: 'TECH-MICROKAPPA',
    name: 'MICROKAPPA',
    slug: 'microkappa',
    domain: 'Cabin Air Filtration',
    contaminationTarget: ['PM10', 'PM2.5', 'pollen', 'bacteria', 'VOCs'],
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    tagline: 'Occupant health protection per ISO 11155 and DIN 71220',
    engineeringPrinciple: 'Multi-layer cabin air filtration targeting PM2.5 and biological contaminants',
  },

};
