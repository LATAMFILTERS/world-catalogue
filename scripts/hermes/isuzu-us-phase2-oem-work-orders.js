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
  if (stage.id === '2A_MODEL_UNIVERSE') {
    return [
      `Using only Isuzu Commercial Truck of America primary sources, identify every Isuzu commercial-truck model sold in the United States for model year ${year}.`,
      'Preserve the exact Isuzu model designation. Candidate names are search clues only.',
      'Do not use Donaldson, Fleetguard, WIX, MANN, Baldwin, FRAM or any aftermarket source to define the OEM model universe.',
      'Return source URL(s), exact source wording, model designation, series/family, and evidence status. If Isuzu primary evidence is not found, return unresolved.'
    ].join(' ');
  }
  if (stage.id === '2B_POWERTRAIN_CONFIGURATION') {
    return [
      `For every Isuzu USA model verified for model year ${year}, use only Isuzu primary sources to close fuel type, exact engine family, displacement, cab/configuration and model-specific technical distinctions.`,
      'Do not infer that two Isuzu models share an engine or service parts merely because they are in the same series.',
      'Return one record per exact year/model/configuration with source URL(s) and exact source wording. Unproven fields remain unresolved.'
    ].join(' ');
  }
  return [
    `For every Isuzu USA year/model/engine configuration verified for model year ${year}, use only Isuzu primary parts/service sources to capture genuine OE/OEN references for: ${stage.required_positions.join(', ')}.`,
    'Preserve published year, model, engine and filter-position scope exactly.',
    'Do not consult Donaldson, Fleetguard or other aftermarket catalogs in this phase.',
    'Do not inherit an OE/OEN from one NPR/NQR/NRR/F-Series model to another without Isuzu evidence.',
    'Return unresolved for any position that Isuzu primary evidence does not close.'
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
      const research = createHermesResearchRequest({
        research_request_id: `isuzu-us-phase2-research-${deterministic}`,
        knowledge_gap_request_id: gap.request_id,
        research_type: stage.id,
        platform: 'ON ROAD',
        equipment: gap.equipment,
        research_question: question,
        required_source_types: ['Isuzu Commercial Truck of America official vehicle, service, parts, brochure, specification, or manual source'],
        preferred_manufacturer_domains: ['isuzucv.com'],
        minimum_independent_sources: 1,
        allow_competitor_sources: false,
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
        source_policy: 'OEM_ONLY_UNTIL_PHASE2_COMPLETE',
        aftermarket_allowed: false,
        gap,
        research,
      });
    }
  }
  return workOrders;
}

if (require.main === module) {
  const stageArg = process.argv.find(arg => arg.startsWith('--stage='));
  const stageId = stageArg ? stageArg.slice('--stage='.length) : null;
  const workOrders = buildPhase2WorkOrders({ stageId });
  console.log(JSON.stringify({
    outcome: 'DRY_RUN',
    phase_id: manifest.phase_id,
    year_from: manifest.year_from,
    year_to: manifest.year_to,
    stages: [...new Set(workOrders.map(x => x.stage_id))],
    work_orders: workOrders.length,
    aftermarket_allowed: false,
    direct_catalog_writes: 0,
  }, null, 2));
}

module.exports = { years, stageQuestion, buildPhase2WorkOrders };
