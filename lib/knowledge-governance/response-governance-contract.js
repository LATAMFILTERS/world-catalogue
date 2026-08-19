'use strict';

const { isApprovedTechnicalEvidence } = require('./technical-evidence-contract');
const { isPublishableOemInterval } = require('./oem-maintenance-contract');
const { isValidatedSku } = require('./sku-authority-contract');

// SKUs on ELIMFILTERS's own catalog always look like a 2-letter brand
// prefix followed by 4-7 digits (EA1xxxx, EL8xxxx, EF9xxxx, EL3xxxx, ...).
// This is used only as a defensive text scan over free-form model output —
// it never decides authorization on its own.
const SKU_SHAPE_PATTERN = /\bE[A-Z]\d{4,7}\b/g;

// A conservative heuristic for "this sentence asserts a maintenance
// interval" — a number followed by one of the OEM interval units. Duration
// phrases like "cuatro días" never match (days is not a valid interval
// unit per the OEM maintenance contract), so customer-reported symptom
// duration is never mistaken for an interval claim.
const OEM_INTERVAL_SHAPE_PATTERN = /\b\d{1,3}([.,]\d{3})*\s*(?:horas?|millas?|kil[oó]metros?|km|meses?)\b/gi;

function buildResponseGovernance({
  technicalEvidence = null,
  oemMaintenance = null,
  knowledgeGap = null,
  hermesRequestId = null,
  skuAuthority = null,
  productCategoryRecommended = null
} = {}) {
  const technical_source_validated = Boolean(technicalEvidence && isApprovedTechnicalEvidence(technicalEvidence));
  const oem_maintenance_found = Boolean(oemMaintenance && isPublishableOemInterval(oemMaintenance));
  const sku_validated_in_postgresql = Boolean(skuAuthority && isValidatedSku(skuAuthority));

  const authority_violations = [
    ...assertNoUnauthorizedOemClaim({ oem_maintenance: oemMaintenance, oem_maintenance_found }),
    ...assertNoUnauthorizedSku({ sku_evidence: skuAuthority, sku_validated_in_postgresql })
  ];

  return {
    technical_source_validated,
    technical_source: technicalEvidence,
    oem_maintenance_found,
    oem_maintenance: oemMaintenance,
    knowledge_gap_registered: Boolean(knowledgeGap),
    knowledge_gap: knowledgeGap,
    hermes_request_created: Boolean(hermesRequestId),
    hermes_request_id: hermesRequestId,
    product_category_recommended: productCategoryRecommended,
    sku_validated_in_postgresql,
    sku_evidence: skuAuthority,
    validated_skus: sku_validated_in_postgresql ? (skuAuthority.validated_skus || []) : [],
    authority_violations,
    safe_to_publish: authority_violations.length === 0
  };
}

function validateResponseGovernance(governance = {}) {
  const errors = [];
  if (governance.oem_maintenance_found && !governance.technical_source_validated) {
    errors.push('oem_maintenance_found is true without technical_source_validated');
  }
  if (governance.sku_validated_in_postgresql && (!governance.sku_evidence || !isValidatedSku(governance.sku_evidence))) {
    errors.push('sku_validated_in_postgresql is true without valid PostgreSQL sku_evidence');
  }
  if (governance.validated_skus?.length && !governance.sku_validated_in_postgresql) {
    errors.push('validated_skus is populated without sku_validated_in_postgresql');
  }
  return { valid: errors.length === 0, errors };
}

function assertNoUnauthorizedOemClaim(governance = {}) {
  if (governance.oem_maintenance && !governance.oem_maintenance_found) {
    return [{ rule: 'rule_8_oem_claim_requires_approved_evidence', reason: 'oem_maintenance present without approved Obsidian evidence' }];
  }
  return [];
}

function assertNoUnauthorizedSku(governance = {}) {
  if (governance.sku_evidence && !governance.sku_validated_in_postgresql && (governance.sku_evidence.validated_skus || []).length) {
    return [{ rule: 'rule_9_sku_requires_postgresql_evidence', reason: 'validated_skus present without PostgreSQL validation' }];
  }
  return [];
}

// Publication rules A-E: a response is safe to publish by default —
// preliminary diagnostic explanations, category-only recommendations, and
// "we don't have this confirmed yet" answers are all legitimate. It is
// only unsafe when an authority violation is present.
function determineSafeToPublish(governance = {}) {
  return (governance.authority_violations || []).length === 0;
}

// Defense-in-depth text scan over the free-form answer (e.g. after a Groq
// rewrite): strips any SKU-shaped token not present in
// governance.validated_skus, and any OEM-interval-shaped phrase when no
// approved OEM maintenance evidence exists. Returns the (possibly redacted)
// text plus any violations found, so callers can log/flag them.
function redactUnauthorizedClaims(answerText, governance = {}) {
  let text = String(answerText || '');
  const violations = [];
  const validatedSkuSet = new Set((governance.validated_skus || []).map(s => String(s.sku || s).toUpperCase()));

  text = text.replace(SKU_SHAPE_PATTERN, match => {
    if (validatedSkuSet.has(match.toUpperCase())) return match;
    violations.push({ rule: 'rule_9_sku_requires_postgresql_evidence', reason: `unauthorized SKU-shaped token in answer: ${match}` });
    return '[referencia no confirmada]';
  });

  if (!governance.oem_maintenance_found) {
    text = text.replace(OEM_INTERVAL_SHAPE_PATTERN, match => {
      violations.push({ rule: 'rule_8_oem_claim_requires_approved_evidence', reason: `unauthorized OEM-interval-shaped phrase in answer: ${match}` });
      return '[intervalo no confirmado]';
    });
  }

  return { text, violations };
}

module.exports = {
  buildResponseGovernance,
  validateResponseGovernance,
  determineSafeToPublish,
  redactUnauthorizedClaims,
  assertNoUnauthorizedSku,
  assertNoUnauthorizedOemClaim
};
