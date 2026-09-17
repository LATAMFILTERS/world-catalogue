'use strict';

const AGENCY_CONTRACT_VERSION = '2026-09-01';

const DOMAIN_OWNERS = Object.freeze({
  commercial_account: 'crm',
  contact: 'crm',
  opportunity: 'crm',
  rfq: 'crm',
  commercial_outreach: 'crm',
  finance_risk: 'crm',
  supplier_commercial_state: 'crm',
  product: 'world-catalogue',
  sku: 'world-catalogue',
  cross_reference: 'world-catalogue',
  application: 'world-catalogue',
  technical_fact: 'world-catalogue',
  oem_interval: 'world-catalogue',
  technical_recommendation: 'world-catalogue',
  canonical_knowledge: 'world-catalogue'
});

const CROSS_REPO_REQUESTS = Object.freeze({
  TECHNICAL_SKU_LOOKUP: { caller: 'crm', owner: 'world-catalogue', mode: 'READ' },
  TECHNICAL_COMPATIBILITY_LOOKUP: { caller: 'crm', owner: 'world-catalogue', mode: 'READ' },
  TECHNICAL_DIAGNOSTIC: { caller: 'crm', owner: 'world-catalogue', mode: 'READ' },
  TECHNICAL_RECOMMENDATION: { caller: 'crm', owner: 'world-catalogue', mode: 'READ' },
  HERMES_RESEARCH_REQUEST: { caller: 'crm', owner: 'world-catalogue', mode: 'PROPOSE' },
  KNOWLEDGE_CANDIDATE_REQUEST: { caller: 'crm', owner: 'world-catalogue', mode: 'PROPOSE' },
  COMMERCIAL_CONTEXT_LOOKUP: { caller: 'world-catalogue', owner: 'crm', mode: 'READ' },
  COMMERCIAL_INTELLIGENCE_EVENT: { caller: 'world-catalogue', owner: 'crm', mode: 'PROPOSE' }
});

function ownerForDomain(domain) {
  return DOMAIN_OWNERS[String(domain || '').trim()] || null;
}

function assertOwnedWrite({ actorRepo, domain } = {}) {
  const owner = ownerForDomain(domain);
  if (!owner) throw new Error(`UNKNOWN_AUTHORITY_DOMAIN:${domain || ''}`);
  if (actorRepo !== owner) {
    const error = new Error(`CROSS_DOMAIN_WRITE_DENIED:${actorRepo || 'unknown'}:${domain}:${owner}`);
    error.code = 'CROSS_DOMAIN_WRITE_DENIED';
    throw error;
  }
  return true;
}

function validateCrossRepoRequest(request = {}) {
  const definition = CROSS_REPO_REQUESTS[request.type];
  if (!definition) return { valid: false, reason: 'UNKNOWN_REQUEST_TYPE' };
  if (request.caller !== definition.caller) return { valid: false, reason: 'CALLER_NOT_AUTHORIZED' };
  if (request.owner !== definition.owner) return { valid: false, reason: 'OWNER_MISMATCH' };
  if (!request.requestId || !request.correlationId) return { valid: false, reason: 'TRACE_ID_REQUIRED' };
  if (request.writeTarget) return { valid: false, reason: 'DIRECT_CROSS_REPO_WRITE_FORBIDDEN' };
  return { valid: true, definition };
}

module.exports = {
  AGENCY_CONTRACT_VERSION,
  DOMAIN_OWNERS,
  CROSS_REPO_REQUESTS,
  ownerForDomain,
  assertOwnedWrite,
  validateCrossRepoRequest
};
