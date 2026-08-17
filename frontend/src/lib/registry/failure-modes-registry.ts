/**
 * failure-modes-registry.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Failure Modes Registry — governed industrial failure mode records.
 * Each failure mode traces a root cause chain to a measurable industrial consequence
 * and maps to the Technology Architectures that control it.
 */

import { MATURITY, type FailureModeRecord } from './registry-types';

export const FAILURE_MODES_REGISTRY: Record<string, FailureModeRecord> = {

  'FM-AIR-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-AIR-001',
    systemContext: 'Air Intake — Internal combustion engine, diesel, all duty classes',
    causeChain:
      'Unfiltered or under-filtered combustion air → airborne silica and mineral dust ingested into cylinder → abrasive particles transiting piston-ring to cylinder-bore interface → two-body abrasive wear of cylinder bore and ring land → ring seal degradation → blow-by gas increase → oil contamination acceleration → ring and bore replacement required',
    measurableConsequence:
      'Cylinder bore wear rate increase of 3–10× versus ISO 5011-compliant filtered operation. Engine overhaul interval reduced from 12,000–20,000 hours (filtered) to 2,000–5,000 hours (unfiltered or filter bypass).',
    industrialImpact:
      'Engine overhaul cost: USD 20,000–150,000 per unit. Off-service time: 7–21 days. Unplanned overhaul frequency increase: 3–5× over fleet lifecycle versus fleet with maintained air filtration.',
    relevantStandardRefs: ['ISO 5011', 'SAE J726'],
    controlledByTechnologyIds: ['TECH-MACROCORE'],
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

  'FM-LUB-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-LUB-001',
    systemContext: 'Engine Lube Oil — Diesel and gasoline engines, all duty classes',
    causeChain:
      'Particle contamination above ISO 4406 target in engine oil → metallic and mineral particles transit bearing clearances (5–15 µm) → abrasive micro-cutting of bearing surface (journal + shell) → bearing clearance increase beyond design tolerance → oil film breakdown at high load → localized temperature spike at bearing surface → bearing seizure and crankshaft damage',
    measurableConsequence:
      'ISO 19/17/14 (commodity filter) versus ISO 16/14/11 (SYNTRAX): bearing life reduction 3–5×. Engine bearing lifespan: 15,000–25,000 hours (target cleanliness) versus 3,000–5,000 hours (poor cleanliness).',
    industrialImpact:
      'Engine overhaul at bearing failure: USD 30,000–200,000 per large diesel. Unplanned off-service: 5–14 days for bearing replacement. Full seizure event: crankshaft replacement adds USD 20,000–80,000 to repair cost.',
    relevantStandardRefs: ['ISO 4406', 'ISO 16889', 'SAE J1858'],
    controlledByTechnologyIds: ['TECH-SYNTRAX'],
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

  'FM-HYD-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-HYD-001',
    systemContext: 'Hydraulic System — Proportional valve and servo valve circuits, mobile machinery',
    causeChain:
      'Particle contamination above ISO 4406 target in hydraulic fluid → particles transit proportional valve spool-bore clearance (1–5 µm) at operating pressure (150–450 bar) → micro-scoring of spool surface → internal leakage increase beyond specification → hydraulic position control error → valve seizure → machine control loss',
    measurableConsequence:
      'ISO 17/15/12 versus ISO 19/17/14: proportional valve service life 3–8× longer at target cleanliness. Servo valve manufacturers specify rejection of systems operating above ISO 16/14/11.',
    industrialImpact:
      'Proportional valve replacement: USD 800–5,000 per valve. Multi-valve machine (10–30 valves): USD 8,000–150,000 per contamination event. Unplanned off-service: 2–5 days (parts availability dependent).',
    relevantStandardRefs: ['ISO 4406', 'ISO 16889', 'NFPA T2.14.1', 'DIN 51524'],
    controlledByTechnologyIds: ['TECH-NANOFORCE'],
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

  'FM-FUEL-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-FUEL-001',
    systemContext: 'Fuel System — HPCR diesel injection, all diesel engines with common rail injection',
    causeChain:
      'Free water in diesel fuel above 200 ppm → water transit to high-pressure common rail at 1,600–2,500 bar injection pressure → hydraulic fracture of injector tip at water-fuel interface → injector tip cracking → injection spray pattern distortion → combustion inefficiency and incomplete combustion → injector replacement required',
    measurableConsequence:
      'HPCR injector tip failure rate increases 5–10× when fuel water content exceeds 500 ppm. Injector tip failure is immediate — no progressive degradation warning. Each event requires full injector set inspection and likely replacement.',
    industrialImpact:
      'Full injector set replacement (6-cylinder): USD 2,400–12,000 per event. Off-service: 2–5 days. Fleets with recurring fuel water contamination report 15–25% of unscheduled maintenance events attributable to injection system water damage.',
    relevantStandardRefs: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    controlledByTechnologyIds: ['TECH-TURBOCORE'],
    contaminationTypeId: 'CONT-WATER-FUEL',
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

  'FM-HPCR-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-HPCR-001',
    systemContext: 'Fuel System — High-Pressure Common Rail injection, Tier 4 Final and Euro V/VI engines',
    causeChain:
      'Particle contamination above 4 µm in HPCR fuel circuit → particles transit injector plunger-barrel clearance (1–3 µm) at 2,000 bar → micro-scoring of plunger surface → internal leakage increase → injection quantity drift → fuel efficiency degradation and emissions non-compliance → injector replacement',
    measurableConsequence:
      'Injector service life at correct cleanliness (ISO 12/10/7): 10,000–15,000 hours. At uncontrolled cleanliness (ISO 18/16/13): 2,000–4,000 hours. Fuel consumption increase from injection quantity drift: 3–8% before failure threshold.',
    industrialImpact:
      'Premature injector failure in Tier 4 Final engines triggers emissions non-compliance shutdown in regulated jurisdictions. Injector replacement cost: USD 400–2,000 per injector. 6-cylinder: USD 2,400–12,000. Off-service: 2–5 days.',
    relevantStandardRefs: ['ISO 19438', 'ASTM D6304', 'ISO 4406'],
    controlledByTechnologyIds: ['TECH-SYNTAPORE'],
    contaminationTypeId: 'CONT-PARTICLE-FUEL',
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

  'FM-COOL-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-COOL-001',
    systemContext: 'Cooling System — Wet-liner diesel engines, >300 kW, all applications',
    causeChain:
      'SCA depletion below protective threshold (nitrite/molybdate inhibitor below 0.3 SCA units/L) → liner surface passivation layer lost → vapor bubbles form at liner outer surface during combustion pressure pulses → cavitation implosion at liner surface removes metal at 0.01–0.1 mm/1,000 hours → liner wall perforation → coolant-oil mixing → engine seizure',
    measurableConsequence:
      'Liner perforation rate without SCA protection can occur well short of engine design life in high-load diesel applications. Maintaining SCA concentration within the range specified for the approved application is a primary lever for extending liner life toward engine design life; the specific hours achieved must be confirmed by coolant condition monitoring rather than assumed. Perforation reduces liner wall from 8–12 mm to failure thickness.',
    industrialImpact:
      'Liner replacement per engine: USD 5,000–25,000 plus 3–7 day overhaul. Catastrophic coolant-oil mixing causes bearing seizure: additional USD 30,000–100,000 repair. Fleet operators without SCA management report liner cavitation as the leading cause of catastrophic engine failure beyond 2,000 hours.',
    relevantStandardRefs: ['ASTM D3306', 'ASTM D6210', 'SAE J1941'],
    controlledByTechnologyIds: ['TECH-THERMACORE'],
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

  'FM-AIR-COMP-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-AIR-COMP-001',
    systemContext: 'Compressed Air System — Pneumatic actuators, process equipment, industrial plants',
    causeChain:
      'Liquid water carryover past failed or absent coalescing filtration → water enters pneumatic actuator air supply → O-ring lubricant washout from actuator sealing surfaces → actuator seal failure → internal air bypass → valve control position loss → process shutdown',
    measurableConsequence:
      'Pneumatic actuator O-ring failure rate: 2–5× higher with liquid water carryover versus dry compressed air. O-ring service life reduced from 3–5 years to 6–18 months with liquid water exposure.',
    industrialImpact:
      'Actuator O-ring replacement: USD 50–500 per actuator. Critical process valve replacement without O-ring inventory: 1–3 day lead time. Process shutdown during critical control valve actuator failure: USD 10,000–100,000 per event for process-critical applications.',
    relevantStandardRefs: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
    controlledByTechnologyIds: ['TECH-DRYCORE'],
    contaminationTypeId: 'CONT-WATER-COMPRESSED-AIR',
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

  'FM-CAB-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-CAB-001',
    systemContext: 'Cabin Air — Operator cab, mining, quarrying, agricultural, construction equipment',
    causeChain:
      'No cabin air filtration or filter past service life → respirable crystalline silica (RCS) penetrates cab HVAC → operator breathing zone RCS concentration exceeds 0.05 mg/m³ threshold → chronic occupational RCS inhalation → silicosis (irreversible fibrotic lung disease) → disability',
    measurableConsequence:
      'Silicosis has no cure after diagnosis. Progressive massive fibrosis (advanced silicosis) reduces lung function to <50% over 5–15 years. Risk threshold exposure (NIOSH REL): 0.05 mg/m³ RCS over 8-hour shift. Mining cab without filtration: 0.5–5 mg/m³ RCS at dust storm event.',
    industrialImpact:
      'Compensation claims per silicosis diagnosis: USD 100,000–2,000,000 depending on jurisdiction. Regulatory fine per non-compliant vehicle: USD 5,000–50,000. Class action settlements for fleet operators without cabin filtration compliance: USD 10M–500M (precedent established in Australian mining industry, 2010–2020).',
    relevantStandardRefs: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220'],
    controlledByTechnologyIds: ['TECH-MICROKAPPA'],
    contaminationTypeId: 'CONT-RCS-SILICA',
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

  'FM-MAR-001': {
    entityType: 'FAILURE_MODE',
    id: 'FM-MAR-001',
    systemContext: 'Marine — Main propulsion diesel engine, heavy fuel oil (HFO) operation',
    causeChain:
      'Catalytic fines (Al₂O₃ + SiO₂) in HFO above ISO 8217 limit of 60 mg/kg → catalytic fines transit undersized or failed fuel purification → abrasive particles enter fuel injection pump plunger-barrel interface → abrasive wear of pump plunger → injection quantity control loss → fuel system damage',
    measurableConsequence:
      'Catalytic fine concentration >80 mg/kg in delivered fuel causes pump plunger wear detectable within 500 operating hours. Pump plunger dimensional tolerance loss beyond 5 µm degrades injection quantity control by >10%.',
    industrialImpact:
      'Main engine fuel injection pump replacement: USD 50,000–300,000 depending on engine size. Port repair delay: USD 10,000–100,000 per day off-hire. Loss of propulsion in restricted waters: risk of grounding (unquantified liability).',
    relevantStandardRefs: ['ISO 8217', 'IMO MARPOL Annex VI', 'ISO 4406'],
    controlledByTechnologyIds: ['TECH-MARINECLEAN'],
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

export function getFailureModesByTechnology(technologyId: string): FailureModeRecord[] {
  return Object.values(FAILURE_MODES_REGISTRY).filter((fm) =>
    fm.controlledByTechnologyIds.includes(technologyId)
  );
}

export function getFailureModesBySystem(systemContext: string): FailureModeRecord[] {
  return Object.values(FAILURE_MODES_REGISTRY).filter((fm) =>
    fm.systemContext.toLowerCase().includes(systemContext.toLowerCase())
  );
}
