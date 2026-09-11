'use strict';

const SYNTHESIS_STATUS = Object.freeze([
  'draft',
  'needs_corroboration',
  'ready_for_nodal_review',
  'rejected'
]);

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function buildSynthesisInput({ knowledge_object, shared_engineering = [], nodal_context = [] } = {}) {
  if (!knowledge_object) throw new Error('knowledge_object is required');
  return {
    knowledge_object_id: knowledge_object.knowledge_object_id,
    title: knowledge_object.title,
    knowledge_content_type: knowledge_object.knowledge_content_type,
    domain: knowledge_object.domain,
    industries: list(knowledge_object.industries),
    systems: list(knowledge_object.systems),
    technologies: list(knowledge_object.technologies),
    technology_relation: knowledge_object.technology_relation,
    components: list(knowledge_object.components),
    problems: list(knowledge_object.problems),
    failure_modes: list(knowledge_object.failure_modes),
    symptoms: list(knowledge_object.symptoms),
    root_causes: list(knowledge_object.root_causes),
    diagnostic_methods: list(knowledge_object.diagnostic_methods),
    corrective_actions: list(knowledge_object.corrective_actions),
    procedures: list(knowledge_object.procedures),
    metrics: list(knowledge_object.metrics),
    technical_relationships: list(knowledge_object.technical_relationships),
    operating_conditions: list(knowledge_object.operating_conditions),
    shared_engineering_concepts: list(knowledge_object.shared_engineering_concepts),
    shared_engineering: list(shared_engineering),
    nodal_context: list(nodal_context),
    internal_source_evidence_count: list(knowledge_object.source_evidence).length,
    public_source_reference_allowed: false
  };
}

function buildSynthesisInstructions() {
  return [
    'Act as the ELIMFILTERS technical knowledge synthesis engine.',
    'Reason from normalized engineering facts, relationships, metrics and approved Nodal Center context; do not paraphrase external articles.',
    'Produce source-neutral engineering language suitable for ELIMFILTERS internal review.',
    'Never mention, cite, imitate or allude to external competitor/source brands in public-facing wording.',
    'Do not invent numeric values. Every numeric claim must remain tied to an evidence metric and marked awaiting validation unless independently confirmed.',
    'Do not turn a probable ELIMFILTERS technology relationship into a confirmed relationship.',
    'Do not turn a candidate vehicle/application relationship into a verified application.',
    'Prefer causal engineering explanations: condition -> mechanism -> effect -> diagnostic -> corrective action.',
    'Distinguish generic engineering principles from application-specific specifications.',
    'When evidence is weak, conflicting or single-source, mark the claim as needing corroboration rather than smoothing over uncertainty.',
    'Return original ELIMFILTERS technical synthesis, not a rewritten version of source prose.'
  ].join('\n');
}

function validateSynthesisOutput(output = {}, input = {}) {
  const errors = [];
  if (!SYNTHESIS_STATUS.includes(output.status)) errors.push('invalid synthesis status');
  if (!output.title) errors.push('title is required');
  if (!Array.isArray(output.engineering_principles)) errors.push('engineering_principles must be an array');
  if (!Array.isArray(output.causal_relations)) errors.push('causal_relations must be an array');
  if (!Array.isArray(output.diagnostic_guidance)) errors.push('diagnostic_guidance must be an array');
  if (!Array.isArray(output.service_guidance)) errors.push('service_guidance must be an array');
  if (output.technology_relation === 'confirmed' && input.technology_relation !== 'confirmed') {
    errors.push('AI synthesis cannot promote a technology relation to confirmed');
  }
  if (output.application_relation === 'verified' && input.application_relation !== 'verified') {
    errors.push('AI synthesis cannot promote an application relation to verified');
  }
  const publicText = JSON.stringify({
    title: output.title,
    engineering_principles: output.engineering_principles,
    causal_relations: output.causal_relations,
    diagnostic_guidance: output.diagnostic_guidance,
    service_guidance: output.service_guidance
  });
  if (/\bFRAM\b|fram\.com|https?:\/\//i.test(publicText)) errors.push('external source leakage detected in synthesis output');
  return { valid: errors.length === 0, errors };
}

module.exports = {
  SYNTHESIS_STATUS,
  buildSynthesisInput,
  buildSynthesisInstructions,
  validateSynthesisOutput
};
