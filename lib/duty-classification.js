'use strict';
/**
 * Fase 7 — canonical LD/HD/MIXED duty classification module.
 *
 * Design-only / not wired into any live endpoint by this change. The
 * existing scattered per-SKU migrations (run_058, etc.) remain untouched;
 * this module is the proposed single source of truth going forward, to
 * be adopted incrementally, not a retroactive mass-reclassification.
 *
 * Core principle: brand alone is evidence, not a verdict. Equipment type
 * and operational function outrank fuel type. Evidence hierarchy (highest
 * to lowest):
 *   1. Equipment type (forklift, construction, industrial engine, ...)
 *   2. Operational class/use
 *   3. Concrete application/model
 *   4. Vehicle weight class, when available
 *   5. Engine family / operating environment
 *   6. Manufacturer, as a prior only
 *   7. Fuel type (gas/diesel), weakest signal, never decisive alone
 */

const ReasonCode = Object.freeze({
  LD_PASSENGER_VEHICLE: 'LD_PASSENGER_VEHICLE',
  LD_PICKUP: 'LD_PICKUP',
  HD_COMMERCIAL_TRUCK: 'HD_COMMERCIAL_TRUCK',
  HD_CONSTRUCTION_EQUIPMENT: 'HD_CONSTRUCTION_EQUIPMENT',
  HD_INDUSTRIAL_ENGINE: 'HD_INDUSTRIAL_ENGINE',
  HD_FORKLIFT: 'HD_FORKLIFT',
  MIXED_CONFIRMED_APPLICATIONS: 'MIXED_CONFIRMED_APPLICATIONS',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
});

// Equipment-type signal takes priority over brand. Brand-only inference is
// the LAST resort (prior), never the first check, per the evidence
// hierarchy above -- this is why forklift/construction/industrial checks
// run BEFORE any brand-based default.
const CONSTRUCTION_MINING_KEYWORDS = ['excavator', 'loader', 'dozer', 'grader', 'construction', 'mining', 'wheel loader'];
const INDUSTRIAL_ENGINE_KEYWORDS = ['generator', 'genset', 'stationary engine', 'marine commercial', 'industrial engine', 'power generation'];
const FORKLIFT_KEYWORDS = ['forklift', 'lift truck', 'reach truck'];
const COMMERCIAL_TRUCK_KEYWORDS = ['tractor truck', 'semi truck', 'commercial truck', 'bus', 'vocational', 'class 8', 'heavy truck'];
const LD_BODY_KEYWORDS = ['suv', 'crossover', 'sedan', 'coupe', 'hatchback', 'minivan', 'light van', 'passenger'];
const PICKUP_KEYWORDS = ['pickup', 'pick-up', 'pick up truck'];

// Manufacturers whose entire lineup is unambiguous industrial/construction
// equipment -- used only as a LOW-priority prior when no equipment-type
// or application text is available at all (REVIEW_REQUIRED is preferred
// over guessing when evidence is genuinely absent).
const HD_ONLY_MANUFACTURERS = new Set(['CATERPILLAR', 'KOMATSU']);

function norm(s) {
  return (s || '').toString().toLowerCase();
}

function includesAny(haystack, needles) {
  return needles.some((n) => haystack.includes(n));
}

/**
 * @param {{ manufacturer?: string, equipmentType?: string, model?: string,
 *           application?: string, fuelType?: string, weightClassLbs?: number,
 *           confirmedLdApplications?: boolean, confirmedHdApplications?: boolean }} evidence
 * @returns {{ duty: 'LIGHT_DUTY'|'HEAVY_DUTY'|'MIXED_DUTY'|'REVIEW_REQUIRED',
 *             reason_code: string, confidence: 'high'|'medium'|'low', evidence_used: string[] }}
 */
function classifyDuty(evidence = {}) {
  const text = norm([evidence.equipmentType, evidence.model, evidence.application].filter(Boolean).join(' '));
  const manufacturer = norm(evidence.manufacturer).toUpperCase ? (evidence.manufacturer || '').toUpperCase() : '';

  // Rule: MIXED_DUTY requires CONFIRMED real applications on both sides for
  // the SAME SKU -- never inferred from an ambiguous brand.
  if (evidence.confirmedLdApplications && evidence.confirmedHdApplications) {
    return { duty: 'MIXED_DUTY', reason_code: ReasonCode.MIXED_CONFIRMED_APPLICATIONS, confidence: 'high', evidence_used: ['confirmedLdApplications', 'confirmedHdApplications'] };
  }

  // 1. Equipment type outranks everything below, including brand.
  if (includesAny(text, FORKLIFT_KEYWORDS)) {
    return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_FORKLIFT, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }
  if (includesAny(text, CONSTRUCTION_MINING_KEYWORDS)) {
    return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_CONSTRUCTION_EQUIPMENT, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }
  if (includesAny(text, INDUSTRIAL_ENGINE_KEYWORDS)) {
    return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_INDUSTRIAL_ENGINE, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }
  if (includesAny(text, COMMERCIAL_TRUCK_KEYWORDS)) {
    return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_COMMERCIAL_TRUCK, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }

  // 2-3. Body/application class -- pickup and passenger bodies are LD
  // REGARDLESS of manufacturer (Toyota/Nissan forklifts already handled
  // above by equipment type, not reached here).
  if (includesAny(text, PICKUP_KEYWORDS)) {
    return { duty: 'LIGHT_DUTY', reason_code: ReasonCode.LD_PICKUP, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }
  if (includesAny(text, LD_BODY_KEYWORDS)) {
    return { duty: 'LIGHT_DUTY', reason_code: ReasonCode.LD_PASSENGER_VEHICLE, confidence: 'high', evidence_used: ['equipmentType/model text'] };
  }

  // 4. Weight class, when available, before falling back to brand.
  if (typeof evidence.weightClassLbs === 'number') {
    if (evidence.weightClassLbs >= 26001) {
      return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_COMMERCIAL_TRUCK, confidence: 'medium', evidence_used: ['weightClassLbs'] };
    }
    if (evidence.weightClassLbs > 0) {
      return { duty: 'LIGHT_DUTY', reason_code: ReasonCode.LD_PASSENGER_VEHICLE, confidence: 'medium', evidence_used: ['weightClassLbs'] };
    }
  }

  // 6. Manufacturer as a LOW-confidence prior -- only for brands whose
  // entire catalog is unambiguously one duty class, and only when no
  // stronger evidence above matched at all.
  if (HD_ONLY_MANUFACTURERS.has(manufacturer)) {
    return { duty: 'HEAVY_DUTY', reason_code: ReasonCode.HD_CONSTRUCTION_EQUIPMENT, confidence: 'low', evidence_used: ['manufacturer prior'] };
  }

  // No sufficient evidence anywhere in the hierarchy -- never invent a
  // classification. Fuel type (7) is deliberately never checked as a
  // decisive rule; it's noted in evidence_used only if present, as
  // context for the human reviewer, never as the deciding factor.
  return {
    duty: 'REVIEW_REQUIRED',
    reason_code: ReasonCode.REVIEW_REQUIRED,
    confidence: 'low',
    evidence_used: evidence.fuelType ? [`fuelType=${evidence.fuelType} (insufficient alone)`] : [],
  };
}

module.exports = { classifyDuty, ReasonCode };
