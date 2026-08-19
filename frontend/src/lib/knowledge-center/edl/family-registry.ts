/**
 * edl/family-registry.ts
 * Engineering Data Layer — Product Family Entity Registry
 *
 * 12 canonical Product Family entities with permanent FAM-xxx identifiers.
 * Families are the Level 6 nodes in the KC Engineering Authority Hierarchy.
 * Each family belongs to exactly one Protection System.
 */

import type { EDLFamilyEntity, EDLFamilyRegistry } from './types';

export const EDL_FAMILIES: EDLFamilyRegistry = {

  // ── Air Intake System Families ────────────────────────────────────────────

  'FAM-PRIMARY-AIR': {
    id: 'FAM-PRIMARY-AIR',
    name: 'Primary Air Filters',
    slug: 'primary-air',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-AIR-INTAKE',
    primaryTechnology: 'TECH-MACROCORE',
    standards: ['STD-ISO-5011', 'STD-SAE-J1539'],
    hdPrefix: 'EA1',
    ldPrefix: 'EA3',
    dutyClass: 'HD+LD',
  },

  'FAM-SECONDARY-AIR': {
    id: 'FAM-SECONDARY-AIR',
    name: 'Secondary Air Filters',
    slug: 'secondary-air',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-AIR-INTAKE',
    primaryTechnology: 'TECH-MACROCORE',
    standards: ['STD-ISO-5011'],
    hdPrefix: 'EA1',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  'FAM-SAFETY-ELEMENTS': {
    id: 'FAM-SAFETY-ELEMENTS',
    name: 'Safety Filter Elements',
    slug: 'safety-elements',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-AIR-INTAKE',
    primaryTechnology: 'TECH-MACROCORE',
    standards: ['STD-ISO-5011'],
    hdPrefix: 'EA1',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  'FAM-AIR-CLEANER-HOUSINGS': {
    id: 'FAM-AIR-CLEANER-HOUSINGS',
    name: 'Air Cleaner Housings',
    slug: 'air-cleaner-housings',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-AIR-INTAKE',
    primaryTechnology: 'TECH-INTEKCORE',
    standards: ['STD-ISO-5011'],
    hdPrefix: 'EA2',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  // ── Fuel Cleanliness System Families ─────────────────────────────────────

  'FAM-PRIMARY-FUEL': {
    id: 'FAM-PRIMARY-FUEL',
    name: 'Primary Fuel Filters',
    slug: 'primary-fuel',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-FUEL-CLEANLINESS',
    primaryTechnology: 'TECH-SYNTAPORE',
    standards: ['STD-ASTM-D6304', 'STD-ISO-16332'],
    hdPrefix: 'EF9',
    ldPrefix: 'EF3',
    dutyClass: 'HD+LD',
  },

  'FAM-SECONDARY-FUEL': {
    id: 'FAM-SECONDARY-FUEL',
    name: 'Secondary Fuel Filters',
    slug: 'secondary-fuel',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-FUEL-CLEANLINESS',
    primaryTechnology: 'TECH-SYNTAPORE',
    standards: ['STD-ASTM-D6304', 'STD-ISO-16332'],
    hdPrefix: 'EF9',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  'FAM-FUEL-WATER-SEPARATORS': {
    id: 'FAM-FUEL-WATER-SEPARATORS',
    name: 'Fuel Water Separators',
    slug: 'fuel-water-separators',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-FUEL-CLEANLINESS',
    primaryTechnology: 'TECH-HYDROCORE',
    standards: ['STD-ASTM-D6304', 'STD-ISO-12937'],
    hdPrefix: 'ES9',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  // ── Lubrication System Families ───────────────────────────────────────────

  'FAM-OIL-FILTERS': {
    id: 'FAM-OIL-FILTERS',
    name: 'Oil Filters',
    slug: 'oil-filters',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-LUBRICATION',
    primaryTechnology: 'TECH-SYNTRAX',
    standards: ['STD-ISO-16889', 'STD-ISO-4406'],
    hdPrefix: 'EL8',
    ldPrefix: 'EL3',
    dutyClass: 'HD+LD',
  },

  // ── Hydraulic System Families ─────────────────────────────────────────────

  'FAM-HYDRAULIC-FILTERS': {
    id: 'FAM-HYDRAULIC-FILTERS',
    name: 'Hydraulic Filters',
    slug: 'hydraulic-filters',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-HYDRAULIC',
    primaryTechnology: 'TECH-NANOFORCE',
    standards: ['STD-ISO-16889', 'STD-ISO-4406', 'STD-NFPA-T2-14'],
    hdPrefix: 'EH6',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  // ── Cooling System Families ───────────────────────────────────────────────

  'FAM-COOLANT-FILTERS': {
    id: 'FAM-COOLANT-FILTERS',
    name: 'Coolant Filters',
    slug: 'coolant-filters',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-COOLING',
    primaryTechnology: 'TECH-THERMACORE',
    standards: [],
    hdPrefix: 'EW7',
    ldPrefix: null,
    dutyClass: 'HD',
  },

  // ── Cabin Air System Families ─────────────────────────────────────────────

  'FAM-CABIN-FILTERS': {
    id: 'FAM-CABIN-FILTERS',
    name: 'Cabin Air Filters',
    slug: 'cabin-filters',
    status: 'published',
    version: '1.0',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-CABIN-AIR',
    primaryTechnology: 'TECH-MICROKAPPA',
    standards: ['STD-ISO-11155-1', 'STD-DIN-71220'],
    hdPrefix: 'EC1',
    ldPrefix: 'EC3',
    dutyClass: 'HD+LD',
  },

  // ── Compressed Air System Families ───────────────────────────────────────

  'FAM-AIR-DRYER-FILTERS': {
    id: 'FAM-AIR-DRYER-FILTERS',
    name: 'Air Dryer Filters',
    slug: 'air-dryer-filters',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
    system: 'SYS-COMPRESSED-AIR',
    primaryTechnology: 'TECH-DRYCORE',
    standards: ['STD-ISO-8573-1'],
    hdPrefix: 'ED4',
    ldPrefix: null,
    dutyClass: 'HD',
  },

};
