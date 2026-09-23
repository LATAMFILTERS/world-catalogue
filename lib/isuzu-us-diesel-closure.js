'use strict';

// Read model for the ISUZU_US_DIESEL_THREE_PHASE_CLOSURE research output.
//
// The three phase files are evidence, not catalogue truth. Nothing here writes
// to PostgreSQL, publishes, or promotes an application. The only thing this
// module does is answer, from the closed evidence, the question the closure
// exists to answer:
//
//   "Give me every filter a USA diesel Isuzu <model> <year> uses."
//
// and it answers it with an explicit status per position, including the
// positions that are NOT_APPLICABLE and the ones that are still UNRESOLVED.
// A caller must never turn an UNRESOLVED position into a recommendation.

const sources = require('../config/vehicle-platform-closure/isuzu-us-diesel-sources.json');
const phase1 = require('../config/vehicle-platform-closure/isuzu-us-diesel-phase1-universe.json');
const phase2 = require('../config/vehicle-platform-closure/isuzu-us-diesel-phase2-oen.json');
const phase3 = require('../config/vehicle-platform-closure/isuzu-us-diesel-phase3-aftermarket.json');

const POSITION_STATUS = Object.freeze(['VERIFIED', 'PARTIAL', 'UNRESOLVED', 'NOT_APPLICABLE', 'CONFLICTING']);
const VEHICLE_STATUS = Object.freeze(['VERIFIED', 'PARTIAL', 'UNRESOLVED', 'CONFLICTING', 'VERIFIED_ABSENT']);

function normalizeModel(value) {
  return String(value ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function sourceIds() {
  return new Set(sources.sources.map((s) => s.source_id));
}

// A Phase 2 binding is either a bare block id ("N-2005-2010") or a block id
// narrowed to part of its own span ("N-2005-2010(2006-2010)", "F-2004-2005(2004 only)").
function parseBinding(binding) {
  const match = /^([A-Za-z0-9-]+)(?:\((.+)\))?$/.exec(String(binding).trim());
  if (!match) return null;
  const [, blockId, range] = match;
  if (!range) return { blockId, years: null };
  const only = /^(\d{4})\s*only$/i.exec(range);
  if (only) return { blockId, years: [Number(only[1])] };
  const span = /^(\d{4})\s*-\s*(\d{4})$/.exec(range);
  if (span) {
    const from = Number(span[1]);
    const to = Number(span[2]);
    return { blockId, years: Array.from({ length: to - from + 1 }, (_, i) => from + i) };
  }
  return { blockId, years: null, unparsed_range: range };
}

function bindingCoversYear(binding, blockId, year) {
  const parsed = parseBinding(binding);
  if (!parsed || parsed.blockId !== blockId) return false;
  if (!parsed.years) return true;
  return parsed.years.includes(Number(year));
}

function blocksFor(year, model) {
  const y = Number(year);
  const wanted = normalizeModel(model);
  return phase1.year_blocks.filter((block) => {
    if (!block.model_years.includes(y)) return false;
    if (!wanted) return true;
    return (block.models || []).some((m) => normalizeModel(m) === wanted);
  });
}

function modelsFor(year) {
  const y = Number(year);
  const out = [];
  for (const block of phase1.year_blocks) {
    if (!block.model_years.includes(y)) continue;
    for (const model of block.models || []) {
      out.push({
        model,
        series: block.series,
        engine_code: block.engine_code,
        displacement: block.displacement_published,
        fuel: block.fuel,
        block_id: block.block_id,
        evidence_status: block.evidence_status[String(y)] || 'UNRESOLVED',
      });
    }
  }
  return out;
}

function positionUniverseFor(series) {
  return phase2.position_universe[series] || {};
}

function oenRowsFor(blockId, year, series) {
  return phase2.oen_rows.filter((row) => {
    if (row.series !== series) return false;
    return (row.binds_to_phase1 || []).some((b) => bindingCoversYear(b, blockId, year));
  });
}

// The canonical answer. Every position the series can have comes back, each
// with a status, so a caller can see the shape of what is closed and what is
// not instead of receiving a silently short list.
function answerFilterSetQuery({ year, model } = {}) {
  const y = Number(year);
  if (!Number.isInteger(y)) {
    return { status: 'NEEDS_YEAR', question: 'Which model year?', positions: [] };
  }
  if (y < phase1.year_from || y > phase1.year_to) {
    return { status: 'OUT_OF_SCOPE', year: y, scope: [phase1.year_from, phase1.year_to], positions: [] };
  }

  const blocks = blocksFor(y, model);
  if (!blocks.length) {
    const available = modelsFor(y);
    if (!normalizeModel(model)) {
      return { status: 'NEEDS_MODEL', year: y, available_models: available, positions: [] };
    }
    return {
      status: 'MODEL_NOT_IN_CLOSED_UNIVERSE',
      year: y,
      model: normalizeModel(model),
      available_models: available,
      positions: [],
    };
  }

  const answers = blocks.map((block) => {
    const vehicleStatus = block.evidence_status[String(y)] || 'UNRESOLVED';
    const universe = positionUniverseFor(block.series);
    const rows = oenRowsFor(block.block_id, y, block.series);

    const positions = Object.entries(universe).map(([position, definition]) => {
      if (definition.applicable === false) {
        return {
          position,
          status: 'NOT_APPLICABLE',
          basis: definition.basis || null,
          isuzu_oe_oen: [],
          aftermarket: null,
        };
      }
      const matched = rows.filter((row) => row.filter_position === position);
      if (!matched.length) {
        return {
          position,
          status: 'UNRESOLVED',
          basis: definition.basis || definition.status_note || 'No Isuzu-published part number covers this position for this year and model.',
          isuzu_oe_oen: [],
          aftermarket: null,
        };
      }
      const worst = matched.some((r) => r.evidence_status === 'PARTIAL') ? 'PARTIAL' : 'VERIFIED';
      return {
        position,
        status: worst,
        isuzu_oe_oen: matched.flatMap((r) => r.isuzu_oe_oen),
        isuzu_rows: matched.map((r) => ({
          row_id: r.row_id,
          description: r.isuzu_part_description,
          published_year_scope: r.isuzu_published_year_scope,
          published_engine_scope: r.isuzu_published_engine_scope,
          fleetvalue_number: r.isuzu_fleetvalue_number || null,
          source: r.source,
          evidence_status: r.evidence_status,
          caveat: r.caveat || r.binding_note || null,
        })),
        // Phase 3 produced no resolution rows, so every position is honest about
        // having no aftermarket answer rather than implying one.
        aftermarket: {
          status: phase3.outcome,
          donaldson_reference: null,
          fleetguard_reference: null,
          elimfilters_base_decision: null,
        },
      };
    });

    return {
      year: y,
      series: block.series,
      model: normalizeModel(model) || block.models.join(' / '),
      block_id: block.block_id,
      engine_code: block.engine_code,
      displacement: block.displacement_published,
      cab_configuration: block.cab_configuration || [],
      vehicle_evidence_status: vehicleStatus,
      conflict_id: block.conflict_id || null,
      positions,
    };
  });

  return {
    status: 'ANSWERED',
    year: y,
    model: normalizeModel(model) || null,
    answers,
    aftermarket_phase_status: phase3.outcome,
  };
}

// Structural and governance checks. These are what the test asserts against,
// so a future edit to any of the three phase files cannot quietly break the
// rules the closure was run under.
function validateClosure() {
  const errors = [];
  const known = sourceIds();

  if (phase1.fuel_scope !== 'DIESEL_ONLY') errors.push('phase1 fuel_scope must be DIESEL_ONLY');
  if (phase2.fuel_scope !== 'DIESEL_ONLY') errors.push('phase2 fuel_scope must be DIESEL_ONLY');
  if (phase3.fuel_scope !== 'DIESEL_ONLY') errors.push('phase3 fuel_scope must be DIESEL_ONLY');
  if (phase2.governance.aftermarket_consulted_in_this_phase !== false) {
    errors.push('phase2 must record that no aftermarket source was consulted');
  }

  const blockIds = new Set();
  const coveredYears = new Map();

  for (const block of phase1.year_blocks) {
    if (blockIds.has(block.block_id)) errors.push(`duplicate phase1 block_id: ${block.block_id}`);
    blockIds.add(block.block_id);

    if (block.fuel !== 'DIESEL') errors.push(`${block.block_id}: fuel must be DIESEL`);

    for (const year of block.model_years) {
      const status = block.evidence_status[String(year)];
      if (!status) errors.push(`${block.block_id}: model year ${year} has no evidence_status`);
      else if (!VEHICLE_STATUS.includes(status)) errors.push(`${block.block_id}: invalid evidence_status ${status} for ${year}`);
      if (!coveredYears.has(year)) coveredYears.set(year, []);
      coveredYears.get(year).push(block.block_id);
    }

    for (const id of [...(block.evidence || []), ...(block.corroboration || []), ...(block.contradicted_by || [])]) {
      if (!known.has(id)) errors.push(`${block.block_id}: unknown source_id ${id}`);
    }

    // A block with models must cite at least one Isuzu primary source, unless
    // every one of its years is explicitly UNRESOLVED.
    const allUnresolved = block.model_years.every((y) => block.evidence_status[String(y)] === 'UNRESOLVED');
    if ((block.models || []).length && !allUnresolved) {
      const primary = (block.evidence || []).some((id) => {
        const src = sources.sources.find((s) => s.source_id === id);
        return src && src.authority_level === 'primary' && src.publisher === 'Isuzu Commercial Truck of America';
      });
      if (!primary) errors.push(`${block.block_id}: no Isuzu primary source cited`);
    }
  }

  for (let year = phase1.year_from; year <= phase1.year_to; year += 1) {
    if (!coveredYears.has(year)) errors.push(`model year ${year} is not covered by any phase1 block`);
  }

  const rowIds = new Set();
  for (const row of phase2.oen_rows) {
    if (rowIds.has(row.row_id)) errors.push(`duplicate phase2 row_id: ${row.row_id}`);
    rowIds.add(row.row_id);
    if (!known.has(row.source)) errors.push(`${row.row_id}: unknown source_id ${row.source}`);
    if (!POSITION_STATUS.includes(row.evidence_status)) errors.push(`${row.row_id}: invalid evidence_status ${row.evidence_status}`);
    if (!Array.isArray(row.isuzu_oe_oen) || !row.isuzu_oe_oen.length) errors.push(`${row.row_id}: isuzu_oe_oen must be a non-empty array`);
    if (!row.isuzu_published_year_scope) errors.push(`${row.row_id}: the published year scope must be reproduced`);

    const src = sources.sources.find((s) => s.source_id === row.source);
    if (src && src.publisher !== 'Isuzu Commercial Truck of America') {
      errors.push(`${row.row_id}: phase2 may only cite Isuzu sources, got ${src.publisher}`);
    }

    for (const binding of row.binds_to_phase1 || []) {
      const parsed = parseBinding(binding);
      if (!parsed) errors.push(`${row.row_id}: unparseable binding ${binding}`);
      else if (!blockIds.has(parsed.blockId)) errors.push(`${row.row_id}: binding to unknown phase1 block ${parsed.blockId}`);
      else if (parsed.unparsed_range) errors.push(`${row.row_id}: unparseable year range in binding ${binding}`);
    }
  }

  // Phase 3 must not silently publish a base decision it did not earn.
  if (phase3.outcome !== 'BLOCKED_AT_SOURCE_1') {
    if (!Array.isArray(phase3.resolution_rows) || !phase3.resolution_rows.length) {
      errors.push('phase3 claims an outcome other than BLOCKED_AT_SOURCE_1 but carries no resolution rows');
    }
  } else if ((phase3.resolution_rows || []).length || (phase3.elimfilters_base_decisions || []).length) {
    errors.push('phase3 is BLOCKED_AT_SOURCE_1 and must carry no resolution rows and no base decisions');
  }
  if (phase3.canonical_hd_rule !== 'DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD') {
    errors.push('phase3 must reuse the existing canonical HD rule, not restate a new one');
  }

  return { valid: errors.length === 0, errors };
}

function coverageReport() {
  const byYear = {};
  for (let year = phase1.year_from; year <= phase1.year_to; year += 1) {
    const models = modelsFor(year);
    byYear[year] = {
      model_count: models.length,
      verified: models.filter((m) => m.evidence_status === 'VERIFIED').length,
      partial: models.filter((m) => m.evidence_status === 'PARTIAL').length,
      unresolved: models.filter((m) => m.evidence_status === 'UNRESOLVED').length,
      conflicting: models.filter((m) => m.evidence_status === 'CONFLICTING').length,
    };
  }
  return {
    year_from: phase1.year_from,
    year_to: phase1.year_to,
    by_year: byYear,
    phase2_rows: phase2.oen_rows.length,
    phase2_verified_rows: phase2.oen_rows.filter((r) => r.evidence_status === 'VERIFIED').length,
    phase2_partial_rows: phase2.oen_rows.filter((r) => r.evidence_status === 'PARTIAL').length,
    phase2_not_applicable_rows: phase2.oen_rows.filter((r) => r.evidence_status === 'NOT_APPLICABLE').length,
    phase2_unresolved_groups: phase2.unresolved_positions.length,
    phase3_outcome: phase3.outcome,
    phase3_resolution_rows: (phase3.resolution_rows || []).length,
  };
}

module.exports = {
  POSITION_STATUS,
  VEHICLE_STATUS,
  sources,
  phase1,
  phase2,
  phase3,
  normalizeModel,
  parseBinding,
  bindingCoversYear,
  blocksFor,
  modelsFor,
  positionUniverseFor,
  oenRowsFor,
  answerFilterSetQuery,
  validateClosure,
  coverageReport,
};
