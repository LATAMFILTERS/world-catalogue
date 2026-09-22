#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const manifest = require('../../config/vehicle-platform-closure/isuzu-us-phase2-oem.json');
const {
  createKnowledgeGap,
  validateKnowledgeGap,
} = require('../../lib/knowledge-governance/knowledge-gap-contract');
const {
  createHermesResearchRequest,
  validateHermesResearchRequest,
} = require('../../lib/knowledge-governance/hermes-research-contract');

function stableId(parts) {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function years() {
  return Array.from({ length: manifest.year_to - manifest.year_from + 1 }, (_, i) => manifest.year_from + i);
}

function stageQuestion(stage, year) {
  if (stage.id === 'PHASE_1_DIESEL_VEHICLE_UNIVERSE') {
    return [
      `Using only Isuzu Commercial Truck of America primary sources, identify every DIESEL Isuzu commercial-truck model sold in the United States for model year ${year}.`,
      'For each verified diesel model, close the exact Isuzu designation, series, diesel engine family, displacement and relevant configuration.',
      'Exclude gasoline vehicles completely.',
      'Candidate names are search clues only; never infer continuity across model years.',
      'Do not use Donaldson, Fleetguard, WIX, MANN, Baldwin or FRAM to define the OEM vehicle universe.',
      'Return unresolved when Isuzu primary evidence does not prove the exact year/model/diesel powertrain.'
    ].join(' ');
  }

  if (stage.id === 'PHASE_2_DIESEL_OEM_FILTER_OEN') {
    return [
      `For every Phase 1 verified DIESEL Isuzu USA year/model/engine configuration for model year ${year}, use only Isuzu primary parts/service sources to capture genuine OE/OEN references for: ${stage.required_positions.join(', ')}.`,
      'Exclude gasoline vehicles completely.',
      'Preserve published year, model, engine and filter-position scope exactly.',
      'Do not consult Donaldson, Fleetguard or other aftermarket catalogs in this phase.',
      'Do not inherit an OE/OEN between NPR/NPR-HD/NPR-XD/NQR/NRR/F-Series models without Isuzu evidence.',
      'Return unresolved for any position that Isuzu primary evidence does not close.'
    ].join(' ');
  }

  return [
    `For every Phase 2 verified DIESEL Isuzu OE/OEN for model year ${year}, resolve aftermarket references in strict order: Donaldson first, Fleetguard second if Donaldson does not manufacture or cannot close the reference, then MANN-FILTER/Baldwin/WIX/FRAM only as supporting corroboration.`,
    'The verified Isuzu vehicle/application scope from Phases 1 and 2 is immutable; aftermarket sources may not redefine it.',
    'A cross-reference alone must never establish vehicle fitment.',
    'Apply the HD base rule: Donaldson if manufactured; otherwise Fleetguard.',
    'Return unresolved rather than guessing.'
  ].join(' ');
}

function buildPhase2WorkOrders({ requestedAt = new Date().toISOString(), stageId = null } = {}) {
  const selectedStages = stageId ? manifest.stages.filter(x => x.id === stageId) : manifest.stages;
  if (stageId && selectedStages.length === 0) throw new Error(`Unknown phase2 stage: ${stageId}`);
  const workOrders = [];
  for (const stage of selectedStages) {
    for (const year of years()) {
      const deterministic = stableId([manifest.phase_id, stage.id, String(year)]);
      const question = stageQuestion(stage, year);
      const gap = createKnowledgeGap({
        request_id: `isuzu-us-phase2-gap-${deterministic}`,
        request_type: 'filter_application',
        origin: 'coverage_audit',
        priority: year >= 2012 ? 'high' : 'medium',
        equipment: { brand: 'ISUZU', model: null, engine: null, year: String(year) },
        system: 'engine_filtration',
        component: stage.id,
        question,
        reason: `Isuzu USA Phase 2 requires OEM-first closure for model year ${year} before aftermarket lookup.`,
        source_required: true,
        requested_by: 'HERMES_ISUZU_US_PHASE2',
        channel: 'catalogue_governance',
        now: requestedAt,
      });
      const isAftermarketPhase = stage.id === 'PHASE_3_AFTERMARKET_RESOLUTION';
      const research = createHermesResearchRequest({
        research_request_id: `isuzu-us-phase2-research-${deterministic}`,
        knowledge_gap_request_id: gap.request_id,
        research_type: stage.id,
        platform: 'ON ROAD',
        equipment: gap.equipment,
        research_question: question,
        required_source_types: isAftermarketPhase
          ? ['Official Donaldson/Fleetguard/manufacturer product or cross-reference catalog']
          : ['Isuzu Commercial Truck of America official vehicle, service, parts, brochure, specification, or manual source'],
        preferred_manufacturer_domains: isAftermarketPhase
          ? ['donaldson.com', 'fleetguard.com', 'mann-filter.com', 'baldwinfilters.com', 'wixfilters.com', 'fram.com']
          : ['isuzucv.com'],
        minimum_independent_sources: isAftermarketPhase ? 2 : 1,
        allow_competitor_sources: isAftermarketPhase,
        allow_industry_sources: false,
        priority: gap.priority,
        requested_at: requestedAt,
      });
      const gv = validateKnowledgeGap(gap);
      const rv = validateHermesResearchRequest(research);
      if (!gv.valid || !rv.valid) throw new Error([...gv.errors, ...rv.errors].join(', '));
      workOrders.push({
        phase_id: manifest.phase_id,
        stage_id: stage.id,
        year,
        source_policy: stage.id === 'PHASE_3_AFTERMARKET_RESOLUTION'
          ? 'VERIFIED_OEN_REQUIRED__DONALDSON_THEN_FLEETGUARD'
          : 'OEM_ONLY',
        aftermarket_allowed: stage.id === 'PHASE_3_AFTERMARKET_RESOLUTION',
        gap,
        research,
      });
    }
  }
  return workOrders;
}

async function applyPhase2WorkOrders(workOrders) {
  const { upsertKnowledgeGap, attachHermesResearchId } = require('../../lib/knowledge-governance/knowledge-gap-store');
  const { createHermesResearchRequest: submitHermesResearchRequest } = require('../../lib/knowledge-governance/hermes-client');
  const results = [];

  for (const item of workOrders) {
    const stored = await upsertKnowledgeGap({
      request_id: item.gap.request_id,
      request_type: item.gap.request_type,
      origin: item.gap.origin,
      priority: item.gap.priority,
      equipment: item.gap.equipment,
      system: item.gap.system,
      component: item.gap.component,
      question: item.gap.question,
      reason: item.gap.reason,
      source_required: item.gap.source_required,
      requested_by: item.gap.requested_by,
      channel: item.gap.channel,
      deduplication_key: item.gap.deduplication_key,
    });

    if (!stored.persisted || !stored.gap) {
      results.push({ request_id: item.gap.request_id, stage_id: item.stage_id, year: item.year, status: 'PERSIST_FAILED', error: stored.error || null });
      continue;
    }

    const submission = await submitHermesResearchRequest({
      knowledgeGap: stored.gap,
      researchRequest: item.research,
      requestId: item.research.research_request_id,
      conversationId: 'isuzu-us-phase2-oem-closure',
    });

    let attached = null;
    if (submission.status === 'accepted' && submission.hermes_research_id) {
      attached = await attachHermesResearchId(stored.gap.request_id, submission.hermes_research_id);
    }

    results.push({
      request_id: stored.gap.request_id,
      stage_id: item.stage_id,
      year: item.year,
      created: stored.created,
      hermes_status: submission.status,
      hermes_research_id: submission.hermes_research_id || null,
      attached: attached?.persisted === true,
      error_code: submission.error_code || null,
    });
  }
  return results;
}

async function main() {
  const stageArg = process.argv.find(arg => arg.startsWith('--stage='));
  const stageId = stageArg ? stageArg.slice('--stage='.length) : null;
  const apply = process.argv.includes('--apply');
  const workOrders = buildPhase2WorkOrders({ stageId });

  if (!apply) {
    console.log(JSON.stringify({
      outcome: 'DRY_RUN',
      phase_id: manifest.phase_id,
      year_from: manifest.year_from,
      year_to: manifest.year_to,
      stages: [...new Set(workOrders.map(x => x.stage_id))],
      work_orders: workOrders.length,
      fuel_scope: manifest.fuel_scope,
      aftermarket_allowed: workOrders.some(x => x.aftermarket_allowed),
      direct_catalog_writes: 0,
    }, null, 2));
    return;
  }

  if (!stageId) {
    throw new Error('--apply requires one explicit --stage so the three diesel phases execute sequentially');
  }

  const results = await applyPhase2WorkOrders(workOrders);
  console.log(JSON.stringify({
    outcome: 'APPLIED_TO_EXISTING_KNOWLEDGE_GAP_AND_HERMES_PIPELINE',
    phase_id: manifest.phase_id,
    stage_id: stageId,
    count: results.length,
    accepted: results.filter(x => x.hermes_status === 'accepted').length,
    duplicates: results.filter(x => x.hermes_status === 'duplicate').length,
    unavailable: results.filter(x => x.hermes_status === 'unavailable').length,
    failed_persistence: results.filter(x => x.status === 'PERSIST_FAILED').length,
    direct_catalog_writes: 0,
    results,
  }, null, 2));
}

if (require.main === module) {
  main().catch(error => {
    console.error('[isuzu-us-phase2-oem] failed', error);
    process.exit(1);
  });
}

module.exports = { years, stageQuestion, buildPhase2WorkOrders, applyPhase2WorkOrders };
