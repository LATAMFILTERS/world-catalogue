'use strict';

const { isApprovedOemMaintenanceEvidence } = require('./technical-evidence-contract');

const VALID_STATUS = Object.freeze([
  'validated',
  'not_found',
  'insufficient_equipment_data',
  'conflicting_sources',
  'pending_research'
]);

const VALID_UNITS = Object.freeze(['hours', 'miles', 'kilometers', 'months']);

function normalizeEquipment(value = {}) {
  return {
    brand: value.brand || null,
    model: value.model || null,
    engine: value.engine || null,
    year: value.year || null
  };
}

// Builds a normalized OEM maintenance record. Never invents an interval:
// callers must supply one explicitly, and it is only trusted for
// publication once `isApprovedOemMaintenanceEvidence` passes on the
// attached technical_evidence.
function createOemMaintenanceRecord(overrides = {}) {
  return {
    status: VALID_STATUS.includes(overrides.status) ? overrides.status : 'pending_research',
    equipment: normalizeEquipment(overrides.equipment),
    system: overrides.system || null,
    component: overrides.component || null,
    interval: {
      value: Number.isFinite(overrides.interval?.value) ? overrides.interval.value : null,
      unit: VALID_UNITS.includes(overrides.interval?.unit) ? overrides.interval.unit : null,
      maximum_time_months: Number.isFinite(overrides.interval?.maximum_time_months) ? overrides.interval.maximum_time_months : null
    },
    normal_service: overrides.normal_service || null,
    severe_service: overrides.severe_service || null,
    inspection_guidance: Array.isArray(overrides.inspection_guidance) ? overrides.inspection_guidance : [],
    installation_guidance: Array.isArray(overrides.installation_guidance) ? overrides.installation_guidance : [],
    prohibited_practices: Array.isArray(overrides.prohibited_practices) ? overrides.prohibited_practices : [],
    post_failure_actions: Array.isArray(overrides.post_failure_actions) ? overrides.post_failure_actions : [],
    technical_evidence: overrides.technical_evidence || null
  };
}

function validateOemMaintenanceRecord(record = {}) {
  const errors = [];
  if (!VALID_STATUS.includes(record.status)) errors.push(`status must be one of: ${VALID_STATUS.join(', ')}`);
  if (record.interval?.value != null && !record.interval?.unit) errors.push('an interval value requires a unit');
  if (record.interval?.unit && !VALID_UNITS.includes(record.interval.unit)) errors.push(`interval.unit must be one of: ${VALID_UNITS.join(', ')}`);
  if (record.status === 'validated' && (record.interval?.value == null || !record.interval?.unit)) {
    errors.push('a "validated" record requires a fully specified interval (value + unit)');
  }
  return { valid: errors.length === 0, errors };
}

// A "validated" OEM maintenance record is only publishable once its
// evidence clears the Obsidian-authorship gate for the equipment in
// question — this is the enforcement point that stops a generic/inferred
// interval from being presented as an OEM-specified one.
function isPublishableOemInterval(record = {}) {
  if (record.status !== 'validated') return false;
  if (!validateOemMaintenanceRecord(record).valid) return false;
  return isApprovedOemMaintenanceEvidence(record.technical_evidence || {}, record.equipment);
}

function canRecommendFilterAfterRepair(record = {}) {
  const hasPostFailureJustification = Array.isArray(record.post_failure_actions) && record.post_failure_actions.length > 0;
  return hasPostFailureJustification && isApprovedOemMaintenanceEvidence(record.technical_evidence || {}, record.equipment);
}

// General controlled practices — never an OEM interval, always tagged
// distinctly so they can never be confused for (or presented as) one.
function buildGeneralApprovedPractice({ id, statement, appliesTo = [] }) {
  return {
    type: 'general_approved_practice',
    id,
    statement,
    appliesTo,
    internally_approved: true
  };
}

function isGeneralPracticeApproved(practice = {}) {
  return practice.type === 'general_approved_practice' && practice.internally_approved === true;
}

const APPROVED_GENERAL_PRACTICES = Object.freeze([
  buildGeneralApprovedPractice({
    id: 'no_solvent_cleaning_fluid_filters',
    statement: 'No limpiar filtros de líquidos (aceite, combustible, hidráulico) con gasoil ni solventes: degrada el medio filtrante y no restaura la capacidad de retención original.',
    appliesTo: ['oil', 'fuel', 'hydraulic']
  }),
  buildGeneralApprovedPractice({
    id: 'no_reuse_spin_on_filters',
    statement: 'No reutilizar filtros spin-on: son elementos de un solo uso; reinstalarlos no garantiza sellado ni capacidad de filtrado.',
    appliesTo: ['oil', 'fuel', 'hydraulic']
  }),
  buildGeneralApprovedPractice({
    id: 'no_impact_air_elements',
    statement: 'No golpear elementos de aire contra superficies duras para limpiarlos: daña el medio filtrante y crea vías de fuga no filtradas.',
    appliesTo: ['air']
  }),
  buildGeneralApprovedPractice({
    id: 'no_compressed_air_without_oem_authorization',
    statement: 'No soplar filtros de aire con aire comprimido salvo autorización OEM expresa y presión/distancia especificadas.',
    appliesTo: ['air']
  }),
  buildGeneralApprovedPractice({
    id: 'lubricate_gaskets_with_appropriate_fluid',
    statement: 'Lubricar las juntas del filtro con el fluido de servicio apropiado (no con grasa ni un fluido distinto) antes de instalar, cuando el diseño del filtro lo requiera.',
    appliesTo: ['oil', 'fuel', 'hydraulic']
  }),
  buildGeneralApprovedPractice({
    id: 'check_restriction_indicators',
    statement: 'Revisar los indicadores de restricción (vacuómetro de admisión, manómetro diferencial) como referencia objetiva de condición del filtro, en lugar de basarse solo en tiempo transcurrido.',
    appliesTo: ['air', 'oil', 'fuel', 'hydraulic']
  }),
  buildGeneralApprovedPractice({
    id: 'change_after_severe_contamination',
    statement: 'Cambiar fluido y filtro asociado después de una contaminación grave confirmada (agua, partículas, mezcla de fluidos), siguiendo el procedimiento validado para el sistema afectado.',
    appliesTo: ['oil', 'fuel', 'hydraulic', 'coolant']
  })
]);

module.exports = {
  VALID_STATUS,
  VALID_UNITS,
  createOemMaintenanceRecord,
  validateOemMaintenanceRecord,
  isPublishableOemInterval,
  canRecommendFilterAfterRepair,
  buildGeneralApprovedPractice,
  isGeneralPracticeApproved,
  APPROVED_GENERAL_PRACTICES
};
