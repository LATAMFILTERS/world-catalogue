/**
 * contamination-registry.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Contamination Registry — governed contamination type records.
 * Each entry classifies a contamination type, its sources, phase state,
 * particle characteristics, and the failure modes it initiates.
 */

import { MATURITY, type ContaminationRecord } from './registry-types';

export const CONTAMINATION_REGISTRY: Record<string, ContaminationRecord> = {

  'CONT-DUST-MINERAL': {
    entityType: 'CONTAMINATION',
    id: 'CONT-DUST-MINERAL',
    name: 'Airborne Mineral Dust — Silica and Mixed Mineral Fraction',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — airborne suspension in ambient air',
    particleSizeRange: '0.5–500 µm (PM10 fraction: <10 µm; Respirable fraction: <4 µm)',
    sources: [
      'Mine haul road dust (crushed rock resuspension)',
      'Agricultural field tillage (soil disturbance)',
      'Construction site earthworks (excavation)',
      'Unpaved road operation (vehicle re-entrainment)',
      'Quarrying and blasting operations (airborne mineral dust)',
      'Desert and arid environment wind-borne dust',
    ],
    initiatedFailureModeIds: ['FM-AIR-001'],
    detectionStandards: ['ISO 5011', 'SAE J726', 'ASTM E2550'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-WEAR-PARTICLE-OIL': {
    entityType: 'CONTAMINATION',
    id: 'CONT-WEAR-PARTICLE-OIL',
    name: 'Metallic Wear Particles in Engine Lube Oil',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — suspended in petroleum or synthetic engine oil',
    particleSizeRange:
      '0.5–100 µm (critical size class: 5–20 µm — matches bearing clearances of 5–15 µm)',
    sources: [
      'Engine bearing surface wear (Fe, Al, Cu particles)',
      'Piston ring and cylinder bore wear (Fe, Cr particles)',
      'Camshaft and tappet wear (Fe, Cr)',
      'Gear train wear (Fe, Ni particles)',
      'Turbocharger bearing wear (Fe, Al)',
      'Combustion-derived carbon agglomerates',
      'External ingress through crankcase ventilation',
    ],
    initiatedFailureModeIds: ['FM-LUB-001'],
    detectionStandards: ['ISO 4406', 'ISO 11500', 'ASTM D7596'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-WEAR-PARTICLE-HYD': {
    entityType: 'CONTAMINATION',
    id: 'CONT-WEAR-PARTICLE-HYD',
    name: 'Metallic and Mineral Particles in Hydraulic Fluid',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — suspended in mineral or synthetic hydraulic fluid',
    particleSizeRange:
      '1–500 µm (critical size class: 1–5 µm — matches proportional valve spool-bore clearance of 1–5 µm)',
    sources: [
      'Pump internal wear (Fe, Cu particles from pump surfaces)',
      'Cylinder bore wear (Fe, chrome plating particles)',
      'Motor internal wear (Fe, Al)',
      'Valve body and spool wear (Fe, bronze)',
      'Pipe and fitting corrosion products',
      'External ingress through cylinder rod seals (dust, soil)',
      'Built-in contamination from assembly (manufacturing residue)',
    ],
    initiatedFailureModeIds: ['FM-HYD-001'],
    detectionStandards: ['ISO 4406', 'ISO 11500', 'ISO 16889'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-WATER-FUEL': {
    entityType: 'CONTAMINATION',
    id: 'CONT-WATER-FUEL',
    name: 'Water in Diesel Fuel — Free and Emulsified Phase',
    contaminantClass: 'LIQUID_PHASE',
    phaseState: 'Liquid — immiscible phase in diesel fuel, as free water layer, emulsion, or dissolved water',
    particleSizeRange: 'Free water droplets: >100 µm; Emulsified water droplets: 1–100 µm; Dissolved water: molecular',
    sources: [
      'Condensation in above-ground storage tanks (thermal cycling: 50–200 ppm per week)',
      'Ground water ingress into underground storage tanks',
      'Contaminated fuel supply (poor fuel handling practices)',
      'Tanker truck residual water from prior load',
      'Humidity absorption in biodiesel fuel blends (B5–B20)',
      'Refueling in rain or wet conditions (open fuel caps)',
    ],
    initiatedFailureModeIds: ['FM-FUEL-001'],
    detectionStandards: ['ASTM D6304', 'ISO 12937', 'ASTM D4928'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-PARTICLE-FUEL': {
    entityType: 'CONTAMINATION',
    id: 'CONT-PARTICLE-FUEL',
    name: 'Particulate Contamination in Diesel Fuel for HPCR Systems',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — suspended in diesel fuel',
    particleSizeRange:
      '1–500 µm (critical size class: >4 µm — exceeds HPCR plunger-barrel clearance of 1–3 µm)',
    sources: [
      'Tank corrosion products (rust from steel storage tanks)',
      'Biological contamination debris (bacterial growth in stored fuel)',
      'Fuel pump and filter element residue',
      'Pipe scale and weld slag from fuel distribution infrastructure',
      'External ingress during refueling (airborne dust, tank opening)',
      'Fuel additive precipitation (wax crystals in cold weather)',
    ],
    initiatedFailureModeIds: ['FM-HPCR-001'],
    detectionStandards: ['ISO 19438', 'ISO 4406', 'ASTM D7619'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-RCS-SILICA': {
    entityType: 'CONTAMINATION',
    id: 'CONT-RCS-SILICA',
    name: 'Respirable Crystalline Silica (RCS) — Occupational Airborne Hazard',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — fine airborne suspension, respirable fraction in ambient air',
    particleSizeRange:
      'Respirable fraction: <4 µm aerodynamic diameter (fraction that deposits in gas exchange region of lung)',
    sources: [
      'Drilling and blasting in siliceous rock formations',
      'Rock crushing and ore processing operations',
      'Mine haul road dust (crushed rock with crystalline silica content)',
      'Tunnel boring and underground development',
      'Agricultural soil disturbance (siliceous soils)',
      'Sandblasting and abrasive cutting operations',
      'Construction demolition of concrete and masonry',
    ],
    initiatedFailureModeIds: ['FM-CAB-001'],
    detectionStandards: ['ISO 11155-1', 'NIOSH 7500', 'OSHA ID-142'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-WATER-COMPRESSED-AIR': {
    entityType: 'CONTAMINATION',
    id: 'CONT-WATER-COMPRESSED-AIR',
    name: 'Liquid Water and Water Vapor in Compressed Air',
    contaminantClass: 'LIQUID_PHASE',
    phaseState: 'Liquid aerosol and saturated vapor in compressed air at operating pressure',
    particleSizeRange: 'Liquid droplets: 0.1–500 µm; Dissolved vapor: molecular',
    sources: [
      'Atmospheric humidity compression (ambient air with 40–80% relative humidity)',
      'Compressor intercooler condensation (temperature drop between stages)',
      'Aftercooler condensation (cooling from compression temperature to ambient)',
      'Distribution line cooling (pipe network heat loss)',
      'Demand variation — low flow periods allow longer contact time for condensation',
    ],
    initiatedFailureModeIds: ['FM-AIR-COMP-001'],
    detectionStandards: ['ISO 8573-1', 'ISO 8573-3'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

  'CONT-CATALYTIC-FINES-MARINE': {
    entityType: 'CONTAMINATION',
    id: 'CONT-CATALYTIC-FINES-MARINE',
    name: 'Catalytic Fines (Al₂O₃ + SiO₂) in Heavy Fuel Oil',
    contaminantClass: 'SOLID_PARTICLE',
    phaseState: 'Solid — suspended in heavy fuel oil (HFO) or very low sulfur fuel oil (VLSFO)',
    particleSizeRange: '1–100 µm (most damaging: 5–30 µm — exceeds plunger clearances)',
    sources: [
      'Fluid catalytic cracking (FCC) unit catalyst carry-over in refinery residue fractions',
      'Crude blending of high-catfine residue with distillate components',
      'Incomplete catalyst separation in FCC unit cyclones',
      'Blending and transfer contamination at bunker supply terminal',
    ],
    initiatedFailureModeIds: ['FM-MAR-001'],
    detectionStandards: ['ISO 8217', 'IP 501', 'ASTM D5184'],
    maturity: MATURITY.PUBLISHED,
    createdDate: '2026-07-01',
    versionHistory: [
      {
        version: '1.0.0',
        publishedDate: '2026-07-01',
        approvedBy: 'Knowledge Authority',
        changeNote: 'Initial publication — Engineering Foundation Phase 1',
      },
    ],
  },

} as const;

// ── Accessor functions ───────────────────────────────────────────────────────

export function getContaminationByClass(
  contaminantClass: ContaminationRecord['contaminantClass']
): ContaminationRecord[] {
  return Object.values(CONTAMINATION_REGISTRY).filter(
    (c) => c.contaminantClass === contaminantClass
  );
}

export function getContaminationForFailureMode(failureModeId: string): ContaminationRecord[] {
  return Object.values(CONTAMINATION_REGISTRY).filter((c) =>
    c.initiatedFailureModeIds.includes(failureModeId)
  );
}
