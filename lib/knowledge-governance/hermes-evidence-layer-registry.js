'use strict';

const EVIDENCE_LAYERS = Object.freeze({
  PRODUCT_CHANGE_INTELLIGENCE: 'PRODUCT_CHANGE_INTELLIGENCE',
  QUALITY_EVENT_EVIDENCE: 'QUALITY_EVENT_EVIDENCE',
  INSTALLATION_PROCEDURE_EVIDENCE: 'INSTALLATION_PROCEDURE_EVIDENCE',
  WARRANTY_ROOT_CAUSE_EVIDENCE: 'WARRANTY_ROOT_CAUSE_EVIDENCE',
  LD_APPLICATION_CROSS_EVIDENCE: 'LD_APPLICATION_CROSS_EVIDENCE'
});

const CROSS_STATUS = Object.freeze({
  OBSERVED: 'observed',
  CANDIDATE: 'candidate',
  VALIDATED: 'validated',
  REJECTED: 'rejected'
});

const APPLICATION_STATUS = Object.freeze({
  OBSERVED: 'observed',
  CANDIDATE: 'candidate',
  VALIDATED: 'validated',
  REJECTED: 'rejected'
});

const LAYERS = Object.freeze({
  [EVIDENCE_LAYERS.PRODUCT_CHANGE_INTELLIGENCE]: {
    purpose: 'Capture supersessions, design changes, application changes and fit/form/function notices as private evidence.',
    public_projection_allowed: false,
    canonical_auto_promotion_allowed: false
  },
  [EVIDENCE_LAYERS.QUALITY_EVENT_EVIDENCE]: {
    purpose: 'Capture recalls, holds, manufacturing escapes and quality events for internal Quality analysis.',
    public_projection_allowed: false,
    canonical_auto_promotion_allowed: false
  },
  [EVIDENCE_LAYERS.INSTALLATION_PROCEDURE_EVIDENCE]: {
    purpose: 'Capture installation and service procedures for later application-specific validation.',
    public_projection_allowed: false,
    canonical_auto_promotion_allowed: false
  },
  [EVIDENCE_LAYERS.WARRANTY_ROOT_CAUSE_EVIDENCE]: {
    purpose: 'Capture failure-path, evidence-preservation and root-cause information supporting warranty investigations.',
    public_projection_allowed: false,
    canonical_auto_promotion_allowed: false
  },
  [EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE]: {
    purpose: 'Capture light-duty product-page applications and cross references as private evidence for catalog enrichment.',
    knowledge_domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
    industry: 'Automotive',
    public_projection_allowed: false,
    canonical_auto_promotion_allowed: false,
    catalog_auto_update_allowed: false,
    confirmed_cross_auto_write_allowed: false,
    confirmed_application_auto_write_allowed: false
  }
});

function normalizeLdApplicationEvidence(input = {}) {
  return {
    evidence_layer: EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE,
    knowledge_domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN',
    industry: 'Automotive',
    source_url: input.source_url || null,
    source_snapshot_sha256: input.source_snapshot_sha256 || null,
    source_retrieved_at: input.source_retrieved_at || null,
    source_market_scope: input.source_market_scope || null,
    source_product_number: input.source_product_number || null,
    source_product_family: input.source_product_family || null,
    application: {
      year_start: input.application?.year_start ?? null,
      year_end: input.application?.year_end ?? null,
      make: input.application?.make || null,
      model: input.application?.model || null,
      engine: input.application?.engine || null,
      trim: input.application?.trim || null,
      configuration: input.application?.configuration || null,
      housing: input.application?.housing || null,
      notes: input.application?.notes || null
    },
    application_status: input.application_status || APPLICATION_STATUS.OBSERVED,
    cross_reference: {
      manufacturer: input.cross_reference?.manufacturer || null,
      part_number: input.cross_reference?.part_number || null,
      relation_type: input.cross_reference?.relation_type || null
    },
    cross_status: input.cross_status || CROSS_STATUS.OBSERVED,
    independent_validation_sources: Array.isArray(input.independent_validation_sources)
      ? input.independent_validation_sources.filter(Boolean)
      : [],
    catalog_write_eligible: false,
    confirmed_cross_write_eligible: false,
    confirmed_application_write_eligible: false,
    public_exposure_allowed: false
  };
}

function validateLdApplicationEvidence(record = {}) {
  const errors = [];
  if (record.evidence_layer !== EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE) errors.push('invalid evidence_layer');
  if (record.knowledge_domain !== 'LIGHT_DUTY_KNOWLEDGE_DOMAIN') errors.push('LD product-page evidence must remain in LIGHT_DUTY_KNOWLEDGE_DOMAIN');
  if (record.industry !== 'Automotive') errors.push('LD product-page evidence must remain in Automotive');
  if (!record.source_url) errors.push('source_url is required');
  if (!record.source_snapshot_sha256) errors.push('source_snapshot_sha256 is required');
  if (record.public_exposure_allowed !== false) errors.push('public_exposure_allowed must be false');
  if (record.catalog_write_eligible !== false) errors.push('catalog_write_eligible must remain false at evidence stage');
  if (record.confirmed_cross_write_eligible !== false) errors.push('confirmed_cross_write_eligible must remain false at evidence stage');
  if (record.confirmed_application_write_eligible !== false) errors.push('confirmed_application_write_eligible must remain false at evidence stage');

  if (!Object.values(APPLICATION_STATUS).includes(record.application_status)) errors.push('invalid application_status');
  if (!Object.values(CROSS_STATUS).includes(record.cross_status)) errors.push('invalid cross_status');

  if (record.application_status === APPLICATION_STATUS.VALIDATED && record.independent_validation_sources.length < 1) {
    errors.push('validated application requires at least one independent validation source');
  }
  if (record.cross_status === CROSS_STATUS.VALIDATED && record.independent_validation_sources.length < 1) {
    errors.push('validated cross requires at least one independent validation source');
  }

  return { valid: errors.length === 0, errors };
}

function canWriteConfirmedCross(record = {}) {
  return false;
}

function canWriteConfirmedApplication(record = {}) {
  return false;
}

module.exports = {
  EVIDENCE_LAYERS,
  CROSS_STATUS,
  APPLICATION_STATUS,
  LAYERS,
  normalizeLdApplicationEvidence,
  validateLdApplicationEvidence,
  canWriteConfirmedCross,
  canWriteConfirmedApplication
};
