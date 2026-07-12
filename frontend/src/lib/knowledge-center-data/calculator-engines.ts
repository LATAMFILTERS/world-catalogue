/**
 * calculator-engines.ts
 * ELIMFILTERS Knowledge Center — Engineering Calculator Computation Functions
 *
 * Pure functions only. No imports from other KC modules.
 * All formulae are derived from published standards (ISO, SAE, ASTM, NFPA).
 * These functions are tested in __tests__/calculators.test.ts.
 *
 * Dependency: none
 */

// ── 6A-01: ISO 4406 Cleanliness Code Converter ──────────────────────────────
// Source: ISO 4406:2021 §5, Table 1

/**
 * Convert a particle count (particles/mL) to an ISO 4406:2021 range code.
 * Range N covers the interval: 2^(N-1) < count ≤ 2^N  (for N ≥ 1).
 * Returns 0 for count ≤ 0.
 */
export function iso4406RangeCode(count: number): number {
  if (!isFinite(count) || count <= 0) return 0;
  if (count <= 1) return 1;
  return Math.ceil(Math.log2(count));
}

/**
 * Decode an ISO 4406 range code to particle count bounds (particles/mL).
 * Returns { min, max } where min = 2^(N-1) and max = 2^N.
 */
export function iso4406CodeToRange(code: number): { min: number; max: number } {
  if (code <= 0) return { min: 0, max: 0 };
  if (code === 1) return { min: 0, max: 1 };
  return { min: Math.pow(2, code - 1), max: Math.pow(2, code) };
}

export interface Iso4406Code {
  n4: number;   // range code for ≥4 µm(c)
  n6: number;   // range code for ≥6 µm(c)
  n14: number;  // range code for ≥14 µm(c)
}

export function countsToIso4406Code(counts: { c4: number; c6: number; c14: number }): Iso4406Code {
  return {
    n4:  iso4406RangeCode(counts.c4),
    n6:  iso4406RangeCode(counts.c6),
    n14: iso4406RangeCode(counts.c14),
  };
}

export function iso4406CodeToString(code: Iso4406Code): string {
  return `${code.n4}/${code.n6}/${code.n14}`;
}

// ── 6A-02: Beta Ratio ⇄ Efficiency Calculator ───────────────────────────────
// Source: ISO 16889:2022 §3.1.2

/**
 * Convert Beta ratio to single-pass filtration efficiency (%).
 * E_x(c) = (1 − 1 / β_x(c)) × 100
 */
export function betaToEfficiency(beta: number): number {
  if (!isFinite(beta) || beta <= 1) return 0;
  return (1 - 1 / beta) * 100;
}

/**
 * Convert single-pass filtration efficiency (%) to Beta ratio.
 * β_x(c) = 1 / (1 − E_x(c) / 100)
 * Returns Infinity for efficiency = 100%.
 */
export function efficiencyToBeta(efficiency: number): number {
  if (!isFinite(efficiency) || efficiency < 0) return 1;
  if (efficiency >= 100) return Infinity;
  return 1 / (1 - efficiency / 100);
}

// ── 6A-03: Pressure Drop Estimator ──────────────────────────────────────────
// Source: ISO 3968:2017, Darcy's Law for filter media (laminar flow)

/**
 * Estimate differential pressure by proportional scaling from a reference point.
 * ΔP = ΔP_ref × (Q / Q_ref) × (μ / μ_ref)
 * Valid in the Darcy flow regime (Re_media < 0.1).
 *
 * @param dPRef  - Reference differential pressure at Q_ref and μ_ref [Pa]
 * @param Q      - Operating flow rate [L/min]
 * @param QRef   - Reference flow rate [L/min]
 * @param mu     - Operating dynamic viscosity [mPa·s]
 * @param muRef  - Reference dynamic viscosity [mPa·s] (default 32 mPa·s = VG46 @ 40°C)
 */
export function pressureDropEstimate(
  dPRef: number,
  Q: number,
  QRef: number,
  mu: number,
  muRef: number,
): number {
  if (QRef <= 0 || muRef <= 0) return 0;
  return dPRef * (Q / QRef) * (mu / muRef);
}

// ── 6A-04: Dirt Holding Capacity Planning Estimator ─────────────────────────
// Source: ISO 16889:2022 Annex C; SAE J1299:2008

export type FilterMediaType = 'cellulose' | 'synthetic' | 'glass-fiber';

// Dust loading capacity ranges [g/m²] from SAE J1299 and published media data
const DHC_RANGES: Record<FilterMediaType, { min: number; max: number }> = {
  'cellulose':   { min: 50,  max: 150 },
  'synthetic':   { min: 100, max: 300 },
  'glass-fiber': { min: 150, max: 400 },
};

/**
 * Estimate dirt holding capacity range [g] from media area and type.
 * Planning estimate only — ISO 16889 multipass testing required for specifications.
 */
export function dhcEstimate(
  mediaAreaM2: number,
  mediaType: FilterMediaType,
): { min: number; max: number; mid: number } {
  const r = DHC_RANGES[mediaType];
  return {
    min: mediaAreaM2 * r.min,
    max: mediaAreaM2 * r.max,
    mid: mediaAreaM2 * ((r.min + r.max) / 2),
  };
}

/**
 * Estimate service interval from DHC and contamination ingestion.
 * I = DHC / (C_in × Q × 60)  [hours]
 */
export function intervalFromDhc(
  dhcG: number,
  cInMgPerL: number,
  flowLPerMin: number,
): number {
  if (cInMgPerL <= 0 || flowLPerMin <= 0) return 0;
  return dhcG / (cInMgPerL * flowLPerMin * 60);
}

// ── 6A-05: Air Filter Restriction Calculator ─────────────────────────────────
// Source: SAE J1539:2010, ISO 5011:2019

/** SAE J1539 service limit: 625 Pa (2.5 in H₂O) */
export const AIR_SERVICE_LIMIT_PA = 625;

/**
 * Calculate remaining air filter service life as a percentage.
 * L_rem = (ΔP_limit − ΔP_current) / (ΔP_limit − ΔP_clean) × 100 %
 */
export function airFilterRemainingLife(
  dPCurrentPa: number,
  dPCleanPa: number,
): number {
  const usable = AIR_SERVICE_LIMIT_PA - dPCleanPa;
  if (usable <= 0) return 0;
  const used = dPCurrentPa - dPCleanPa;
  return Math.max(0, Math.min(100, (1 - used / usable) * 100));
}

// ── 6A-06: Fluid Cleanliness Evaluator ───────────────────────────────────────
// Source: ISO 4406:2021; ISO/TR 10949:2012 Table 1; NFPA T2.14.1-2005 §5

export type HydraulicSystemType =
  | 'servo-valve'
  | 'proportional-valve'
  | 'directional-valve'
  | 'vane-gear-pump'
  | 'cylinder';

// Target codes: ISO/TR 10949:2012 Table 1 and NFPA T2.14.1-2005 §5
const CLEANLINESS_TARGETS: Record<HydraulicSystemType, Iso4406Code> = {
  'servo-valve':         { n4: 16, n6: 14, n14: 11 },
  'proportional-valve':  { n4: 17, n6: 15, n14: 12 },
  'directional-valve':   { n4: 18, n6: 16, n14: 13 },
  'vane-gear-pump':      { n4: 19, n6: 17, n14: 14 },
  'cylinder':            { n4: 20, n6: 18, n14: 15 },
};

export function getCleanlinessTarget(systemType: HydraulicSystemType): Iso4406Code {
  return CLEANLINESS_TARGETS[systemType];
}

export interface CleanlinessEvaluation {
  compliant: boolean;
  delta: Iso4406Code;          // positive = exceeds target (non-compliant)
  reductionRatios: { n4: number; n6: number; n14: number };
}

/**
 * Evaluate current ISO 4406 code against target for the specified system type.
 * A positive delta means contamination exceeds the target by that many range steps.
 * Each step represents a 2× increase in particle count.
 */
export function evaluateCleanliness(
  current: Iso4406Code,
  systemType: HydraulicSystemType,
): CleanlinessEvaluation {
  const target = CLEANLINESS_TARGETS[systemType];
  const delta: Iso4406Code = {
    n4:  current.n4  - target.n4,
    n6:  current.n6  - target.n6,
    n14: current.n14 - target.n14,
  };
  return {
    compliant: delta.n4 <= 0 && delta.n6 <= 0 && delta.n14 <= 0,
    delta,
    reductionRatios: {
      n4:  delta.n4  > 0 ? Math.pow(2, delta.n4)  : 1,
      n6:  delta.n6  > 0 ? Math.pow(2, delta.n6)  : 1,
      n14: delta.n14 > 0 ? Math.pow(2, delta.n14) : 1,
    },
  };
}

// ── 6A-07: Service Interval Engineering Calculator ───────────────────────────
// Source: ISO 3724:2007 §6; SAE J1299:2008 Annex D

export type OperatingEnvironment = 'construction' | 'agriculture' | 'industrial';

// Contamination ingestion rates [mg/L] from SAE J1299:2008 Table 2
const INGESTION_RATES: Record<OperatingEnvironment, { min: number; typical: number; max: number }> = {
  'construction': { min: 1.0, typical: 2.0, max: 3.5 },
  'agriculture':  { min: 0.3, typical: 0.8, max: 1.5 },
  'industrial':   { min: 0.05, typical: 0.15, max: 0.3 },
};

// Safety factors from SAE J1299:2008 Annex D Table D-1
const SAFETY_FACTORS: Record<OperatingEnvironment, number> = {
  'construction': 0.65,
  'agriculture':  0.75,
  'industrial':   0.85,
};

export function getIngestionRate(env: OperatingEnvironment): { min: number; typical: number; max: number } {
  return INGESTION_RATES[env];
}

export function getDefaultSafetyFactor(env: OperatingEnvironment): number {
  return SAFETY_FACTORS[env];
}

/**
 * Calculate recommended service interval.
 * I_s = DHC × S_f / (C_in × Q × 60)  [hours]
 *
 * Source: ISO 3724:2007 §6
 */
export function serviceInterval(
  dhcG: number,
  cInMgPerL: number,
  flowLPerMin: number,
  safetyFactor: number,
): number {
  if (cInMgPerL <= 0 || flowLPerMin <= 0 || safetyFactor <= 0) return 0;
  return (dhcG * safetyFactor) / (cInMgPerL * flowLPerMin * 60);
}
