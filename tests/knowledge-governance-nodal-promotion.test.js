'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseCandidateNote,
  reviewTemplateForCandidate,
  evaluatePromotion,
  renderApprovedCanonicalNote
} = require('../lib/knowledge-governance/nodal-promotion-gate');

const NOTE = `---
type: structured_knowledge_candidate
status: candidate
knowledge_object_id: "LD-TEST-001"
title: "Restriction and Flow"
domain: "LIGHT_DUTY_KNOWLEDGE_DOMAIN"
knowledge_content_type: "Engineering Reference"
confidence: "medium"
publication_status: awaiting_validation
public_use_allowed: false
hermes_origin: true
nodal_review_required: true
catalog_write_allowed: false
cross_reference_write_allowed: false
---

# Restriction and Flow

## Knowledge Position

- Domain: LIGHT_DUTY_KNOWLEDGE_DOMAIN
- Industries: Automotive
- Systems: Air Intake & Airflow Protection Systems
- Technologies: MACROCORE™
- Technology relation: probable
- Application relation: candidate

## Procedures

1. Inspect the sealing surface before installation. | status: awaiting_validation

## Metrics — Awaiting Validation

- Restriction: 2.5 kPa | evidence: EVID-ABC123 | status: awaiting_validation

## Technical Relationships — Awaiting Validation

- Increased contaminant loading raises restriction at a given airflow. | status: awaiting_validation

## Evidence Trace

- EVID-ABC123
- EVID-DEF456
`;

function approve(items, method = 'engineering_review') {
  return items.map((item) => ({ ...item, decision: 'approved', validation_method: method, supporting_evidence_ids: ['EVID-ABC123', 'EVID-DEF456'], reviewer: 'Technical Reviewer', reviewed_at: '2026-09-10T23:00:00-05:00' }));
}

test('review templates begin blocked and require item-level decisions', () => {
  const candidate = parseCandidateNote(NOTE);
  const review = reviewTemplateForCandidate(candidate);
  const result = evaluatePromotion(candidate, review);
  assert.equal(result.ready, false);
  assert.equal(result.counts.metrics, 1);
  assert.equal(result.counts.relationships, 1);
  assert.equal(result.counts.procedures, 1);
});

test('promotion requires all metrics, relationships and procedures to be approved', () => {
  const candidate = parseCandidateNote(NOTE);
  const review = reviewTemplateForCandidate(candidate);
  review.review_status = 'approved';
  review.reviewer = 'Technical Reviewer';
  review.reviewed_at = '2026-09-10T23:00:00-05:00';
  Object.assign(review.scope_review, {
    official_system_registry_verified: true,
    technical_scope_verified: true,
    source_neutrality_verified: true,
    no_proprietary_external_claims_verified: true,
    public_language_reviewed: true,
    technology_relation_resolution: 'confirmed',
    application_relation_resolution: 'not_applicable'
  });
  review.metric_reviews = approve(review.metric_reviews, 'cross_source_validation');
  review.relationship_reviews = approve(review.relationship_reviews, 'engineering_review');
  review.procedure_reviews = approve(review.procedure_reviews, 'engineering_review');
  const result = evaluatePromotion(candidate, review);
  assert.equal(result.ready, true, result.blockers.join('; '));
  const approved = renderApprovedCanonicalNote(NOTE, review);
  assert.match(approved, /type: canonical_knowledge/);
  assert.match(approved, /status: approved/);
  assert.match(approved, /public_use_allowed: true/);
  assert.match(approved, /Promotion gate: PASS/);
});

test('cross-source metric validation requires at least two neutral evidence IDs', () => {
  const candidate = parseCandidateNote(NOTE);
  const review = reviewTemplateForCandidate(candidate);
  review.review_status = 'approved'; review.reviewer = 'Reviewer'; review.reviewed_at = '2026-09-10T23:00:00-05:00';
  Object.assign(review.scope_review, { official_system_registry_verified: true, technical_scope_verified: true, source_neutrality_verified: true, no_proprietary_external_claims_verified: true, public_language_reviewed: true, technology_relation_resolution: 'confirmed', application_relation_resolution: 'not_applicable' });
  review.metric_reviews = approve(review.metric_reviews, 'cross_source_validation').map((item) => ({ ...item, supporting_evidence_ids: ['EVID-ABC123'] }));
  review.relationship_reviews = approve(review.relationship_reviews);
  review.procedure_reviews = approve(review.procedure_reviews);
  const result = evaluatePromotion(candidate, review);
  assert.equal(result.ready, false);
  assert.ok(result.blockers.some((x) => x.includes('at least two evidence IDs')));
});

test('a non-official sixth system is blocked from canonical promotion', () => {
  const bad = NOTE.replace('Air Intake & Airflow Protection Systems', 'Cabin Air Protection');
  const candidate = parseCandidateNote(bad);
  const review = reviewTemplateForCandidate(candidate);
  const result = evaluatePromotion(candidate, review);
  assert.equal(result.ready, false);
  assert.ok(result.blockers.some((x) => x.includes('official five-system registry')));
});

test('external source signatures remain a hard blocker', () => {
  const candidate = parseCandidateNote(`${NOTE}\nFRAM technical reference\n`);
  const review = reviewTemplateForCandidate(candidate);
  const result = evaluatePromotion(candidate, review);
  assert.equal(result.ready, false);
  assert.ok(result.blockers.some((x) => x.includes('source leakage')));
});
