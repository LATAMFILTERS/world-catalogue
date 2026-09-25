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

// Isuzu heads its parts sections with model LINES. A suffix variant belongs to
// its line (NPR-HD and NPR-XD to NPR, NRR DERATE to NRR, FVR DERATE to FVR); a
// separate line does not. This is what keeps FRR and FXR from quietly picking up
// the FTR/FVR/FSR rows they share a block and an engine with.
function modelLineOf(model) {
  const key = normalizeModel(model);
  if (!key) return null;
  const line = key.split(/[\s-]/)[0];
  return line || null;
}

function oenRowsFor(blockId, year, series, model) {
  const line = modelLineOf(model);
  const wanted = normalizeModel(model);
  return phase2.oen_rows.filter((row) => {
    if (row.series !== series) return false;
    if (wanted && Array.isArray(row.applies_to_models_exact)
      && !row.applies_to_models_exact.map(normalizeModel).includes(wanted)) return false;
    if (line && Array.isArray(row.applies_to_model_lines) && !row.applies_to_model_lines.includes(line)) return false;
    return (row.binds_to_phase1 || []).some((b) => bindingCoversYear(b, blockId, year));
  });
}

function resolutionFor(phase2RowId) {
  return (phase3.resolution_rows || []).find((row) => row.phase2_row_id === phase2RowId) || null;
}

function aftermarketFor(phase2RowId) {
  const row = resolutionFor(phase2RowId);
  if (!row) return { phase2_row_id: phase2RowId, decision_status: 'UNRESOLVED', donaldson_reference: null, fleetguard_reference: null, elimfilters_base_decision: null };
  return {
    phase2_row_id: phase2RowId,
    decision_status: row.decision_status,
    donaldson_status: row.donaldson_status,
    donaldson_reference: row.donaldson_part,
    fleetguard_reference: row.fleetguard_part,
    elimfilters_base_decision: row.elimfilters_base_decision,
  };
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
    const rows = oenRowsFor(block.block_id, y, block.series, model);

    // Entries Isuzu schedules but that are not maintenance filters in the
    // ELIMFILTERS sense (the DPF) are reported separately so they neither pad
    // the filter set nor look like an unanswered position.
    const informational = Object.entries(universe)
      .filter(([, definition]) => definition.excluded_from_filter_set === true)
      .map(([position, definition]) => ({
        position,
        applicable: definition.applicable,
        isuzu_schedule_item: definition.isuzu_schedule_item || null,
        service: definition.service || null,
        excluded_because: definition.status_note || null,
      }));

    const positions = Object.entries(universe)
      .filter(([, definition]) => definition.excluded_from_filter_set !== true)
      .map(([position, definition]) => {
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
          // Phase 3 decisions are attached per Phase 2 row and never widen the
          // Phase 2 scope above. A row without a base keeps a null SKU.
          aftermarket: matched.map((r) => aftermarketFor(r.row_id)),
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
      informational,
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

    // Every row must say which model lines it covers, and every line it claims
    // must actually appear in the section heading Isuzu published it under.
    // Without this a row silently reverts to block-level scope and starts
    // handing its part number to models Isuzu never named.
    if (!Array.isArray(row.applies_to_model_lines) || !row.applies_to_model_lines.length) {
      errors.push(`${row.row_id}: applies_to_model_lines must be a non-empty array`);
    } else {
      for (const line of row.applies_to_model_lines) {
        if (!String(row.isuzu_published_model_scope || '').includes(line)) {
          errors.push(`${row.row_id}: claims model line ${line}, which is not in its published scope "${row.isuzu_published_model_scope}"`);
        }
      }
    }

    for (const binding of row.binds_to_phase1 || []) {
      const parsed = parseBinding(binding);
      if (!parsed) errors.push(`${row.row_id}: unparseable binding ${binding}`);
      else if (!blockIds.has(parsed.blockId)) errors.push(`${row.row_id}: binding to unknown phase1 block ${parsed.blockId}`);
      else if (parsed.unparsed_range) errors.push(`${row.row_id}: unparseable year range in binding ${binding}`);
    }
  }

  errors.push(...validatePhase3().errors);

  return { valid: errors.length === 0, errors };
}

// PHASE 2 coverage matrix: every Phase 1 vehicle (year x model, including
// every H-Series model now that Phase 1 carries block H-2005-2008) crossed
// with every filter position that vehicle's own series can have. Built
// entirely on top of modelsFor()/answerFilterSetQuery(), which already do
// the model-line-scoped, no-inheritance-safe row matching -- this function
// adds no new matching logic of its own, only aggregation, so it cannot
// silently diverge from the single-vehicle answer a caller gets elsewhere.
//
// Every cell gets a real status (VERIFIED, PARTIAL, UNRESOLVED,
// NOT_APPLICABLE or CONFLICTING). A vehicle whose own Phase 1 evidence_status
// is CONFLICTING has every one of its position cells forced to CONFLICTING
// too, because no filter fitment can be trusted for a vehicle identity that
// is not itself settled -- this is the only case where the coverage matrix
// overrides what answerFilterSetQuery would return for a single, explicit
// query.
function phase2CoverageMatrix() {
  const rows = [];
  for (let year = phase1.year_from; year <= phase1.year_to; year += 1) {
    for (const entry of modelsFor(year)) {
      const answer = answerFilterSetQuery({ year, model: entry.model });
      const vehicleAnswer = (answer.answers || []).find((a) => a.block_id === entry.block_id) || (answer.answers || [])[0];

      if (!vehicleAnswer) {
        rows.push({
          year,
          series: entry.series,
          model: entry.model,
          engine_code: entry.engine_code,
          vehicle_evidence_status: entry.evidence_status,
          position: null,
          status: 'UNRESOLVED',
          basis: 'No answerFilterSetQuery match was found for this Phase 1 vehicle; the coverage matrix itself has no data for this cell.',
        });
        continue;
      }

      for (const p of vehicleAnswer.positions) {
        rows.push({
          year,
          series: entry.series,
          model: entry.model,
          engine_code: entry.engine_code,
          vehicle_evidence_status: entry.evidence_status,
          position: p.position,
          // A vehicle identity that is itself CONFLICTING cannot support a
          // trusted filter answer, whatever the position-level row says.
          status: entry.evidence_status === 'CONFLICTING' ? 'CONFLICTING' : p.status,
          isuzu_oe_oen: p.isuzu_oe_oen || [],
          basis: p.basis || null,
        });
      }
    }
  }
  return rows;
}

function phase2CoverageSummary() {
  const rows = phase2CoverageMatrix();
  const byStatus = { VERIFIED: 0, PARTIAL: 0, UNRESOLVED: 0, NOT_APPLICABLE: 0, CONFLICTING: 0 };
  for (const r of rows) {
    if (Object.prototype.hasOwnProperty.call(byStatus, r.status)) byStatus[r.status] += 1;
  }
  const vehicles = new Set(rows.map((r) => `${r.year}|${r.series}|${r.model}`));
  return {
    total_position_cells: rows.length,
    total_vehicle_year_combinations: vehicles.size,
    by_status: byStatus,
  };
}

const PHASE3_DECISION_STATUS = Object.freeze(['VERIFIED_BASE', 'BLOCKED_DONALDSON', 'BLOCKED_OEM', 'PARTIAL', 'CONFLICTING', 'NO_ELIMFILTERS_SKU_YET']);
const DONALDSON_STATUS = Object.freeze(['DONALDSON_VERIFIED', 'DONALDSON_NOT_MANUFACTURED_VERIFIED', 'DONALDSON_NOT_FOUND', 'DONALDSON_SOURCE_BLOCKED', 'DONALDSON_AMBIGUOUS']);
const RELATIONSHIP_TYPE = Object.freeze(['DIRECT_OE_CROSS', 'SUPERSESSION', 'ALTERNATE', 'ASSEMBLY_CROSS', 'ELEMENT_CROSS', 'KIT_CROSS', 'ENGINE_LEVEL_ONLY', 'VEHICLE_LEVEL_ONLY', 'UNVERIFIED']);
const SUPPORTING_BRANDS = Object.freeze(['MANN-FILTER', 'BALDWIN', 'WIX', 'FRAM']);

// PHASE 3 governance. Aftermarket only resolves an Isuzu OE/OEN that Phase 2
// already closed; it never adds, widens or narrows a vehicle scope.

function evaluateOemFallbackEligibility(row = {}) {
  const base = String(row.base_source_part || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const oens = (row.isuzu_oe_oen || []).map((x) => String(x || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
  const fallback = row.oem_fallback && typeof row.oem_fallback === 'object' ? row.oem_fallback : {};
  const approved = String(fallback.approved_codigo_base || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const source = String(fallback.approved_source_column || '').trim().toUpperCase();

  const checks = {
    donaldson_absence_verified: row.donaldson_status === 'DONALDSON_NOT_MANUFACTURED_VERIFIED',
    fleetguard_absence_verified: row.fleetguard_status === 'FLEETGUARD_NOT_MANUFACTURED_VERIFIED',
    oem_oen_verified_first_party: fallback.oem_oen_verified_first_party === true,
    approved_source_is_oem_codes: source === 'OEM_CODES',
    approved_code_matches_base: Boolean(approved && base && approved === base),
    base_is_exact_verified_oen: Boolean(base && oens.includes(base)),
  };

  return {
    eligible: Object.values(checks).every(Boolean),
    authority: 'VERIFIED_OEM_FALLBACK',
    checks,
  };
}

function validatePhase3() {
  const errors = [];
  const known = sourceIds();
  const phase2Rows = new Map(phase2.oen_rows.map((row) => [row.row_id, row]));
  const eligible = phase2.oen_rows.filter((row) => row.evidence_status !== 'NOT_APPLICABLE');

  if (phase3.canonical_hd_rule !== 'DONALDSON_THEN_FLEETGUARD_THEN_VERIFIED_OEM') {
    errors.push('phase3 must use the governed HD priority Donaldson -> Fleetguard -> verified OEM fallback');
  }
  if (phase3.governance?.publication_authorized !== false) errors.push('phase3 must not authorise publication');
  if ((phase3.governance?.catalog_writes_performed || []).length) errors.push('phase3 must perform no catalogue writes');

  const seen = new Set();
  for (const row of phase3.resolution_rows || []) {
    const p2 = phase2Rows.get(row.phase2_row_id);
    if (!p2) { errors.push(`${row.row_id}: points to unknown phase2 row ${row.phase2_row_id}`); continue; }
    if (seen.has(row.phase2_row_id)) errors.push(`${row.row_id}: duplicate resolution for ${row.phase2_row_id}`);
    seen.add(row.phase2_row_id);

    if (!PHASE3_DECISION_STATUS.includes(row.decision_status)) errors.push(`${row.row_id}: invalid decision_status ${row.decision_status}`);
    if (!DONALDSON_STATUS.includes(row.donaldson_status)) errors.push(`${row.row_id}: invalid donaldson_status ${row.donaldson_status}`);
    if (JSON.stringify(row.isuzu_oe_oen) !== JSON.stringify(p2.isuzu_oe_oen)) errors.push(`${row.row_id}: isuzu_oe_oen differs from phase2`);
    if (row.filter_position !== p2.filter_position) errors.push(`${row.row_id}: filter_position differs from phase2`);
    const scope = row.oem_scope || {};
    if (scope.series !== p2.series
      || JSON.stringify(scope.model_lines) !== JSON.stringify(p2.applies_to_model_lines)
      || scope.published_year_scope !== p2.isuzu_published_year_scope
      || scope.published_engine_scope !== p2.isuzu_published_engine_scope
      || JSON.stringify(scope.binds_to_phase1) !== JSON.stringify(p2.binds_to_phase1)) {
      errors.push(`${row.row_id}: oem_scope redefines the phase2 fitment`);
    }
    if (row.donaldson_source && !known.has(row.donaldson_source)) errors.push(`${row.row_id}: unknown donaldson_source ${row.donaldson_source}`);
    if (row.donaldson_relationship_type && !RELATIONSHIP_TYPE.includes(row.donaldson_relationship_type)) errors.push(`${row.row_id}: invalid relationship_type`);

    // Donaldson first. Fleetguard only once Donaldson non-manufacture is verified.
    // OEM fallback only after non-manufacture is verified for both Donaldson and Fleetguard.
    if (row.base_source_brand === 'DONALDSON') {
      if (row.donaldson_status !== 'DONALDSON_VERIFIED' || !row.donaldson_part || row.base_source_part !== row.donaldson_part) {
        errors.push(`${row.row_id}: Donaldson base without a verified Donaldson part`);
      }
    } else if (row.base_source_brand === 'FLEETGUARD') {
      if (row.donaldson_status !== 'DONALDSON_NOT_MANUFACTURED_VERIFIED') errors.push(`${row.row_id}: Fleetguard base without verified Donaldson absence`);
      if (row.fleetguard_status !== 'FLEETGUARD_VERIFIED' || !row.fleetguard_part || row.base_source_part !== row.fleetguard_part) {
        errors.push(`${row.row_id}: Fleetguard base without verified Fleetguard manufacturing authority`);
      }
    } else if (row.base_source_brand === 'OEM') {
      const eligibility = evaluateOemFallbackEligibility(row);
      if (!eligibility.eligible) {
        const failed = Object.entries(eligibility.checks).filter(([, ok]) => !ok).map(([key]) => key).join(',');
        errors.push(`${row.row_id}: OEM fallback not eligible (${failed})`);
      }
    } else if (row.base_source_brand != null) {
      errors.push(`${row.row_id}: ${row.base_source_brand} may not define an HD base`);
    }
    if (row.donaldson_status === 'DONALDSON_VERIFIED' && row.base_source_brand !== 'DONALDSON') {
      errors.push(`${row.row_id}: Donaldson manufactures but is not the base`);
    }
    if (row.decision_status === 'VERIFIED_BASE' && (p2.evidence_status !== 'VERIFIED' || row.donaldson_relationship_type !== 'DIRECT_OE_CROSS')) {
      errors.push(`${row.row_id}: VERIFIED_BASE requires a VERIFIED phase2 row and a direct OE cross`);
    }
    if (row.elimfilters_base_decision) {
      if (!row.base_source_brand || row.elimfilters_base_decision.sku !== row.elimfilters_existing_sku) errors.push(`${row.row_id}: base decision without a resolved base or an existing SKU`);
      if (row.elimfilters_base_decision.published !== false) errors.push(`${row.row_id}: base decision must not be published`);
      if (!['VERIFIED_BASE', 'PARTIAL'].includes(row.decision_status)) errors.push(`${row.row_id}: base decision on a ${row.decision_status} row`);
    } else if (['VERIFIED_BASE', 'PARTIAL'].includes(row.decision_status)) {
      errors.push(`${row.row_id}: ${row.decision_status} without a base decision`);
    }
    for (const ref of row.supporting_crossrefs || []) {
      if (!SUPPORTING_BRANDS.includes(ref.manufacturer) || ref.fitment_role !== 'CORROBORATION_ONLY') errors.push(`${row.row_id}: supporting crossref must be corroboration only`);
    }
    if (!(row.caveats || []).length) errors.push(`${row.row_id}: every decision needs an explicit caveat or basis`);
  }

  for (const p2 of eligible) {
    if (!seen.has(p2.row_id)) errors.push(`eligible phase2 row ${p2.row_id} has no phase3 decision`);
  }
  for (const row of phase3.blocked_oem_rows || []) {
    if (row.decision_status !== 'BLOCKED_OEM' || row.base_source_brand || row.elimfilters_base_decision || (row.isuzu_oe_oen || []).length) {
      errors.push(`${row.row_id}: a row without an OEN must stay BLOCKED_OEM with no base`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// PHASE 3 coverage: one line per eligible Phase 2 OEN row, nothing implied.
function phase3CoverageMatrix() {
  return phase2.oen_rows
    .filter((row) => row.evidence_status !== 'NOT_APPLICABLE')
    .map((p2) => {
      const row = resolutionFor(p2.row_id);
      return {
        phase2_row_id: p2.row_id,
        isuzu_oe_oen: p2.isuzu_oe_oen,
        filter_position: p2.filter_position,
        donaldson_status: row ? row.donaldson_status : 'MISSING',
        fleetguard_status: row ? row.fleetguard_status : 'MISSING',
        supporting_refs: row ? (row.supporting_crossrefs || []).length : 0,
        base: row && row.base_source_part ? `${row.base_source_brand} ${row.base_source_part}` : null,
        elimfilters_sku: row ? row.elimfilters_existing_sku : null,
        decision_status: row ? row.decision_status : 'MISSING',
      };
    });
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
    phase3_status: phase3.phase3_status,
    phase3_resolution_rows: (phase3.resolution_rows || []).length,
    phase3_blocked_oem_rows: (phase3.blocked_oem_rows || []).length,
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
  phase2CoverageMatrix,
  phase2CoverageSummary,
  validatePhase3,
  phase3CoverageMatrix,
  resolutionFor,
  PHASE3_DECISION_STATUS,
  DONALDSON_STATUS,
  evaluateOemFallbackEligibility,
};
