'use strict';

// The single source of truth for who is allowed to decide what. Every other
// governance contract in this directory defers to this file for the actual
// authority rules — it declares boundaries, it does not perform I/O.
//
// HERMES investiga.
// Obsidian publica.
// PostgreSQL autoriza el SKU.
// Groq interpreta y redacta.
// El orquestador hace cumplir las fronteras.

const AUTHORITY_POLICY = Object.freeze({
  technicalFacts: 'obsidian',
  oemMaintenance: 'obsidian',
  technicalProcedures: 'obsidian',
  standards: 'obsidian',
  knowledgeResearch: 'hermes',
  knowledgePublication: 'obsidian',
  productSku: 'postgresql',
  languageInterpretation: 'groq',
  finalDecision: 'orchestrator'
});

const ACTORS = Object.freeze(['groq', 'hermes', 'obsidian', 'postgresql', 'orchestrator']);

const ACTIONS = Object.freeze([
  'interpret_language',
  'draft_language',
  'research',
  'authorize_technical_fact',
  'authorize_oem_interval',
  'publish_knowledge',
  'authorize_sku',
  'publish_to_user',
  'enforce_boundaries'
]);

// What each actor is permitted to do. Anything not listed here is denied by
// default — this is an allow-list, not a deny-list, on purpose.
const ALLOWED_ACTIONS_BY_ACTOR = Object.freeze({
  groq: Object.freeze(['interpret_language', 'draft_language']),
  hermes: Object.freeze(['research']),
  obsidian: Object.freeze(['authorize_technical_fact', 'authorize_oem_interval', 'publish_knowledge']),
  postgresql: Object.freeze(['authorize_sku']),
  orchestrator: Object.freeze(['publish_to_user', 'enforce_boundaries'])
});

function isKnownActor(actor) {
  return ACTORS.includes(actor);
}

function isKnownAction(action) {
  return ACTIONS.includes(action);
}

// Rule 1-7: pure actor/action boundary check. Returns false for unknown
// actors/actions rather than throwing — callers decide how to report that.
function validateAuthorityBoundary({ actor, action } = {}) {
  if (!isKnownActor(actor) || !isKnownAction(action)) return false;
  return ALLOWED_ACTIONS_BY_ACTOR[actor].includes(action);
}

// Rule 8 + 10: an OEM/technical-fact claim may only be published when the
// evidence was authorized by Obsidian (never a raw inference, never Groq,
// never HERMES, never PostgreSQL).
function canPublishTechnicalFact({ technical_source_validated, source_authority, approved_for_bot_use, is_inference } = {}) {
  if (is_inference) return false; // Rule 10: an inference can never become a technical fact.
  return technical_source_validated === true && source_authority === 'obsidian' && approved_for_bot_use === true;
}

function canPublishOemRecommendation(input = {}) {
  // An OEM recommendation is a technical fact with the additional constraint
  // that PostgreSQL must never be its source (Rule 6).
  if (input.source_authority === 'postgresql') return false;
  return canPublishTechnicalFact(input);
}

// Rule 5 + 9: a SKU may only be published when PostgreSQL itself validated it.
function canPublishSku({ sku_validated_in_postgresql, source_authority, lookup_status, evidence_count } = {}) {
  if (source_authority === 'obsidian' || source_authority === 'hermes' || source_authority === 'groq') return false;
  return sku_validated_in_postgresql === true &&
    source_authority === 'postgresql' &&
    lookup_status === 'validated' &&
    Number(evidence_count) > 0;
}

// Aggregates every rule violation found in a single claim/context object.
// `input` is intentionally loose — this is meant to be called with whatever
// slice of response_governance is relevant (a technical claim, a SKU claim,
// or both at once).
function buildAuthorityViolations(input = {}) {
  const violations = [];
  const push = (rule, reason) => violations.push({ rule, reason });

  if (input.actor && input.action && !validateAuthorityBoundary({ actor: input.actor, action: input.action })) {
    push('actor_action_boundary', `${input.actor} is not authorized to ${input.action}`);
  }

  if (input.actor === 'groq' && (input.claims_technical_fact || input.claims_oem_interval)) {
    push('rule_1_groq_never_authorizes_facts', 'groq attempted to authorize a technical fact or OEM interval');
  }
  if (input.actor === 'groq' && input.claims_sku) {
    push('rule_2_groq_never_authorizes_sku', 'groq attempted to authorize a SKU');
  }
  if (input.actor === 'hermes' && input.publishes_to_user) {
    push('rule_3_hermes_never_publishes_directly', 'hermes output was about to be shown directly to the user');
  }
  if (input.actor === 'hermes' && input.claims_sku) {
    push('rule_4_hermes_never_authorizes_sku', 'hermes attempted to authorize a SKU');
  }
  if (input.actor === 'obsidian' && input.claims_sku) {
    push('rule_5_obsidian_never_authorizes_sku', 'obsidian evidence attempted to authorize a SKU');
  }
  if (input.actor === 'postgresql' && input.claims_oem_interval) {
    push('rule_6_postgresql_never_creates_oem_intervals', 'postgresql evidence attempted to create an OEM interval');
  }
  if (input.actor && input.actor !== 'orchestrator' && input.builds_final_response) {
    push('rule_7_only_orchestrator_builds_response', `${input.actor} attempted to build the final response`);
  }
  if (input.claims_oem_interval && !canPublishOemRecommendation(input.technicalEvidence || input)) {
    push('rule_8_oem_claim_requires_approved_evidence', 'OEM claim present without Obsidian-approved evidence');
  }
  if (input.claims_sku && !canPublishSku(input.skuAuthority || input)) {
    push('rule_9_sku_requires_postgresql_evidence', 'SKU claim present without valid PostgreSQL evidence');
  }
  if (input.is_inference && (input.claims_technical_fact || input.claims_oem_interval)) {
    push('rule_10_inference_is_not_fact', 'an inference was presented as a confirmed technical fact');
  }

  return violations;
}

module.exports = {
  AUTHORITY_POLICY,
  ACTORS,
  ACTIONS,
  ALLOWED_ACTIONS_BY_ACTOR,
  isKnownActor,
  isKnownAction,
  validateAuthorityBoundary,
  canPublishTechnicalFact,
  canPublishOemRecommendation,
  canPublishSku,
  buildAuthorityViolations
};
