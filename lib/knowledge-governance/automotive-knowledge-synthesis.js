'use strict';

const crypto = require('crypto');
const {
  KNOWLEDGE_DOMAINS
} = require('./knowledge-domain-registry');
const {
  createKnowledgeObject,
  validateKnowledgeObject
} = require('./knowledge-object-contract');
const {
  AUTOMOTIVE_KNOWLEDGE_SEEDS
} = require('./automotive-knowledge-seed');

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function uniqueObjects(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function normalizeRelationship(statement) {
  return {
    statement,
    relation_type: 'normalized_engineering_relation',
    validation_status: 'awaiting_validation'
  };
}

function normalizeProcedure(instruction, index) {
  return {
    step: index + 1,
    instruction,
    validation_status: 'awaiting_validation'
  };
}

function neutralEvidenceId(profile = {}) {
  const basis = profile.source_hash || profile.source_url || profile.source_id || JSON.stringify(profile);
  return `EVID-${sha256(basis).slice(0, 16).toUpperCase()}`;
}

function sourceEvidenceFromProfile(profile) {
  return {
    evidence_id: neutralEvidenceId(profile),
    source_hash: profile.source_hash,
    published_at: profile.published_at || null,
    evidence_role: 'private_provenance_only',
    public_brand_reference: false,
    evidence_text_retained: false
  };
}

function metricsForSeed(seed, profilesById) {
  const metrics = [];
  for (const id of seed.source_ids) {
    const profile = profilesById.get(id);
    if (!profile) continue;
    const evidenceId = neutralEvidenceId(profile);
    for (const metric of profile.metrics || []) {
      const { source_id, ...rest } = metric;
      metrics.push({ ...rest, evidence_id: evidenceId });
    }
  }
  return uniqueObjects(metrics, (m) => `${m.name}|${m.value}|${m.unit || ''}|${m.evidence_id}`);
}

function synthesizeAutomotiveKnowledge(profiles = []) {
  const profilesById = new Map(profiles.map((profile) => [profile.source_id, profile]));
  const output = [];

  for (const seed of AUTOMOTIVE_KNOWLEDGE_SEEDS) {
    const sourceEvidence = seed.source_ids
      .map((id) => profilesById.get(id))
      .filter(Boolean)
      .map(sourceEvidenceFromProfile);

    const technologies = seed.technologies || [];
    const object = createKnowledgeObject({
      knowledge_object_id: seed.id,
      knowledge_content_type: seed.knowledge_content_type,
      title: seed.title,
      domain: KNOWLEDGE_DOMAINS.LIGHT_DUTY,
      origin_domains: [KNOWLEDGE_DOMAINS.LIGHT_DUTY],
      industries: ['Automotive'],
      systems: seed.systems || [],
      technologies,
      technology_relation: technologies.length ? 'probable' : 'none',
      components: seed.components || [],
      applications: [],
      application_relation: 'candidate',
      problems: seed.problems || [],
      failure_modes: seed.failure_modes || [],
      symptoms: seed.symptoms || [],
      root_causes: seed.root_causes || [],
      diagnostic_methods: seed.diagnostics || [],
      corrective_actions: seed.corrective_actions || [],
      maintenance_procedures: seed.procedures || [],
      procedures: (seed.procedures || []).map(normalizeProcedure),
      metrics: metricsForSeed(seed, profilesById),
      technical_relationships: (seed.technical_relationships || []).map(normalizeRelationship),
      source_claims: [],
      technical_parameters: seed.technical_parameters || {},
      operating_conditions: seed.operating_conditions || [],
      standards: seed.standards || [],
      shared_engineering_concepts: seed.shared_engineering_concepts || [],
      related_products: [],
      source_evidence: sourceEvidence,
      validation_sources: [],
      confidence: sourceEvidence.length >= 2 ? 'medium' : 'low',
      publication_status: 'awaiting_validation',
      public_use_allowed: false
    });

    output.push({
      object,
      validation: validateKnowledgeObject(object),
      source_ids_expected: seed.source_ids,
      source_ids_resolved: seed.source_ids.filter((id) => profilesById.has(id)),
      synthesis_hash: sha256(JSON.stringify({
        title: seed.title,
        relationships: seed.technical_relationships || [],
        evidence_ids: sourceEvidence.map((e) => e.evidence_id)
      }))
    });
  }

  return output;
}

function buildSharedEngineeringFromCanonical(canonicalRecords = []) {
  const byConcept = new Map();
  for (const record of canonicalRecords) {
    const object = record.object || record;
    for (const concept of object.shared_engineering_concepts || []) {
      if (!byConcept.has(concept)) byConcept.set(concept, []);
      byConcept.get(concept).push(object);
    }
  }

  return [...byConcept.entries()].map(([concept, objects]) => {
    const evidence = uniqueObjects(objects.flatMap((o) => o.source_evidence || []), (e) => e.evidence_id);
    const relationships = uniqueObjects(objects.flatMap((o) => o.technical_relationships || []), (r) => r.statement).slice(0, 20);
    const metrics = uniqueObjects(objects.flatMap((o) => o.metrics || []), (m) => `${m.name}|${m.value}|${m.unit || ''}|${m.evidence_id}`).slice(0, 30);
    const sourceSystems = [...new Set(objects.flatMap((o) => o.systems || []))];

    const shared = createKnowledgeObject({
      knowledge_object_id: `SHARED-${concept.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
      knowledge_content_type: 'Shared Engineering Concept',
      title: concept,
      domain: KNOWLEDGE_DOMAINS.SHARED,
      origin_domains: [KNOWLEDGE_DOMAINS.LIGHT_DUTY],
      industries: [], systems: [], technologies: [], technology_relation: 'none',
      applications: [], application_relation: 'candidate',
      metrics,
      technical_relationships: relationships,
      source_claims: [],
      technical_parameters: { source_systems: sourceSystems },
      shared_engineering_concepts: [concept],
      source_evidence: evidence,
      validation_sources: [],
      confidence: objects.length >= 3 ? 'medium' : 'low',
      publication_status: 'awaiting_validation',
      public_use_allowed: false
    });

    return {
      object: shared,
      validation: validateKnowledgeObject(shared),
      supporting_knowledge_objects: objects.map((o) => o.knowledge_object_id)
    };
  });
}

module.exports = {
  neutralEvidenceId,
  synthesizeAutomotiveKnowledge,
  buildSharedEngineeringFromCanonical
};
