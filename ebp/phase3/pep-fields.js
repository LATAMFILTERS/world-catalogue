'use strict';

// EBP Phase 3 — read-only registry mapping Phase 1's known Product
// Engineering Passport engineering fields to a human label/unit/tolerance
// for the Offer form (ADR-0032, correction round 2026-07-13). Purely
// presentational — never a data-model change to Phase 1 (frozen). Every
// `field_name` here matches exactly what Phase 1's own
// `field_applicability` map and Phase 3's own
// `ebp_manufacturer_offer_technical_fields.field_name` already use, so
// the Portal form and the Excel pipeline can never diverge on what a
// "field" is.
//
// `applicable(engineering, fieldApplicability)` decides whether this field
// is one ELIMFILTERS actually requires for a given Passport snapshot:
// - "applicability-gated" fields (the two valve fields) are applicable
//   only when Phase 1's own field_applicability map says REQUIRED for
//   them — Phase 1 is the single source of truth for that gate.
// - Every other field is applicable when the Passport snapshot actually
//   carries a value for it (ELIMFILTERS specified a requirement at
//   Passport-authoring time, independent of the applicability matrix,
//   which only ever covered the two valve fields plus beta_ratio/
//   micron_rating in Phase 1's seed data — see migrations/ebp-phase1/
//   002_seed_applicability_matrix.sql).

const FIELD_REGISTRY = [
  {
    field_name: 'required_media',
    label: 'Filter Media',
    unit: null,
    requiredValue: (eng) => eng.required_media,
    tolerance: null,
    applicable: (eng) => !!eng.required_media,
  },
  {
    field_name: 'required_media_composition',
    label: 'Media Composition',
    unit: null,
    requiredValue: (eng) => eng.required_media_composition,
    tolerance: null,
    applicable: (eng) => !!eng.required_media_composition,
  },
  {
    field_name: 'minimum_efficiency',
    label: 'Minimum Efficiency',
    unit: '%',
    requiredValue: (eng) => eng.minimum_efficiency,
    tolerance: (eng) => eng.efficiency_particle_size_basis,
    applicable: (eng) => eng.minimum_efficiency !== null && eng.minimum_efficiency !== undefined,
  },
  {
    field_name: 'beta_ratio',
    label: 'Beta Ratio',
    unit: null,
    requiredValue: (eng) => eng.beta_ratio,
    tolerance: null,
    applicable: (eng, appl) => appl.beta_ratio === 'REQUIRED',
  },
  {
    field_name: 'micron_rating',
    label: 'Micron Rating',
    unit: 'µm',
    requiredValue: (eng) => eng.micron_rating,
    tolerance: null,
    applicable: (eng, appl) => appl.micron_rating === 'REQUIRED',
  },
  {
    field_name: 'required_adhesive',
    label: 'Adhesive',
    unit: null,
    requiredValue: (eng) => eng.required_adhesive,
    tolerance: null,
    applicable: (eng) => !!eng.required_adhesive,
  },
  {
    field_name: 'operating_temp_min_c',
    label: 'Minimum Operating Temperature',
    unit: '°C',
    requiredValue: (eng) => eng.operating_temp_min_c,
    tolerance: null,
    applicable: (eng) => eng.operating_temp_min_c !== null && eng.operating_temp_min_c !== undefined,
  },
  {
    field_name: 'operating_temp_max_c',
    label: 'Maximum Operating Temperature',
    unit: '°C',
    requiredValue: (eng) => eng.operating_temp_max_c,
    tolerance: null,
    applicable: (eng) => eng.operating_temp_max_c !== null && eng.operating_temp_max_c !== undefined,
  },
  {
    field_name: 'collapse_pressure_kpa',
    label: 'Collapse Pressure',
    unit: 'kPa',
    requiredValue: (eng) => eng.collapse_pressure_kpa,
    tolerance: null,
    applicable: (eng) => eng.collapse_pressure_kpa !== null && eng.collapse_pressure_kpa !== undefined,
  },
  {
    field_name: 'burst_pressure_kpa',
    label: 'Burst Pressure',
    unit: 'kPa',
    requiredValue: (eng) => eng.burst_pressure_kpa,
    tolerance: null,
    applicable: (eng) => eng.burst_pressure_kpa !== null && eng.burst_pressure_kpa !== undefined,
  },
  {
    field_name: 'gasket_material',
    label: 'Gasket Material',
    unit: null,
    requiredValue: (eng) => eng.gasket_material,
    tolerance: null,
    applicable: (eng) => !!eng.gasket_material,
  },
  {
    field_name: 'thread_spec',
    label: 'Thread Specification',
    unit: null,
    requiredValue: (eng) => eng.thread_spec,
    tolerance: null,
    applicable: (eng) => !!eng.thread_spec,
  },
  {
    field_name: 'center_tube_spec',
    label: 'Center Tube Specification',
    unit: null,
    requiredValue: (eng) => eng.center_tube_spec,
    tolerance: null,
    applicable: (eng) => !!eng.center_tube_spec,
  },
  {
    field_name: 'end_caps_spec',
    label: 'End Caps Specification',
    unit: null,
    requiredValue: (eng) => eng.end_caps_spec,
    tolerance: null,
    applicable: (eng) => !!eng.end_caps_spec,
  },
  {
    field_name: 'bypass_valve_applicability',
    label: 'Bypass Valve',
    unit: 'kPa',
    requiredValue: (eng) => eng.bypass_opening_pressure_kpa,
    tolerance: (eng) => eng.bypass_pressure_tolerance_pct,
    applicable: (eng, appl) => appl.bypass_valve_applicability === 'REQUIRED',
  },
  {
    field_name: 'antidrainback_valve_applicability',
    label: 'Anti-Drainback Valve',
    unit: null,
    requiredValue: (eng) => eng.antidrainback_valve_material,
    tolerance: null,
    applicable: (eng, appl) => appl.antidrainback_valve_applicability === 'REQUIRED',
  },
];

// Returns the exact set of applicable fields for a given (frozen,
// immutable) Batch Item snapshot — the same snapshot the Portal form, the
// Excel export, and the Offer-completeness check at submit time all read,
// so none of the three can ever disagree about what "applicable" means.
function getApplicableFields(passportSnapshot) {
  const engineering = (passportSnapshot && passportSnapshot.engineering) || {};
  const applicability = engineering.field_applicability || {};
  const instructions = engineering.manufacturer_instruction_notes || null;
  return FIELD_REGISTRY.filter((f) => f.applicable(engineering, applicability)).map((f) => ({
    field_name: f.field_name,
    label: f.label,
    unit: f.unit || null,
    required_value: f.requiredValue(engineering) ?? null,
    required_tolerance: f.tolerance ? f.tolerance(engineering) ?? null : null,
    applicability: 'REQUIRED',
    instructions,
  }));
}

module.exports = { FIELD_REGISTRY, getApplicableFields };
