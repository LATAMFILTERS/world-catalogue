/**
 * standards-registry.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Standards Registry — governed records of all industrial standards referenced
 * by Technology Architectures and Engineering Principles in the Knowledge Graph.
 *
 * EDR: EDR-A-001 — Why the Knowledge Graph Became the Platform Architecture
 */

import { MATURITY, type StandardRecord } from './registry-types';

export const STANDARDS_REGISTRY: Record<string, StandardRecord> = {

  // ── ISO Standards ─────────────────────────────────────────────────────────

  'STD-ISO-5011': {
    entityType: 'STANDARD',
    id: 'STD-ISO-5011',
    code: 'ISO 5011',
    issuingBody: 'International Organization for Standardization',
    title: 'Inlet air cleaning equipment for internal combustion engines and compressors — Performance testing',
    scope:
      'Defines test methods for measuring the performance of inlet air cleaning equipment: filtration efficiency, pressure drop, and dust-holding capacity. Uses ASTM A2 Fine standardized test dust. Applicable to air filter elements for internal combustion engines and air compressors.',
    applicableTechnologyIds: ['TECH-MACROCORE'],
    applicableEngineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001'],
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

  'STD-ISO-16889': {
    entityType: 'STANDARD',
    id: 'STD-ISO-16889',
    code: 'ISO 16889',
    issuingBody: 'International Organization for Standardization',
    title: 'Hydraulic fluid power — Filters — Multi-pass method for evaluating filtration performance',
    scope:
      'Defines the multi-pass test method for evaluating filter element performance in hydraulic fluid applications. Specifies the Beta ratio (filtration ratio) as the primary performance metric: β_x(c) = upstream particle count / downstream particle count at particle size x µm. Applicable to hydraulic filters and lube oil filters.',
    applicableTechnologyIds: ['TECH-SYNTRAX', 'TECH-NANOFORCE'],
    applicableEngineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-004', 'EP-INS-001'],
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

  'STD-ISO-4406': {
    entityType: 'STANDARD',
    id: 'STD-ISO-4406',
    code: 'ISO 4406',
    issuingBody: 'International Organization for Standardization',
    title: 'Hydraulic fluid power — Fluids — Method for coding the level of contamination by solid particles',
    scope:
      'Defines the three-number contamination code for reporting particle cleanliness levels in hydraulic and lube oil fluids. The code format is X/Y/Z where X = particles >4 µm(c), Y = particles >6 µm(c), Z = particles >14 µm(c), per 1 mL of fluid. Each number corresponds to a range code per Table 1 of the standard. Lower numbers represent cleaner fluids.',
    applicableTechnologyIds: ['TECH-SYNTRAX', 'TECH-NANOFORCE', 'TECH-SYNTEPORE'],
    applicableEngineeringPrincipleIds: ['EP-INS-001', 'EP-TRB-001'],
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

  'STD-ISO-8573-1': {
    entityType: 'STANDARD',
    id: 'STD-ISO-8573-1',
    code: 'ISO 8573-1',
    issuingBody: 'International Organization for Standardization',
    title: 'Compressed air — Part 1: Contaminants and purity classes',
    scope:
      'Defines the purity classes for compressed air: solid particles (Class 0–9), water (dew point Class 0–9), and oil content (Class 0–4). Each class specifies the maximum contaminant concentration or dew point. Class 1 is the highest purity; Class 9 is the lowest. The purity class designation uses the format [solid particle class]:[water class]:[oil class] (e.g., ISO 8573-1 Class 2:4:2 for painting applications).',
    applicableTechnologyIds: ['TECH-DRYCORE'],
    applicableEngineeringPrincipleIds: ['EP-CHE-001', 'EP-SEP-001', 'EP-PHS-001'],
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

  'STD-ISO-11155-1': {
    entityType: 'STANDARD',
    id: 'STD-ISO-11155-1',
    code: 'ISO 11155-1',
    issuingBody: 'International Organization for Standardization',
    title: 'Road vehicles — Air filters for passenger compartments — Part 1: Test for particulate filtration',
    scope:
      'Defines the test method for particulate filtration efficiency of cabin air filters in road vehicles and mobile equipment. Test particle: DEHS aerosol at 0.4 µm. Efficiency classes: Class E (>80%), Class F (>90%), Class H (>99.95%). Applicable to all vehicles where operator health protection from airborne particulate is required.',
    applicableTechnologyIds: ['TECH-MICROKAPPA'],
    applicableEngineeringPrincipleIds: ['EP-TRB-002', 'EP-SEP-001'],
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

  'STD-ASTM-D6304': {
    entityType: 'STANDARD',
    id: 'STD-ASTM-D6304',
    code: 'ASTM D6304',
    issuingBody: 'ASTM International',
    title: 'Standard Test Method for Determination of Water in Petroleum Products, Lubricating Oils, and Additives by Coulometric Karl Fischer Titration',
    scope:
      'Defines the Karl Fischer coulometric titration method for quantifying water content in petroleum products and fuels. Detection range: 10–25,000 ppm water by mass. Required for measuring water content in diesel fuel for HPCR injection system protection assessments. The <200 ppm water target for HPCR fuels is verified using this test method.',
    applicableTechnologyIds: ['TECH-HYDROCORE', 'TECH-SYNTEPORE'],
    applicableEngineeringPrincipleIds: ['EP-PHS-001', 'EP-PHS-002'],
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

  'STD-ISO-19438': {
    entityType: 'STANDARD',
    id: 'STD-ISO-19438',
    code: 'ISO 19438',
    issuingBody: 'International Organization for Standardization',
    title: 'Diesel fuel and petrol filters for internal combustion engines — Filtration efficiency using particle counting and contaminant retention capacity',
    scope:
      'Defines the multi-pass test method for evaluating fuel filter efficiency using particle counting. Uses AC Ultra Fine test contaminant. Specifies Beta ratio measurement for fuel filter applications. Applicable to primary and secondary fuel filters for diesel and petrol engines.',
    applicableTechnologyIds: ['TECH-SYNTEPORE'],
    applicableEngineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002'],
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

  'STD-NFPA-T2141': {
    entityType: 'STANDARD',
    id: 'STD-NFPA-T2141',
    code: 'NFPA T2.14.1',
    issuingBody: 'National Fluid Power Association',
    title: 'Hydraulic Fluid Power — Filter Elements — Fabrication Integrity Test Methods and Verification Procedures',
    scope:
      'Defines the fabrication integrity and element collapse pressure test for hydraulic filter elements. Specifies minimum collapse pressure requirements for filter elements at rated differential pressure. Collapse test uses ISO VG 46 hydraulic oil at 40°C. Applicable to all hydraulic line filter elements.',
    applicableTechnologyIds: ['TECH-NANOFORCE'],
    applicableEngineeringPrincipleIds: ['EP-SEP-001', 'EP-SEP-002'],
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

  'STD-ISO-16332': {
    entityType: 'STANDARD',
    id: 'STD-ISO-16332',
    code: 'ISO 16332',
    issuingBody: 'International Organization for Standardization',
    title: 'Diesel engines — Fuel filters — Test method for water separation efficiency',
    scope:
      'Defines the test method for evaluating water separation efficiency of fuel water separators. Uses controlled water injection into fuel flow and measures downstream water concentration by Karl Fischer titration. Applicable to primary fuel water separators in diesel engine fuel systems.',
    applicableTechnologyIds: ['TECH-HYDROCORE'],
    applicableEngineeringPrincipleIds: ['EP-PHS-001', 'EP-PHS-002'],
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

  'STD-IMO-MARPOL-ANNEX-VI': {
    entityType: 'STANDARD',
    id: 'STD-IMO-MARPOL-ANNEX-VI',
    code: 'IMO MARPOL Annex VI',
    issuingBody: 'International Maritime Organization',
    title: 'Prevention of Air Pollution from Ships — Regulations for the Prevention of Air Pollution from Ships',
    scope:
      'IMO MARPOL Annex VI establishes emission limits for NOx, SOx, and particulate matter from ship engines. Regulation 14 sets sulfur limits for marine fuels (0.5% global, 0.1% Emission Control Areas). Relevant to marine fuel selection and combustion system protection through fuel filtration.',
    applicableTechnologyIds: ['TECH-MARINECLEAN'],
    applicableEngineeringPrincipleIds: ['EP-SEP-001'],
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

  'STD-DIN-71220': {
    entityType: 'STANDARD',
    id: 'STD-DIN-71220',
    code: 'DIN 71220',
    issuingBody: 'Deutsches Institut für Normung',
    title: 'Cabin air filtration — Combination filters for motor vehicles — Chemical filtration efficiency test',
    scope:
      'Defines the test method for chemical filtration efficiency of combination cabin air filters (particulate + activated carbon). Tests gaseous contaminant removal: benzene, toluene, cyclohexane, and other VOCs. Applicable to cabin air filters with activated carbon chemical protection layer.',
    applicableTechnologyIds: ['TECH-MICROKAPPA'],
    applicableEngineeringPrincipleIds: ['EP-TRB-002', 'EP-CHE-001'],
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

  'STD-SAE-J726': {
    entityType: 'STANDARD',
    id: 'STD-SAE-J726',
    code: 'SAE J726',
    issuingBody: 'SAE International',
    title: 'Air Cleaner Test Code',
    scope:
      'Defines the performance test code for air cleaners used in automotive and truck applications. Specifies test conditions, dust types, and measurement methods for filtration efficiency and restriction. Companion standard to ISO 5011 for North American market applications.',
    applicableTechnologyIds: ['TECH-MACROCORE'],
    applicableEngineeringPrincipleIds: ['EP-SEP-004', 'EP-SEP-001'],
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

export function getStandardById(code: string): StandardRecord | undefined {
  return Object.values(STANDARDS_REGISTRY).find((s) => s.code === code);
}

export function getStandardsForTechnology(technologyId: string): StandardRecord[] {
  return Object.values(STANDARDS_REGISTRY).filter((s) =>
    s.applicableTechnologyIds.includes(technologyId)
  );
}

export function getStandardsForPrinciple(principleId: string): StandardRecord[] {
  return Object.values(STANDARDS_REGISTRY).filter((s) =>
    s.applicableEngineeringPrincipleIds.includes(principleId)
  );
}
