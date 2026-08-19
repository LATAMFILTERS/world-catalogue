/**
 * edl/industry-registry.ts
 * Engineering Data Layer — Industry Entity Registry
 *
 * 10 canonical Industry entities with permanent IND-xxx identifiers.
 * Contamination severity drives system and technology selection.
 */

import type { EDLIndustryEntity, EDLIndustryRegistry } from './types';

export const EDL_INDUSTRIES: EDLIndustryRegistry = {

  'IND-MINING': {
    id: 'IND-MINING',
    name: 'Mining',
    slug: 'mining',
    contaminationSeverity: 'critical',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-LUBRICATION', 'SYS-HYDRAULIC', 'SYS-CABIN-AIR'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-HYDROCORE', 'TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-MICROKAPPA'],
    standards: ['STD-ISO-5011', 'STD-ISO-16889', 'STD-ISO-4406', 'STD-ASTM-D6304', 'STD-ISO-11155-1'],
  },

  'IND-CONSTRUCTION': {
    id: 'IND-CONSTRUCTION',
    name: 'Construction',
    slug: 'construction',
    contaminationSeverity: 'critical',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-HYDRAULIC', 'SYS-LUBRICATION', 'SYS-CABIN-AIR'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-MICROKAPPA'],
    standards: ['STD-ISO-5011', 'STD-SAE-J1539', 'STD-ISO-16889', 'STD-ISO-4406', 'STD-ASTM-D6304'],
  },

  'IND-AGRICULTURE': {
    id: 'IND-AGRICULTURE',
    name: 'Agriculture',
    slug: 'agriculture',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-CABIN-AIR', 'SYS-LUBRICATION', 'SYS-HYDRAULIC'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-MICROKAPPA', 'TECH-SYNTRAX', 'TECH-NANOFORCE'],
    standards: ['STD-ISO-5011', 'STD-SAE-J1539', 'STD-ASTM-D6304', 'STD-ISO-11155-1', 'STD-DIN-71220'],
  },

  'IND-TRUCK-FLEETS': {
    id: 'IND-TRUCK-FLEETS',
    name: 'Truck Fleets',
    slug: 'truck-fleets',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-LUBRICATION', 'SYS-CABIN-AIR', 'SYS-COOLING'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-SYNTRAX', 'TECH-MICROKAPPA', 'TECH-THERMACORE'],
    standards: ['STD-ISO-5011', 'STD-SAE-J1539', 'STD-ASTM-D6304', 'STD-ISO-4406', 'STD-ISO-11155-1'],
  },

  'IND-MARINE': {
    id: 'IND-MARINE',
    name: 'Marine',
    slug: 'marine',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-FUEL-CLEANLINESS', 'SYS-HYDRAULIC', 'SYS-LUBRICATION'],
    technologies: ['TECH-MARINECLEAN', 'TECH-HYDROCORE', 'TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-HYDROCORE'],
    standards: ['STD-ASTM-D6304', 'STD-ISO-12937', 'STD-ISO-16889', 'STD-ISO-4406'],
  },

  'IND-OIL-GAS': {
    id: 'IND-OIL-GAS',
    name: 'Oil & Gas',
    slug: 'oil-gas',
    contaminationSeverity: 'critical',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-HYDRAULIC', 'SYS-LUBRICATION', 'SYS-COMPRESSED-AIR', 'SYS-FUEL-CLEANLINESS'],
    technologies: ['TECH-MACROCORE', 'TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-DRYCORE', 'TECH-SYNTAPORE'],
    standards: ['STD-ISO-5011', 'STD-ISO-16889', 'STD-ISO-4406', 'STD-ISO-8573-1', 'STD-NFPA-T2-14'],
  },

  'IND-MANUFACTURING': {
    id: 'IND-MANUFACTURING',
    name: 'Manufacturing',
    slug: 'manufacturing',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-HYDRAULIC', 'SYS-LUBRICATION', 'SYS-COMPRESSED-AIR'],
    technologies: ['TECH-NANOFORCE', 'TECH-SYNTRAX', 'TECH-DRYCORE'],
    standards: ['STD-ISO-16889', 'STD-ISO-4406', 'STD-ISO-8573-1', 'STD-NFPA-T2-14'],
  },

  'IND-POWER-GENERATION': {
    id: 'IND-POWER-GENERATION',
    name: 'Power Generation',
    slug: 'power-generation',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-LUBRICATION', 'SYS-HYDRAULIC', 'SYS-COOLING'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-SYNTRAX', 'TECH-NANOFORCE', 'TECH-THERMACORE'],
    standards: ['STD-ISO-5011', 'STD-ASTM-D6304', 'STD-ISO-16889', 'STD-ISO-4406'],
  },

  'IND-RAILWAY': {
    id: 'IND-RAILWAY',
    name: 'Railway',
    slug: 'railway',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-LUBRICATION', 'SYS-HYDRAULIC', 'SYS-COMPRESSED-AIR'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTRAX', 'TECH-NANOFORCE', 'TECH-DRYCORE'],
    standards: ['STD-ISO-5011', 'STD-ISO-16889', 'STD-ISO-4406', 'STD-ISO-8573-1'],
  },

  'IND-WASTE-MUNICIPAL': {
    id: 'IND-WASTE-MUNICIPAL',
    name: 'Waste & Municipal',
    slug: 'waste-municipal',
    contaminationSeverity: 'high',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    systems: ['SYS-AIR-INTAKE', 'SYS-FUEL-CLEANLINESS', 'SYS-HYDRAULIC', 'SYS-CABIN-AIR'],
    technologies: ['TECH-MACROCORE', 'TECH-SYNTAPORE', 'TECH-NANOFORCE', 'TECH-MICROKAPPA'],
    standards: ['STD-ISO-5011', 'STD-ASTM-D6304', 'STD-ISO-16889', 'STD-ISO-11155-1'],
  },

};
