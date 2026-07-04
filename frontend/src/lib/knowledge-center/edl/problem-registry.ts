/**
 * edl/problem-registry.ts
 * Engineering Data Layer — Problem Entity Registry
 *
 * 15 canonical Problem entities. Governance metadata is complete.
 * Engineering content (definition, failureProgression, etc.) is Phase 3.
 */

import type { EDLProblemEntity, EDLProblemRegistry } from './types';

export const EDL_PROBLEMS: EDLProblemRegistry = {

  'PROB-ABRASIVE-WEAR': {
    id: 'PROB-ABRASIVE-WEAR',
    name: 'Abrasive Wear',
    slug: 'abrasive-wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-ADHESIVE-WEAR': {
    id: 'PROB-ADHESIVE-WEAR',
    name: 'Adhesive Wear',
    slug: 'adhesive-wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-BEARING-WEAR': {
    id: 'PROB-BEARING-WEAR',
    name: 'Bearing Wear',
    slug: 'bearing-wear',
    category: 'mechanical-wear',
    severity: 'critical',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-INJECTOR-WEAR': {
    id: 'PROB-INJECTOR-WEAR',
    name: 'Injector Wear',
    slug: 'injector-wear',
    category: 'mechanical-wear',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-SILICON-DUST-INGESTION': {
    id: 'PROB-SILICON-DUST-INGESTION',
    name: 'Silicon Dust Ingestion',
    slug: 'silicon-dust-ingestion',
    category: 'contamination',
    severity: 'critical',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-WATER-INGRESS': {
    id: 'PROB-WATER-INGRESS',
    name: 'Water Ingress',
    slug: 'water-ingress',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-FUEL-CONTAMINATION': {
    id: 'PROB-FUEL-CONTAMINATION',
    name: 'Fuel Contamination',
    slug: 'fuel-contamination',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-AIR-RESTRICTION': {
    id: 'PROB-AIR-RESTRICTION',
    name: 'Air Restriction',
    slug: 'air-restriction',
    category: 'contamination',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-CAVITATION': {
    id: 'PROB-CAVITATION',
    name: 'Cavitation',
    slug: 'cavitation',
    category: 'structural-failure',
    severity: 'critical',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-PUMP-FAILURE': {
    id: 'PROB-PUMP-FAILURE',
    name: 'Pump Failure',
    slug: 'pump-failure',
    category: 'structural-failure',
    severity: 'critical',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-FILTER-COLLAPSE': {
    id: 'PROB-FILTER-COLLAPSE',
    name: 'Filter Collapse',
    slug: 'filter-collapse',
    category: 'structural-failure',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-MEDIA-FATIGUE': {
    id: 'PROB-MEDIA-FATIGUE',
    name: 'Filter Media Fatigue',
    slug: 'media-fatigue',
    category: 'structural-failure',
    severity: 'medium',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-VARNISH-FORMATION': {
    id: 'PROB-VARNISH-FORMATION',
    name: 'Varnish Formation',
    slug: 'varnish-formation',
    category: 'chemical-degradation',
    severity: 'high',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-OXIDATION': {
    id: 'PROB-OXIDATION',
    name: 'Oxidative Degradation',
    slug: 'oxidation',
    category: 'chemical-degradation',
    severity: 'medium',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

  'PROB-MICROBIAL-GROWTH': {
    id: 'PROB-MICROBIAL-GROWTH',
    name: 'Microbial Growth',
    slug: 'microbial-growth',
    category: 'biological',
    severity: 'medium',
    status: 'draft',
    version: '0.1',
    created: '2026-07-04',
    lastModified: '2026-07-04',
    contentPhase: 3,
  },

};
