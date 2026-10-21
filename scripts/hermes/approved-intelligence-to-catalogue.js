#!/usr/bin/env node
'use strict';

// Bridge a *recorded* HERMES intelligence approval to the existing research
// intake. This does not approve publication, create an SKU, or infer a fitment.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { createKnowledgeGap, validateKnowledgeGap } = require('../../lib/knowledge-governance/knowledge-gap-contract');
const { createHermesResearchRequest: buildRequest, validateHermesResearchRequest } = require('../../lib/knowledge-governance/hermes-research-contract');
const { upsertKnowledgeGap, attachHermesResearchId } = require('../../lib/knowledge-governance/knowledge-gap-store');
const { createHermesResearchRequest: submitRequest } = require('../../lib/knowledge-governance/hermes-client');

const ALL_SYSTEMS = Object.freeze([
  'engine oil and lubrication', 'engine intake air and crankcase ventilation',
  'fuel and water separation', 'transmission and gearbox',
  'hydraulic pressure, return, suction and breathers', 'cab and HVAC',
  'compressed air dryers and pneumatic circuits', 'coolant and conditioning',
  'emissions and aftertreatment', 'axles, differentials and driveline',
  'auxiliary power, steering and any other OEM-documented filtration system'
]);

function buildOrder(approved, equipment) {
  if (approved?.workflow_status !== 'APPROVED' || !approved?.approved_by || !approved?.approved_at) {
    throw new Error('An explicit recorded approval is required before research intake');
  }
  if (!String(approved.entity_code || '').startsWith('HERMES_REAL_')) throw new Error('Not a real HERMES intelligence candidate');
  const make = String(equipment?.brand || '').trim();
  const model = String(equipment?.model || '').trim();
  if (!make || !model) throw new Error('Exact equipment brand and model are required; do not infer from headlines');
  const seed = [approved.entity_code, make.toUpperCase(), model.toUpperCase(), equipment.engine || '', equipment.year || ''].join('|');
  const id = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 24);
  const question = [
    'Investigate every OEM-documented filtration system for the equipment and ALL its relevant years, engines, transmissions, trims and optional configurations.',
    'Scope: ' + ALL_SYSTEMS.join('; ') + '.',
    'Get official OEM parts, maintenance, operator and application catalogues; preserve document URLs and exact configuration applicability.',
    'For every filter position establish OEM/OEN identity, part number, technical specifications, dimensions and evidence.',
    'After OEM identification, research Donaldson first, Fleetguard second, then other manufacturer catalogues as appropriate; distinguish documented cross-references from verified equipment fitment.',
    'Apply ELIMFILTERS codigo_base rules and propose SKU opportunities only with certified provenance, never by numeric similarity.',
    'Return a per-configuration and per-system coverage matrix: VERIFIED, NOT_APPLICABLE_WITH_OEM_EVIDENCE, or PENDING_RESEARCH. Never treat missing evidence as not applicable.',
    'Keep each unresolved system and conflict in the research queue. NO catalogue writes, SKU activation or publication without separate certification and authorization.',
    'Source signal: ' + String(approved.source_url || '') + '.'
  ].join(' ');
  const gap = createKnowledgeGap({
    request_id: 'intel-gap-' + id, request_type: 'filter_application', origin: 'human',
    priority: 'high', equipment: { brand:make, model, engine:equipment.engine || null, year:equipment.year || null },
    system: 'all_oem_filtration_systems', component: 'complete_filter_coverage',
    question, reason: 'Approved HERMES intelligence: ' + approved.entity_code,
    requested_by: approved.approved_by, channel: 'hermes_weekly_approved',
    deduplication_key: 'hermes-intel-' + id
  });
  const research = buildRequest({
    research_request_id: 'intel-research-' + id,
    knowledge_gap_request_id: gap.request_id,
    research_type: 'COMPLETE_OEM_FILTRATION_COVERAGE',
    equipment: gap.equipment, system: gap.system, component: gap.component,
    application_relation: 'candidate', research_question: question,
    required_source_types: ['official OEM parts/service/maintenance catalogue', 'official OEM equipment configuration', 'official filter manufacturer parts/application catalogue'],
    minimum_independent_sources: 2, allow_competitor_sources: true,
    allow_industry_sources: false, priority: 'high'
  });
  const a = validateKnowledgeGap(gap), b = validateHermesResearchRequest(research);
  if (!a.valid || !b.valid) throw new Error([...a.errors, ...b.errors].join('; '));
  return { gap, research, systems: [...ALL_SYSTEMS], source_candidate: approved.entity_code, publication_authorized: false };
}

async function submitApprovedOrder(order) {
  const stored = await upsertKnowledgeGap(order.gap);
  if (!stored.persisted || !stored.gap) return { status:'PERSIST_FAILED', error:stored.error || null };
  const submission = await submitRequest({
    knowledgeGap: stored.gap, researchRequest:order.research,
    requestId:order.research.research_request_id, conversationId:'hermes-weekly-approval'
  });
  if (submission.status === 'accepted' && submission.hermes_research_id) {
    await attachHermesResearchId(stored.gap.request_id, submission.hermes_research_id);
  }
  return { status:submission.status, research_id:submission.hermes_research_id || null, error_code:submission.error_code || null, source_candidate:order.source_candidate, publication_authorized:false };
}

function exactEquipment(candidate) {
  const e = candidate?.equipment || candidate?.application?.equipment || {};
  return { brand:String(e.brand || e.make || '').trim(), model:String(e.model || '').trim(), engine:e.engine || null, year:e.year || null };
}

// A verified news item is not an equipment catalogue: without an exact make+model,
// queue OEM identity research instead of guessing a model from a headline.
// ponytail: mirrors the identity stage in poll-outlook-approvals.js; merge them if that poller is re-enabled.
async function submitIdentityResearch(approved, { upsert = upsertKnowledgeGap, send = submitRequest, attach = attachHermesResearchId } = {}) {
  const code = approved.entity_code;
  const equipment = exactEquipment(approved);
  const signal = String(approved.research_resolution?.finding_title || approved.source_title || code);
  const gap = createKnowledgeGap({
    request_id:'intel-identity-' + code, origin:'human', request_type:'filter_application', priority:'high', equipment,
    system:'all_oem_filtration_systems', component:'equipment_configuration_identification',
    question:'Identify the exact OEM manufacturer, equipment model, years, engine and transmission variants and official parts/service catalogues for this verified industrial signal: ' + signal + '. Source ' + String(approved.research_resolution?.evidence_url || approved.source_url || '') + '. Then research every OEM-documented filtration system. No publication.',
    reason:'Approved HERMES intelligence requires OEM configuration identification: ' + code,
    requested_by:'Victor Abreu', channel:'hermes_weekly_approved', deduplication_key:'hermes-identity-' + code
  });
  const research = buildRequest({
    research_request_id:'intel-identity-research-' + code, knowledge_gap_request_id:gap.request_id,
    research_type:'OEM_EQUIPMENT_IDENTIFICATION', equipment, system:gap.system, component:gap.component,
    research_question:gap.question, required_source_types:['official OEM vehicle catalogue', 'official OEM parts and service catalogue'],
    minimum_independent_sources:1, allow_competitor_sources:false, allow_industry_sources:false, priority:'high'
  });
  const stored = await upsert(gap);
  if (!stored.persisted || !stored.gap) return { status:'PERSIST_FAILED', research_id:null };
  const sent = await send({ knowledgeGap:stored.gap, researchRequest:research, requestId:research.research_request_id, conversationId:'hermes-weekly-identity' });
  if (sent.status === 'accepted' && sent.hermes_research_id) await attach(stored.gap.request_id, sent.hermes_research_id);
  return { status:sent.status, research_id:sent.hermes_research_id || null, error_code:sent.error_code || null };
}

// Option B: an ACEPTAR on an OEM/equipment/application finding opens complete OEM research.
const RESEARCH_TYPES = new Set(['oem_update', 'equipment_update', 'application_update', 'oem_reference_update']);
const needsOemResearch = (candidate) => RESEARCH_TYPES.has(candidate?.candidate_type);

async function queueApprovedResearch(approved, deps = {}) {
  const equipment = exactEquipment(approved);
  if (equipment.brand && equipment.model) return (deps.submitOrder || submitApprovedOrder)(buildOrder(approved, equipment));
  return submitIdentityResearch(approved, deps);
}

if (require.main === module) {
  (async () => {
    const [candidatePath, make, model] = process.argv.slice(2);
    if (!candidatePath || !make || !model) throw new Error('Usage: node scripts/hermes/approved-intelligence-to-catalogue.js <approved-candidate.json> <OEM-make> <exact-model>');
    const approved = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
    const order = buildOrder(approved, {brand:make,model});
    const result = await submitApprovedOrder(order);
    console.log(JSON.stringify(result, null, 2));
    if (!['accepted','duplicate'].includes(result.status)) process.exitCode = 1;
  })().catch(e=>{ console.error(e.message);process.exitCode=1; });
}

module.exports = { ALL_SYSTEMS, buildOrder, submitApprovedOrder, exactEquipment, submitIdentityResearch, needsOemResearch, queueApprovedResearch };
