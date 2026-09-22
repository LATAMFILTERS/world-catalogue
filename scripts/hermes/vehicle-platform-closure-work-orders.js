#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const manifest = require('../../config/vehicle-platform-closure/isuzu-n-series-us.json');
const {
  createKnowledgeGap,
  validateKnowledgeGap,
} = require('../../lib/knowledge-governance/knowledge-gap-contract');
const {
  createHermesResearchRequest: buildHermesResearchContract,
  validateHermesResearchRequest,
} = require('../../lib/knowledge-governance/hermes-research-contract');
const { buildBrandResearchStrategy } = require('../../lib/hermes-brand-search-router');

function stableId(parts) {
  return crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 24);
}

function buildQuestion({ model, year, engineFamily, displacement, positions }) {
  return [
    `Close the US filter application for ${year} Isuzu ${model} with ${engineFamily} ${displacement}.`,
    `Research these positions: ${positions.join(', ')}.`,
    'Search through specialized official brand engines first: Isuzu US vehicle resources for platform/engine identity; WIX, Donaldson, Fleetguard and MANN official catalogs/application engines for filter fitment. Generic web search may discover a source but cannot replace the specialized brand engine when one exists.',
    'Use US OEM or official filter-manufacturer application evidence for the exact model year and engine.',
    'Do not inherit fitment from a competitor cross-reference, similar model, non-US catalogue, or part-number similarity.',
    'For every position return the exact source part number, filter role, year/model/engine evidence, source URL, and whether the evidence is sufficient for ELIMFILTERS application promotion.',
    'If the exact application cannot be verified, return unresolved rather than guessing.'
  ].join(' ');
}

function buildVehicleClosureWorkOrders({ waveId = 'NPR_US_PRIORITY', requestedAt = new Date().toISOString() } = {}) {
  const wave = (manifest.waves || []).find(item => item.id === waveId);
  if (!wave) throw new Error(`Unknown vehicle closure wave: ${waveId}`);

  const workOrders = [];
  for (const model of wave.models) {
    for (const year of wave.years) {
      const question = buildQuestion({
        model,
        year,
        engineFamily: wave.engine_family,
        displacement: wave.engine_displacement,
        positions: wave.required_positions,
      });
      const brand_search_strategy = buildBrandResearchStrategy({
        brands: ['ISUZU', 'WIX', 'DONALDSON', 'FLEETGUARD', 'MANN-FILTER'],
        market: manifest.market,
      });
      const deterministic = stableId([manifest.platform_id, model, String(year), wave.engine_family, wave.engine_displacement]);
      const gap = createKnowledgeGap({
        request_id: `vehicle-gap-${deterministic}`,
        request_type: 'filter_application',
        origin: 'coverage_audit',
        priority: wave.priority,
        equipment: {
          brand: manifest.make,
          model,
          engine: `${wave.engine_family} ${wave.engine_displacement}`,
          year: String(year),
        },
        system: 'engine_filtration',
        component: 'maintenance_filter_set',
        question,
        reason: `US ${manifest.platform} application coverage is incomplete or not normalized for exact model/year/engine lookup.`,
        source_required: true,
        requested_by: 'HERMES_VEHICLE_PLATFORM_CLOSURE',
        channel: 'catalogue_governance',
        now: requestedAt,
      });
      const research = buildHermesResearchContract({
        research_request_id: `vehicle-research-${deterministic}`,
        knowledge_gap_request_id: gap.request_id,
        research_type: 'VEHICLE_FILTER_APPLICATION_CLOSURE',
        platform: 'ON ROAD',
        applications: [{
          market: manifest.market,
          make: manifest.make,
          platform: manifest.platform,
          model,
          year,
          engine: wave.engine_family,
          displacement: wave.engine_displacement,
          required_positions: wave.required_positions,
        }],
        application_relation: 'candidate',
        equipment: gap.equipment,
        research_question: question,
        required_source_types: [
          'OEM vehicle specification or service/parts source',
          'official filter-manufacturer application catalogue',
          'official filter product page or technical catalogue'
        ],
        preferred_manufacturer_domains: [
          'isuzucv.com',
          'donaldson.com',
          'fleetguard.com',
          'mann-filter.com'
        ],
        minimum_independent_sources: 2,
        allow_competitor_sources: true,
        allow_industry_sources: false,
        priority: wave.priority,
        requested_at: requestedAt,
      });
      const gapValidation = validateKnowledgeGap(gap);
      const researchValidation = validateHermesResearchRequest(research);
      if (!gapValidation.valid || !researchValidation.valid) {
        throw new Error(`Invalid work order ${model} ${year}: ${[...gapValidation.errors, ...researchValidation.errors].join(', ')}`);
      }
      workOrders.push({
        platform_id: manifest.platform_id,
        wave_id: wave.id,
        promotion_policy: 'EXACT_APPLICATION_EVIDENCE_REQUIRED__NO_CROSS_REFERENCE_INHERITANCE',
        brand_search_strategy,
        gap,
        research,
      });
    }
  }
  return workOrders;
}

async function applyWorkOrders(workOrders) {
  const { upsertKnowledgeGap, attachHermesResearchId } = require('../../lib/knowledge-governance/knowledge-gap-store');
  const { createHermesResearchRequest } = require('../../lib/knowledge-governance/hermes-client');
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
      results.push({ request_id: item.gap.request_id, status: 'PERSIST_FAILED', error: stored.error || null });
      continue;
    }

    const submission = await createHermesResearchRequest({
      knowledgeGap: stored.gap,
      researchRequest: item.research,
      requestId: item.research.research_request_id,
      conversationId: 'vehicle-platform-closure',
    });

    let attached = null;
    if (submission.status === 'accepted' && submission.hermes_research_id) {
      attached = await attachHermesResearchId(stored.gap.request_id, submission.hermes_research_id);
    }
    results.push({
      request_id: stored.gap.request_id,
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
  const args = process.argv.slice(2);
  const waveArg = args.find(arg => arg.startsWith('--wave='));
  const waveId = waveArg ? waveArg.slice('--wave='.length) : 'NPR_US_PRIORITY';
  const apply = args.includes('--apply');
  const write = args.includes('--write');
  const workOrders = buildVehicleClosureWorkOrders({ waveId });

  if (write) {
    const outDir = path.resolve(__dirname, '../../hermes/state/vehicle-platform-closure');
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, `${waveId.toLowerCase()}-work-orders.json`);
    fs.writeFileSync(out, JSON.stringify({
      schema_version: '1.0.0',
      generated_at: new Date().toISOString(),
      source_manifest: manifest.platform_id,
      count: workOrders.length,
      work_orders: workOrders,
    }, null, 2) + '\n');
    console.log(`[vehicle-platform-closure] wrote ${out}`);
  }

  if (!apply) {
    console.log(JSON.stringify({
      outcome: 'DRY_RUN',
      wave_id: waveId,
      work_orders: workOrders.length,
      models: [...new Set(workOrders.map(x => x.gap.equipment.model))],
      years: [...new Set(workOrders.map(x => x.gap.equipment.year))],
      direct_catalog_writes: 0,
      policy: 'EXACT_APPLICATION_EVIDENCE_REQUIRED__NO_CROSS_REFERENCE_INHERITANCE',
    }, null, 2));
    return;
  }

  const results = await applyWorkOrders(workOrders);
  console.log(JSON.stringify({
    outcome: 'APPLIED_TO_EXISTING_KNOWLEDGE_GAP_AND_HERMES_PIPELINE',
    wave_id: waveId,
    count: results.length,
    accepted: results.filter(x => x.hermes_status === 'accepted').length,
    duplicates: results.filter(x => x.hermes_status === 'duplicate').length,
    unavailable: results.filter(x => x.hermes_status === 'unavailable').length,
    failed_persistence: results.filter(x => x.status === 'PERSIST_FAILED').length,
    results,
  }, null, 2));
}

if (require.main === module) {
  main().catch(error => {
    console.error('[vehicle-platform-closure] failed', error);
    process.exit(1);
  });
}

module.exports = {
  buildQuestion,
  buildVehicleClosureWorkOrders,
  applyWorkOrders,
};
