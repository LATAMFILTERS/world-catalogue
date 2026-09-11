'use strict';

const { isApprovedTechnicalEvidence } = require('./technical-evidence-contract');
const { isPublishableOemInterval } = require('./oem-maintenance-contract');
const { isValidatedSku } = require('./sku-authority-contract');
const { redactExternalKnowledgeSignatures } = require('./universal-public-knowledge-gateway');

const SKU_SHAPE_PATTERN = /\bE[A-Z]\d{4,7}\b/g;
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

function determineSafeToPublish(governance = {}) {
  return (governance.authority_violations || []).length === 0;
}

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

  const sourceNeutral = redactExternalKnowledgeSignatures(text);
  text = sourceNeutral.text;
  violations.push(...sourceNeutral.violations);

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
