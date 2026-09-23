'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  phase1,
  phase2,
  phase3,
  sources,
  parseBinding,
  bindingCoversYear,
  modelsFor,
  answerFilterSetQuery,
  validateClosure,
  coverageReport,
  phase2CoverageMatrix,
  phase2CoverageSummary,
  phase3ResolutionFor,
  phase3CoverageMatrix,
  phase3CoverageSummary,
} = require('../lib/isuzu-us-diesel-closure');

const { resolveIsuzuNSeriesCustomerQuery } = require('../lib/isuzu-n-series-oem-resolver');

test('the closure is structurally valid and every governance invariant holds', () => {
  const result = validateClosure();
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('every model year from 2000 to 2026 has an explicit answer', () => {
  const report = coverageReport();
  assert.equal(report.year_from, 2000);
  assert.equal(report.year_to, 2026);
  for (let year = 2000; year <= 2026; year += 1) {
    assert.ok(report.by_year[year], `model year ${year} missing from the coverage report`);
  }
});

test('no gasoline vehicle leaked into the diesel universe', () => {
  const GASOLINE_ENGINES = /VORTEC|L8T|GMPT|6\.6L|6\.0L/i;

  for (const block of phase1.year_blocks) {
    assert.equal(block.fuel, 'DIESEL', `${block.block_id} is not diesel`);
    if (block.engine_code) {
      assert.ok(!GASOLINE_ENGINES.test(block.engine_code), `${block.block_id} carries a gasoline engine code`);
    }
    if (block.displacement_published) {
      assert.ok(!GASOLINE_ENGINES.test(block.displacement_published), `${block.block_id} carries a gasoline displacement`);
    }
  }

  // The gasoline line is named once, in the exclusion record, which is the
  // evidence that it was seen and deliberately left out.
  assert.match(phase1.governance.gasoline_exclusion_evidence, GASOLINE_ENGINES);
  assert.equal(phase1.governance.gasoline_excluded, true);
  assert.ok(phase1.excluded_from_scope.some((x) => GASOLINE_ENGINES.test(x.subject)));

  // Phase 2 must not attach a gasoline-scoped part number to any vehicle.
  for (const row of phase2.oen_rows) {
    if (/gas/i.test(row.isuzu_published_engine_scope || '') && !/diesel/i.test(row.isuzu_published_engine_scope)) {
      assert.deepEqual(row.binds_to_phase1, [], `${row.row_id} is gasoline-scoped but binds to a vehicle`);
    }
  }
});

test('Phase 2 never cites a non-Isuzu source', () => {
  for (const row of phase2.oen_rows) {
    const src = sources.sources.find((s) => s.source_id === row.source);
    assert.ok(src, `${row.row_id} cites an unknown source`);
    assert.equal(src.publisher, 'Isuzu Commercial Truck of America', `${row.row_id} cites ${src.publisher}`);
  }
});

test('Phase 2 reproduces the published scope and never widens it', () => {
  const nseriesAir2006 = phase2.oen_rows.find((r) => r.row_id === 'P2-N-AIR-2006-ON');
  assert.equal(nseriesAir2006.isuzu_published_year_scope, '2006-');
  assert.ok(!nseriesAir2006.binds_to_phase1.includes('N-2000-2001'));
  assert.ok(!nseriesAir2006.binds_to_phase1.includes('N-2002-2004'));

  const fSeriesLube4hk = phase2.oen_rows.find((r) => r.row_id === 'P2-F-LUBE-2018-2021');
  assert.equal(fSeriesLube4hk.isuzu_published_year_scope, '2018-2021');
  // MY2017 FTR exists in Phase 1 but sits outside the published range.
  assert.ok(!bindingCoversYear(fSeriesLube4hk.binds_to_phase1[0], 'F-2017-2021', 2017));
  assert.ok(bindingCoversYear(fSeriesLube4hk.binds_to_phase1[0], 'F-2017-2021', 2018));
});

test('an engine-scoped row is not attached to a vehicle with a different engine', () => {
  const lube4jj = phase2.oen_rows.find((r) => r.row_id === 'P2-N-LUBE-4JJ');
  assert.equal(lube4jj.isuzu_published_engine_scope, 'Diesel / 4JJ');
  assert.deepEqual(lube4jj.binds_to_phase1, ['N-2011-2018-ECOMAX']);

  const ecomax = phase1.year_blocks.find((b) => b.block_id === 'N-2011-2018-ECOMAX');
  assert.equal(ecomax.engine_code, '4JJ1-TC');

  // The 4HK1-TC blocks of the same model years must not carry the 4JJ row.
  for (const blockId of ['N-2011-2014', 'N-2015-2018']) {
    assert.ok(!lube4jj.binds_to_phase1.includes(blockId));
  }
});

test('rows for engines that no USA vehicle uses are marked NOT_APPLICABLE and bind to nothing', () => {
  for (const rowId of ['P2-N-LUBE-6BG', 'P2-N-LUBE-4BD']) {
    const row = phase2.oen_rows.find((r) => r.row_id === rowId);
    assert.equal(row.evidence_status, 'NOT_APPLICABLE');
    assert.deepEqual(row.binds_to_phase1, []);
  }
});

test('FRR and FXR are in the universe but inherit no filter from the FTR/FVR/FSR section', () => {
  const fxrYears = phase1.year_blocks.find((b) => b.block_id === 'F-2004-2005');
  assert.ok(fxrYears.models.includes('FXR'));
  assert.ok(fxrYears.models.includes('FRR'));

  for (const row of phase2.oen_rows.filter((r) => r.series === 'F-SERIES')) {
    assert.equal(row.isuzu_published_model_scope, 'F-SERIES FTR / FVR / FSR');
  }
  const unresolved = phase2.unresolved_positions.find((u) => u.scope.includes('FRR and FXR'));
  assert.ok(unresolved, 'FRR and FXR must be recorded as unresolved rather than inherited');
});

test('N-Series has no air dryer and F-Series does, and both are stated rather than assumed', () => {
  assert.equal(phase2.position_universe['N-SERIES'].AIR_DRYER.applicable, false);
  assert.equal(phase2.position_universe['N-SERIES'].AIR_DRYER.status, 'NOT_APPLICABLE');
  assert.match(phase2.position_universe['N-SERIES'].AIR_DRYER.basis, /vacuum\/hydraulic|hydraulic-boosted/i);

  assert.equal(phase2.position_universe['F-SERIES'].AIR_DRYER.applicable, true);
  assert.equal(phase2.position_universe['F-SERIES'].AIR_DRYER.status, 'UNRESOLVED');
});

test('Phase 3 is partially resolved, still Donaldson-first, and still honest about what is blocked', () => {
  // Phase 3 was BLOCKED_AT_SOURCE_1 when this test was first written (Donaldson
  // fully inaccessible, zero rows resolved). The 2026-09-23 pass found a usable
  // Donaldson channel for some rows (see PHASE 3.* tests) without weakening any
  // of the invariants this test originally guarded: the canonical rule is still
  // reused unchanged, Donaldson is still first in source_order, engine-level
  // evidence that cannot support a base decision is still recorded as such
  // rather than promoted, and genuinely unresolved items are still carried
  // forward rather than disappearing.
  assert.equal(phase3.outcome, 'PARTIALLY_RESOLVED');
  assert.ok(phase3.resolution_rows.length > 0);
  assert.equal(phase3.canonical_hd_rule, 'DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD');
  assert.equal(phase3.source_order[0], 'DONALDSON');
  assert.equal(phase3.source_order[1], 'FLEETGUARD');
  assert.ok(phase3.unresolved_aftermarket.length > 0);
  assert.equal(phase3.engine_level_donaldson_evidence.status, 'RECORDED_BUT_NOT_USABLE_FOR_A_BASE_DECISION');
});

test('bindings parse, including the narrowed forms', () => {
  assert.deepEqual(parseBinding('N-2005-2010'), { blockId: 'N-2005-2010', years: null });
  assert.deepEqual(parseBinding('F-2004-2005(2004 only)'), { blockId: 'F-2004-2005', years: [2004] });
  assert.deepEqual(parseBinding('N-2005-2010(2006-2010)').years, [2006, 2007, 2008, 2009, 2010]);
});

test('the closure answers the question it exists to answer', () => {
  const answer = answerFilterSetQuery({ year: 2019, model: 'NPR-HD' });
  assert.equal(answer.status, 'ANSWERED');
  assert.equal(answer.answers.length, 1);

  const vehicle = answer.answers[0];
  assert.equal(vehicle.series, 'N-SERIES');
  assert.equal(vehicle.engine_code, '4HK1-TC');
  assert.equal(vehicle.vehicle_evidence_status, 'VERIFIED');

  const byPosition = Object.fromEntries(vehicle.positions.map((p) => [p.position, p]));

  // Closed with a real Isuzu number.
  assert.equal(byPosition.AIR_PRIMARY.status, 'VERIFIED');
  assert.ok(byPosition.AIR_PRIMARY.isuzu_oe_oen.includes('8981772710'));

  // Positions this truck does not have come back explicitly.
  assert.equal(byPosition.AIR_SECONDARY.status, 'NOT_APPLICABLE');
  assert.equal(byPosition.AIR_DRYER.status, 'NOT_APPLICABLE');
  assert.equal(byPosition.HYDRAULIC_FILTER.status, 'NOT_APPLICABLE');

  // Positions that exist but are not closed say so instead of going missing.
  assert.equal(byPosition.CABIN.status, 'UNRESOLVED');

  // A position Phase 2 never closed (no matched isuzu_oe_oen row) can never
  // claim a Phase 3 aftermarket answer, whatever Phase 3 itself later
  // resolved elsewhere -- it comes back null, not a placeholder object.
  assert.equal(byPosition.CABIN.aftermarket, null);

  // AIR_PRIMARY, by contrast, IS Phase-2-VERIFIED for this vehicle and now
  // also has a real Phase 3 resolution (P2-N-AIR-2006-ON / P3-N-AIR-2006-ON),
  // so its aftermarket answer must be the genuine one, not a placeholder.
  assert.equal(byPosition.AIR_PRIMARY.aftermarket.status, 'VERIFIED_BASE');
  assert.equal(byPosition.AIR_PRIMARY.aftermarket.base_source_brand, 'DONALDSON');
  assert.equal(byPosition.AIR_PRIMARY.aftermarket.elimfilters_existing_sku, 'EA13614');
});

test('FXR and FRR answer empty even though they share a block and an engine with FTR', () => {
  const ftr = answerFilterSetQuery({ year: 2007, model: 'FTR' }).answers[0];
  const fxr = answerFilterSetQuery({ year: 2007, model: 'FXR' }).answers[0];
  const frr = answerFilterSetQuery({ year: 2005, model: 'FRR' }).answers[0];

  // Same block, same 6HK1-TC.
  assert.equal(ftr.engine_code, '6HK1-TC');
  assert.equal(fxr.engine_code, '6HK1-TC');
  assert.equal(ftr.block_id, fxr.block_id);

  const lubeOf = (v) => v.positions.find((p) => p.position === 'LUBE_PRIMARY');
  assert.equal(lubeOf(ftr).status, 'PARTIAL');
  assert.ok(lubeOf(ftr).isuzu_oe_oen.length > 0);

  // Isuzu's section heading names FTR / FVR / FSR. FXR and FRR are separate
  // model lines and must come back with nothing rather than inherit.
  assert.equal(lubeOf(fxr).status, 'UNRESOLVED');
  assert.deepEqual(lubeOf(fxr).isuzu_oe_oen, []);
  assert.equal(lubeOf(frr).status, 'UNRESOLVED');
  assert.deepEqual(lubeOf(frr).isuzu_oe_oen, []);
});

test('a suffix variant does resolve through its own model line', () => {
  const derate = answerFilterSetQuery({ year: 2026, model: 'NRR DERATE' }).answers[0];
  const separator = derate.positions.find((p) => p.position === 'FUEL_WATER_SEPARATOR');
  assert.equal(separator.status, 'VERIFIED');
  assert.ok(separator.isuzu_oe_oen.includes('8982373410'));

  const hd = answerFilterSetQuery({ year: 2019, model: 'NPR-HD' }).answers[0];
  assert.equal(hd.positions.find((p) => p.position === 'AIR_PRIMARY').status, 'VERIFIED');
});

test('the DPF is reported as informational, not as a filter-set position', () => {
  const vehicle = answerFilterSetQuery({ year: 2019, model: 'NPR-HD' }).answers[0];
  assert.ok(!vehicle.positions.some((p) => p.position === 'DPF'));
  const dpf = vehicle.informational.find((i) => i.position === 'DPF');
  assert.ok(dpf, 'the DPF must still be reported');
  assert.match(dpf.service, /100,000 miles/);
});

test('a 2011-2018 NPR answers on the 3.0L, not on the 5.2L', () => {
  const answer = answerFilterSetQuery({ year: 2015, model: 'NPR' });
  assert.equal(answer.status, 'ANSWERED');
  assert.equal(answer.answers.length, 1);
  assert.equal(answer.answers[0].engine_code, '4JJ1-TC');

  const lube = answer.answers[0].positions.find((p) => p.position === 'LUBE_PRIMARY');
  assert.ok(lube.isuzu_oe_oen.includes('8980188580'));
  // The 4HK1-TC lube number must not appear on this vehicle.
  assert.ok(!lube.isuzu_oe_oen.includes('8982984040'));
});

test('a model year with no F-Series reports absence rather than a gap', () => {
  const block = phase1.year_blocks.find((b) => b.block_id === 'F-2011-2016-ABSENT');
  assert.deepEqual(block.models, []);
  for (const year of block.model_years) {
    assert.equal(block.evidence_status[String(year)], 'VERIFIED_ABSENT');
  }
  assert.ok(!modelsFor(2013).some((m) => m.series === 'F-SERIES'));
});

test('the conflicts that were found are recorded, with their final resolution', () => {
  const ids = phase1.conflicts.map((c) => c.conflict_id);
  assert.ok(ids.includes('CONF-NRR-2004'));
  assert.ok(ids.includes('CONF-FVR-2020'));

  // CLOSURE PASS 2026-09-23: CONF-NRR-2004 was resolved in favour of Isuzu's
  // own site-navigation evidence (NRR added to n_specs.html nav between the
  // 2003-12-09 and 2004-04-11 captures) rather than left open. The conflict
  // record itself must still exist and explain the resolution -- it is never
  // deleted, only closed.
  const nrrConflict = phase1.conflicts.find((c) => c.conflict_id === 'CONF-NRR-2004');
  assert.match(nrrConflict.resolution, /RESOLVED in favour of Isuzu/);
  assert.match(nrrConflict.resolution, /VERIFIED/);

  const nrr2004 = phase1.year_blocks.find((b) => b.block_id === 'N-2004-NRR');
  assert.equal(nrr2004.evidence_status['2004'], 'VERIFIED');
  assert.equal(nrr2004.conflict_id, 'CONF-NRR-2004');
});

test('the extended N-Series matrix keeps the existing resolver contract', () => {
  // The three behaviours the bot already depends on, re-checked against 2000-2026 data.
  const ambiguous = resolveIsuzuNSeriesCustomerQuery({ year: 2022, model: 'NPR', engine: '5.2L' });
  assert.equal(ambiguous.status, 'NEEDS_MODEL_VARIANT');

  const exact = resolveIsuzuNSeriesCustomerQuery({ year: 2022, model: 'NPR-HD', engine: '5.2L' });
  assert.equal(exact.status, 'OEM_IDENTITY_CLOSED');

  const gas = resolveIsuzuNSeriesCustomerQuery({ year: 2023, model: 'NPR', engine: '6.6L' });
  assert.equal(gas.status, 'OEM_IDENTITY_CLOSED');
  assert.equal(gas.candidates[0].fuel, 'GASOLINE');
});

test('the resolver now closes the years the extension added', () => {
  const ecomax = resolveIsuzuNSeriesCustomerQuery({ year: 2015, model: 'NPR', engine: '3.0L' });
  assert.equal(ecomax.status, 'OEM_IDENTITY_CLOSED');
  assert.equal(ecomax.candidates[0].engine_displacement, '3.0L');
  assert.equal(ecomax.candidates[0].fuel, 'DIESEL');

  const early = resolveIsuzuNSeriesCustomerQuery({ year: 2003, model: 'NQR', engine: 'diesel' });
  assert.equal(early.status, 'OEM_IDENTITY_CLOSED');
  assert.equal(early.candidates[0].engine_family, '4HE1-TC');

  // Outside the closed range nothing is invented.
  const before = resolveIsuzuNSeriesCustomerQuery({ year: 1999, model: 'NPR', engine: 'diesel' });
  assert.equal(before.status, 'OEM_YEAR_NOT_CLOSED');
});

// ---------------------------------------------------------------------------
// PHASE 1 CLOSURE PASS (2026-09-23) -- mandatory validations.
//
// These ten tests are the explicit closure gate requested for this pass: the
// closure task named exactly these ten conditions and required each to be
// demonstrated by test before Phase 1 could be declared officially CLOSED.
// ---------------------------------------------------------------------------

test('CLOSURE 1: no PARTIAL status remains anywhere in Phase 1', () => {
  for (const block of phase1.year_blocks) {
    for (const [year, status] of Object.entries(block.evidence_status)) {
      assert.notEqual(status, 'PARTIAL', `${block.block_id} ${year} is still PARTIAL`);
    }
  }
});

test('CLOSURE 2: no UNRESOLVED status remains anywhere in Phase 1', () => {
  for (const block of phase1.year_blocks) {
    for (const [year, status] of Object.entries(block.evidence_status)) {
      assert.notEqual(status, 'UNRESOLVED', `${block.block_id} ${year} is still UNRESOLVED`);
    }
  }
});

test('CLOSURE 3: no CONFLICTING status remains anywhere in Phase 1', () => {
  for (const block of phase1.year_blocks) {
    for (const [year, status] of Object.entries(block.evidence_status)) {
      assert.notEqual(status, 'CONFLICTING', `${block.block_id} ${year} is still CONFLICTING`);
    }
  }
  // Every declared status must be one of the two terminal "closed" states.
  for (const block of phase1.year_blocks) {
    for (const status of Object.values(block.evidence_status)) {
      assert.ok(['VERIFIED', 'VERIFIED_ABSENT'].includes(status), `${block.block_id} has non-terminal status ${status}`);
    }
  }
});

test('CLOSURE 4: every open_discovery_item is in a terminal state', () => {
  const TERMINAL = ['VERIFIED', 'VERIFIED_ABSENT', 'CLOSED_NOT_FOUND'];
  assert.ok(phase1.open_discovery_items.length > 0, 'expected discovery items to still be listed, with terminal status, not deleted');
  for (const item of phase1.open_discovery_items) {
    assert.ok(TERMINAL.includes(item.status), `${item.item} has non-terminal status ${item.status}`);
    assert.ok(item.resolution && item.resolution.length > 20, `${item.item} has no documented resolution`);
  }
});

test('CLOSURE 5: gasoline remains excluded after the closure pass', () => {
  for (const block of phase1.year_blocks) {
    assert.equal(block.fuel, 'DIESEL', `${block.block_id} is not diesel`);
  }
  assert.equal(phase1.governance.gasoline_excluded, true);
});

test('CLOSURE 6: no aftermarket source was used to define or close any Phase 1 case', () => {
  const AFTERMARKET = /donaldson|fleetguard|mann-filter|baldwin|\bwix\b|\bfram\b/i;
  for (const block of phase1.year_blocks) {
    for (const id of [...(block.evidence || []), ...(block.corroboration || [])]) {
      const src = sources.sources.find((s) => s.source_id === id);
      assert.ok(src, `${block.block_id} cites unknown source ${id}`);
      assert.ok(!AFTERMARKET.test(src.publisher), `${block.block_id} cites aftermarket publisher ${src.publisher} via ${id}`);
    }
  }
  // Phase 1 evidence entries must all be Isuzu primary or the one named
  // secondary-tier corroboration source (NHTSA); nothing else is permitted
  // to appear in a block's own evidence/corroboration arrays.
  const allowedCorroboration = new Set(sources.source_policy.corroboration_only);
  for (const block of phase1.year_blocks) {
    for (const id of block.evidence || []) {
      const src = sources.sources.find((s) => s.source_id === id);
      assert.equal(src.publisher, sources.source_policy.phase_1_and_2_defining_publisher, `${block.block_id} evidence[] contains non-Isuzu source ${id}`);
    }
    for (const id of block.corroboration || []) {
      const src = sources.sources.find((s) => s.source_id === id);
      assert.ok(allowedCorroboration.has(src.publisher), `${block.block_id} corroboration[] contains unlisted publisher ${src.publisher}`);
    }
  }
});

test('CLOSURE 7: no year was inherited from an adjacent year by continuity', () => {
  // Every case this pass closed must cite a source captured/dated inside the
  // model year it closes, not merely a neighbouring year's document. This
  // guards specifically against the four inheritance patterns the closure
  // task explicitly prohibited: 2000->2001, 2013->2014, 2019/2020->2021,
  // 2017/2019->2018.
  const capturedInsideYear = (sourceId, year) => {
    const src = sources.sources.find((s) => s.source_id === sourceId);
    if (!src || !src.captured_at) return false;
    return String(src.captured_at).startsWith(String(year));
  };

  const npr2001 = phase1.year_blocks.find((b) => b.block_id === 'N-2000-2001');
  assert.ok(npr2001.evidence.some((id) => capturedInsideYear(id, 2001)), 'MY2001 NPR/NPR-HD must cite a source dated inside 2001');

  const nqr = phase1.year_blocks.find((b) => b.block_id === 'N-2000-2001-NQR');
  assert.ok(nqr.evidence.some((id) => capturedInsideYear(id, 2000)), 'MY2000 NQR must cite a source dated inside 2000');
  assert.ok(nqr.evidence.some((id) => capturedInsideYear(id, 2001)), 'MY2001 NQR must cite a source dated inside 2001');

  const my2014a = phase1.year_blocks.find((b) => b.block_id === 'N-2011-2014');
  assert.ok(my2014a.evidence.some((id) => capturedInsideYear(id, 2014)), 'MY2014 N-2011-2014 must cite a source dated inside 2014');

  const my2014b = phase1.year_blocks.find((b) => b.block_id === 'N-2011-2018-ECOMAX');
  assert.ok(my2014b.evidence.some((id) => capturedInsideYear(id, 2014)), 'MY2014 ECO-MAX must cite a source dated inside 2014');

  const my2021 = phase1.year_blocks.find((b) => b.block_id === 'N-2019-2021');
  assert.ok(my2021.evidence.some((id) => capturedInsideYear(id, 2020) || capturedInsideYear(id, 2021)), 'MY2021 N-Series must cite a source dated inside the MY2021 selling window (captured late 2020 or in 2021)');

  const ftr2018 = phase1.year_blocks.find((b) => b.block_id === 'F-2017-2021');
  assert.ok(ftr2018.evidence.some((id) => capturedInsideYear(id, 2018)), 'MY2018 FTR must cite a source dated inside 2018');
});

test('CLOSURE 8: no non-USA / global-market model was introduced without Isuzu USA evidence', () => {
  // Every block's evidence must trace back only to isuzucv.com (Isuzu
  // Commercial Truck of America's own USA domain), never a global/regional
  // Isuzu site or an aftermarket catalogue's non-USA model column.
  for (const block of phase1.year_blocks) {
    for (const id of block.evidence || []) {
      const src = sources.sources.find((s) => s.source_id === id);
      assert.match(src.origin_url, /isuzucv\.com/, `${block.block_id} evidence ${id} does not originate from isuzucv.com`);
    }
  }
  // The one non-USA document in the source file (the Donaldson Australasia
  // catalogue) must never be cited as evidence for a Phase 1 vehicle block.
  const referencedEverywhere = new Set(phase1.year_blocks.flatMap((b) => [...(b.evidence || []), ...(b.corroboration || [])]));
  assert.ok(!referencedEverywhere.has('DONALDSON_TRUCK_SERVICE_KITS_AU'), 'the non-USA Donaldson catalogue must not be used to define the Phase 1 vehicle universe');
});

test('CLOSURE 9: H-Series is explicitly included, with exact years, models and engine', () => {
  const hSeries = phase1.year_blocks.find((b) => b.series === 'H-SERIES');
  assert.ok(hSeries, 'H-Series must be incorporated into year_blocks, not left as a discovery item only');
  assert.deepEqual(hSeries.models.slice().sort(), ['HTR', 'HVR', 'HXR']);
  assert.equal(hSeries.engine_code, '6HK1-TC');
  assert.equal(hSeries.displacement_published, '7.8 L');
  assert.deepEqual(hSeries.model_years, [2005, 2006, 2007, 2008]);
  for (const status of Object.values(hSeries.evidence_status)) assert.equal(status, 'VERIFIED');

  const item = phase1.open_discovery_items.find((d) => d.item === 'H-SERIES');
  assert.equal(item.status, 'VERIFIED');
});

test('CLOSURE 10: FBR is explicitly closed as CLOSED_NOT_FOUND', () => {
  const item = phase1.open_discovery_items.find((d) => d.item === 'FBR');
  assert.ok(item, 'FBR must still be tracked as a discovery item with a terminal disposition');
  assert.equal(item.status, 'CLOSED_NOT_FOUND');
  assert.ok(!phase1.year_blocks.some((b) => (b.models || []).includes('FBR')), 'FBR must not appear as an included model without evidence');
});

test('CLOSURE FINAL: phase_status is CLOSED and the history records why', () => {
  assert.equal(phase1.phase_status, 'CLOSED');
  assert.ok(Array.isArray(phase1.phase_status_history) && phase1.phase_status_history.length >= 2);
  const finalEntry = phase1.phase_status_history[phase1.phase_status_history.length - 1];
  assert.equal(finalEntry.phase_status, 'CLOSED');
});

// ---------------------------------------------------------------------------
// PHASE 1 TECHNICAL QUALIFIER CLOSURE (2026-09-23) -- follow-up micro-pass.
//
// Scope: eliminate or explicitly document the two remaining technical
// qualifiers (NRR MY2004's model-year label, NPR-HD/NRR MY2021's direct
// document) that VERIFIED status alone did not capture. Phase 1's own
// VERIFIED/PARTIAL/UNRESOLVED/CONFLICTING statuses are unchanged by this
// pass -- only the qualifier layer is added or resolved.
// ---------------------------------------------------------------------------

test('QUALIFIER 1: NRR MY2004 has explicit model-year evidence, or an explicit documented qualifier', () => {
  const nrr2004 = phase1.year_blocks.find((b) => b.block_id === 'N-2004-NRR');
  assert.equal(nrr2004.evidence_status['2004'], 'VERIFIED');

  const q = nrr2004.technical_qualifier;
  assert.ok(q, 'NRR MY2004 must carry an explicit technical_qualifier record');
  assert.equal(q.status, 'QUALIFIED_CLOSED');
  assert.match(q['search_pass_2026-09-23'], /CARB/);
  assert.match(q['search_pass_2026-09-23'], /Executive Order/);
  assert.ok(q.disposition && q.disposition.length > 20, 'the qualifier must state its disposition, not just its question');
});

test('QUALIFIER 2: NPR-HD MY2021 has direct engine-code evidence, or an explicit documented qualifier', () => {
  const block = phase1.year_blocks.find((b) => b.block_id === 'N-2019-2021');
  assert.equal(block.evidence_status['2021'], 'VERIFIED');

  const q = block.technical_qualifier;
  assert.ok(q, 'the N-2019-2021 block must carry an explicit technical_qualifier for NPR-HD');
  assert.equal(q.id, 'QUAL-NPRHD-MY2021-DIRECT-DOCUMENT');
  assert.equal(q.status, 'QUALIFIED_CLOSED');
  assert.ok(Array.isArray(q.archived_timestamps_checked) && q.archived_timestamps_checked.length >= 5, 'must document every memento checked');
  assert.match(q.truncation_behaviour, /truncated/i);
  assert.match(q.verification_methods.join(','), /curl/i);
  assert.match(q.verification_methods.join(','), /PowerShell/i);
  assert.match(q.verification_methods.join(','), /Python/i);
});

test('QUALIFIER 3: NRR MY2021 now has direct engine-code evidence from its own document, not sibling-only', () => {
  const block = phase1.year_blocks.find((b) => b.block_id === 'N-2019-2021');
  assert.ok(block.evidence.includes('ISUZU_NRR_CREW_SPECS_RECOVERED_2019JUN'), 'NRR MY2021 must cite its own recovered document, not just NPR-XD/NQR siblings');

  const src = sources.sources.find((s) => s.source_id === 'ISUZU_NRR_CREW_SPECS_RECOVERED_2019JUN');
  assert.ok(src, 'the recovered NRR source must be registered in sources.json');
  assert.equal(src.publisher, 'Isuzu Commercial Truck of America');
  assert.ok(src.supports.some((s) => /4HK1-TC/.test(s)), 'the recovered document must itself print the engine code');
  assert.ok(src.supports.some((s) => /19,500\/25,500/.test(s)), "the recovered document must itself carry NRR's own GVWR/GCWR, confirming it is NRR's document and not a substitution");

  // NPR-HD must not silently acquire its own "recovered" source the way NRR
  // just did, without the qualifier being updated too.
  assert.ok(!block.evidence.some((id) => /NPRHD.*RECOVERED|NPR_HD.*RECOVERED/i.test(id)), 'NPR-HD has no recovered direct source; its qualifier must remain in force');
});

test('QUALIFIER GOVERNANCE: no aftermarket source was introduced while closing these qualifiers', () => {
  const AFTERMARKET = /donaldson|fleetguard|mann-filter|baldwin|\bwix\b|\bfram\b/i;
  const nrr2004 = phase1.year_blocks.find((b) => b.block_id === 'N-2004-NRR');
  const block2021 = phase1.year_blocks.find((b) => b.block_id === 'N-2019-2021');
  for (const block of [nrr2004, block2021]) {
    for (const id of [...(block.evidence || []), ...(block.corroboration || [])]) {
      const src = sources.sources.find((s) => s.source_id === id);
      assert.ok(src, `${block.block_id} cites unknown source ${id}`);
      assert.ok(!AFTERMARKET.test(src.publisher), `${block.block_id} cites aftermarket publisher ${src.publisher}`);
    }
  }
  // The CARB Executive Order researched for the NRR MY2004 qualifier is
  // deliberately NOT a registered source and NOT cited from evidence[] or
  // corroboration[] -- it is government regulatory material, not Isuzu and
  // not the one named NHTSA corroboration source, and it was inconclusive.
  // It must only ever appear as descriptive text inside the qualifier, never
  // as if it were formal evidence.
  for (const src of sources.sources) {
    if (/CARB|Air Resources Board/i.test(src.publisher || '')) {
      assert.fail(`a CARB source ${src.source_id} was registered as formal evidence; it must remain qualifier-only prose`);
    }
  }
});

test('QUALIFIER GOVERNANCE: the qualifier pass did not inherit a year by continuity', () => {
  // The NRR MY2021 recovery must be dated to a capture whose own
  // Last-Modified fingerprint places it inside (or provably unchanged
  // through) the MY2021 window -- not simply borrowed from an adjacent
  // model year's document.
  const src = sources.sources.find((s) => s.source_id === 'ISUZU_NRR_CREW_SPECS_RECOVERED_2019JUN');
  assert.match(src.note, /Last-Modified/);
  assert.match(src.note, /byte-identical|identical file/);
  assert.match(src.note, /2020-11-27/);
});

test('QUALIFIER GOVERNANCE: sibling-model evidence was not used as a silent substitute once direct evidence existed', () => {
  // Before this pass, NRR MY2021 evidence rested only on NPR-XD/NQR sibling
  // documents (per the prior status_note). After this pass, NRR must cite
  // its OWN document explicitly, and the block's prose must no longer claim
  // NRR itself is closed on sibling evidence.
  const block = phase1.year_blocks.find((b) => b.block_id === 'N-2019-2021');
  assert.doesNotMatch(
    block.status_note,
    /NRR MY2021 are closed VERIFIED on:.*sibling/s,
    'the status_note must not describe NRR as resting on sibling evidence now that its own document was recovered',
  );
  assert.match(block.status_note, /NPR-HD only/);
});

// ---------------------------------------------------------------------------
// PHASE 2 -- ISUZU USA DIESEL OEM FILTER / OEN CLOSURE (2026-09-23).
//
// Scope: close, for every Phase 1 vehicle (now including H-Series), the
// filter-position matrix on top of the already-CLOSED Phase 1 universe.
// Phase 3 is not touched. Aftermarket is not consulted. The 15 validations
// below are the ones the task named explicitly.
// ---------------------------------------------------------------------------

test('PHASE 2.1: every Phase 1 vehicle maps into the Phase 2 coverage matrix', () => {
  const matrix = phase2CoverageMatrix();
  const matrixVehicles = new Set(matrix.map((r) => `${r.year}|${r.series}|${r.model}`));

  let phase1VehicleCount = 0;
  for (let year = phase1.year_from; year <= phase1.year_to; year += 1) {
    for (const entry of modelsFor(year)) {
      phase1VehicleCount += 1;
      const key = `${year}|${entry.series}|${entry.model}`;
      assert.ok(matrixVehicles.has(key), `Phase 1 vehicle ${key} has no Phase 2 coverage matrix entry`);
    }
  }
  assert.equal(matrixVehicles.size, phase1VehicleCount, 'the matrix must cover exactly the Phase 1 vehicle set, no more and no fewer');
});

test('PHASE 2.2: H-Series is represented, with all three models and the full position set', () => {
  assert.ok(phase2.position_universe['H-SERIES'], 'phase2.position_universe must define H-SERIES');
  const hPositions = Object.keys(phase2.position_universe['H-SERIES']).filter((k) => k !== 'derivation_note');
  for (const required of ['AIR_PRIMARY', 'LUBE_PRIMARY', 'FUEL_PRIMARY', 'CABIN', 'AIR_DRYER', 'TRANSMISSION_FILTER', 'HYDRAULIC_FILTER']) {
    assert.ok(hPositions.includes(required), `H-SERIES position_universe is missing ${required}`);
  }

  const matrix = phase2CoverageMatrix();
  for (const model of ['HTR', 'HVR', 'HXR']) {
    const rows = matrix.filter((r) => r.series === 'H-SERIES' && r.model === model);
    assert.ok(rows.length > 0, `${model} has no coverage matrix rows`);
    const years = new Set(rows.map((r) => r.year));
    for (const y of [2005, 2006, 2007, 2008]) assert.ok(years.has(y), `${model} MY${y} missing from coverage matrix`);
  }
});

test('PHASE 2.3: no gasoline vehicle or gasoline-scoped row appears in Phase 2', () => {
  assert.equal(phase2.fuel_scope, 'DIESEL_ONLY');
  for (const row of phase2.oen_rows) {
    // Rows scoped to "Diesel/GAS" or similar are the FleetValue catalogue's
    // own combined listing (it does not split diesel and gas parts), not a
    // gasoline-only row, and are already recorded as such throughout Phase 2.
    // A row must never be scoped to GAS alone.
    assert.ok(!/^gas$/i.test(String(row.isuzu_published_engine_scope || '').trim()), `${row.row_id} is scoped to GAS alone`);
  }
});

test('PHASE 2.4: no aftermarket source defines any Phase 2 position, including the new H-Series and gap notes', () => {
  const AFTERMARKET = /donaldson|fleetguard|mann-filter|baldwin|\bwix\b|\bfram\b/i;
  for (const row of phase2.oen_rows) {
    const src = sources.sources.find((s) => s.source_id === row.source);
    assert.ok(src, `${row.row_id} cites unknown source ${row.source}`);
    assert.equal(src.publisher, 'Isuzu Commercial Truck of America', `${row.row_id} cites non-Isuzu publisher ${src.publisher}`);
    assert.ok(!AFTERMARKET.test(src.publisher), `${row.row_id} cites aftermarket publisher ${src.publisher}`);
  }
  // The retailer/marketplace research leads noted in unresolved_positions and
  // in the H-SERIES/Cummins governance notes must stay prose-only -- never a
  // row.source, never an isuzu_oe_oen entry copied from them.
  const serialized = JSON.stringify(phase2.oen_rows);
  assert.ok(!/ebay|amazon|walmart|nkrdieselparts|crossfilters|dieselhub|partsgeek/i.test(serialized), 'a retailer name leaked into a formal oen_row');
});

test('PHASE 2.5: no model-to-model inheritance -- FRR, FXR and every H-Series model answer empty or independently', () => {
  const ftr2007 = answerFilterSetQuery({ year: 2007, model: 'FTR' }).answers[0];
  const fxr2007 = answerFilterSetQuery({ year: 2007, model: 'FXR' }).answers[0];
  const lubeOf = (v) => v.positions.find((p) => p.position === 'LUBE_PRIMARY');
  assert.ok(lubeOf(ftr2007).isuzu_oe_oen.length > 0, 'sanity: FTR must have its own lube evidence to make this a real test');
  assert.deepEqual(lubeOf(fxr2007).isuzu_oe_oen, [], 'FXR must not inherit FTR lube filter evidence');

  // No H-Series model may cite an F-Series oen_row (checked structurally: no
  // oen_row tagged H-SERIES exists at all yet, and no F-SERIES row's
  // applies_to_model_lines includes an H-Series model name).
  for (const row of phase2.oen_rows.filter((r) => r.series === 'F-SERIES')) {
    for (const line of row.applies_to_model_lines) {
      assert.ok(!['HTR', 'HVR', 'HXR'].includes(line), `${row.row_id} claims an H-Series model line despite being an F-SERIES row`);
    }
  }
  const htr2005 = answerFilterSetQuery({ year: 2005, model: 'HTR' }).answers[0];
  assert.deepEqual(lubeOf(htr2005).isuzu_oe_oen, [], 'HTR must not inherit any F-Series lube filter evidence via the shared 6HK1-TC engine');
});

test('PHASE 2.6: engine-scoped rows do not leak to a different engine', () => {
  // The 4JJ-scoped lube row must never answer for a 4HK1-TC vehicle, and vice
  // versa, even though both are "N-SERIES ... Diesel" rows on the same page.
  const ecomax2015 = answerFilterSetQuery({ year: 2015, model: 'NPR' }).answers[0]; // 4JJ1-TC
  const nprhd2015 = answerFilterSetQuery({ year: 2015, model: 'NPR-HD' }).answers[0]; // 4HK1-TC
  assert.equal(ecomax2015.engine_code, '4JJ1-TC');
  assert.equal(nprhd2015.engine_code, '4HK1-TC');

  const lubeOf = (v) => v.positions.find((p) => p.position === 'LUBE_PRIMARY');
  assert.ok(lubeOf(ecomax2015).isuzu_oe_oen.includes('8980188580'), 'ECO-MAX must get its own 4JJ lube number');
  assert.ok(!lubeOf(ecomax2015).isuzu_oe_oen.includes('8982984040'), 'ECO-MAX must not receive the 4HK1-TC lube number');
  assert.ok(lubeOf(nprhd2015).isuzu_oe_oen.includes('8982984040'), 'NPR-HD must get the 4HK1-TC lube number');
  assert.ok(!lubeOf(nprhd2015).isuzu_oe_oen.includes('8980188580'), 'NPR-HD must not receive the 4JJ lube number');
});

test('PHASE 2.7: every position returns a real, non-missing state for every vehicle', () => {
  const matrix = phase2CoverageMatrix();
  assert.ok(matrix.length > 0);
  for (const cell of matrix) {
    assert.ok(cell.position === null || typeof cell.position === 'string', `cell for ${cell.year} ${cell.model} has a malformed position`);
    assert.ok(['VERIFIED', 'PARTIAL', 'UNRESOLVED', 'NOT_APPLICABLE', 'CONFLICTING'].includes(cell.status), `cell for ${cell.year} ${cell.model} ${cell.position} has invalid status ${cell.status}`);
  }
});

test('PHASE 2.8: every NOT_APPLICABLE position carries a stated basis', () => {
  for (const [series, universe] of Object.entries(phase2.position_universe)) {
    for (const [position, def] of Object.entries(universe)) {
      if (position === 'derivation' || position === 'derivation_note') continue;
      if (def.applicable === false) {
        assert.ok(def.basis && def.basis.length > 10, `${series}.${position} is NOT_APPLICABLE but has no basis`);
      }
    }
  }
  const matrix = phase2CoverageMatrix();
  for (const cell of matrix.filter((c) => c.status === 'NOT_APPLICABLE')) {
    assert.ok(cell.basis && cell.basis.length > 5, `NOT_APPLICABLE cell ${cell.year} ${cell.model} ${cell.position} has no basis`);
  }
});

test('PHASE 2.9: every OEN row cites a real, registered Isuzu source', () => {
  const known = new Set(sources.sources.map((s) => s.source_id));
  for (const row of phase2.oen_rows) {
    assert.ok(known.has(row.source), `${row.row_id} cites unregistered source ${row.source}`);
    assert.ok(Array.isArray(row.isuzu_oe_oen) && row.isuzu_oe_oen.length > 0, `${row.row_id} has no isuzu_oe_oen`);
  }
});

test('PHASE 2.10: every binding points to an existing Phase 1 block', () => {
  const blockIds = new Set(phase1.year_blocks.map((b) => b.block_id));
  for (const row of phase2.oen_rows) {
    for (const binding of row.binds_to_phase1 || []) {
      const parsed = parseBinding(binding);
      assert.ok(parsed, `${row.row_id} has an unparseable binding ${binding}`);
      assert.ok(blockIds.has(parsed.blockId), `${row.row_id} binds to unknown Phase 1 block ${parsed.blockId}`);
    }
  }
});

test('PHASE 2.11: FRR, FXR and every H-Series model are explicitly documented as unresolved rather than silently inheriting from FTR', () => {
  const frrFxrEntry = phase2.unresolved_positions.find((u) => u.scope.includes('FRR and FXR'));
  assert.ok(frrFxrEntry, 'FRR/FXR must be recorded in unresolved_positions');
  assert.match(frrFxrEntry.reason, /FTR.*FVR.*FSR/);

  const hSeriesEntry = phase2.unresolved_positions.find((u) => u.scope.includes('H-SERIES'));
  assert.ok(hSeriesEntry, 'H-Series must be recorded in unresolved_positions');
  assert.match(hSeriesEntry.reason, /no owner's manual|exhaustive search/i);
  assert.match(hSeriesEntry.reason, /prohibited|inherit/i);
  assert.match(hSeriesEntry.closing_note, /terminal state|silently omitted/i);
});

test('PHASE 2.12: any Cummins B6.7 reference, if present, would have to be marked OEM-authoritative -- and none was smuggled in without that marker', () => {
  const cumminsRule = phase2.governance.cummins_b67_rule;
  assert.ok(cumminsRule, 'governance.cummins_b67_rule must exist');
  assert.match(cumminsRule, /Cummins official/);
  assert.match(cumminsRule, /Fleetguard is explicitly excluded/);

  // No oen_row for the B6.7 F-Series exists yet (still UNRESOLVED); if one is
  // ever added it must cite a source whose source_type marks it as an
  // official Cummins document, never a generic/aftermarket one.
  const b67Rows = phase2.oen_rows.filter((r) => /cummins|b6\.7/i.test(r.isuzu_published_engine_scope || ''));
  for (const row of b67Rows) {
    const src = sources.sources.find((s) => s.source_id === row.source);
    assert.match(src.source_type, /official/i, `${row.row_id} cites a non-official source for the Cummins B6.7`);
  }
  const cumminsEntry = phase2.unresolved_positions.find((u) => u.scope.includes('Cummins B6.7'));
  assert.ok(cumminsEntry, 'Cummins B6.7 must be recorded in unresolved_positions');
});

test('PHASE 2.13: filter elements, assemblies and kits are not conflated in their own descriptions', () => {
  for (const row of phase2.oen_rows) {
    const desc = row.isuzu_part_description || '';
    // A row whose own Isuzu description says ELEMENT or KIT must not silently
    // masquerade as a plain "FILTER" (assembly) row elsewhere with the same
    // row_id semantics reused -- each row's description is trusted verbatim
    // and must be internally consistent with itself (this is a structural
    // sanity check, not a rewrite of Isuzu's own wording).
    if (/\bELEMENT\b/i.test(desc)) {
      assert.ok(!/\bASSEMBLY\b/i.test(desc), `${row.row_id} description conflates ELEMENT and ASSEMBLY: "${desc}"`);
    }
  }
});

test('PHASE 2.14: the two anomalous-format OEN rows remain explicitly flagged, not silently normalized', () => {
  const rows = phase2.oen_rows.filter((r) => r.row_id === 'P2-N-LUBE-2011-ON' || r.row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.ok(row.format_note, `${row.row_id} lost its format_note`);
    assert.match(row.format_note, /does not follow|None of the three/);
    assert.match(row.format_note, /confirm/i, `${row.row_id}'s format_note must record the 2026-09-23 confirmation check`);
    assert.match(row.format_note, /not.*normalized|remains flagged/i);
  }
});

test('PHASE 2.15: Phase 3\'s pre-2026-09-23 access-blocker history was preserved, not deleted', () => {
  // The Phase 2 pass this test was originally written for left Phase 3
  // untouched (Phase 3 was BLOCKED_AT_SOURCE_1 at that time). The Phase 3
  // pass on 2026-09-23 legitimately changed phase3.outcome and populated
  // resolution_rows -- that is its own job, guarded by the PHASE 3.* tests
  // below, not a regression of this test. What this test still guards is
  // that the original shop.donaldson.com access-blocker record was kept for
  // the historical record rather than being deleted when Phase 3 was later
  // worked.
  assert.ok(Array.isArray(phase3.access_blockers) && phase3.access_blockers.length >= 5);
  assert.ok(phase3.access_blockers.some((b) => b.manufacturer === 'DONALDSON' && /403/.test(b.observed)));
});

test('PHASE 2 FINAL: phase2_status is CLOSED and the coverage summary is internally consistent', () => {
  assert.equal(phase2.phase2_status, 'CLOSED');
  assert.ok(Array.isArray(phase2.phase2_status_history) && phase2.phase2_status_history.length >= 2);

  const summary = phase2CoverageSummary();
  const sum = Object.values(summary.by_status).reduce((a, b) => a + b, 0);
  assert.equal(sum, summary.total_position_cells, 'the per-status counts must add up to the total cell count');
  assert.equal(summary.total_vehicle_year_combinations, 181, 'must match the closed Phase 1 vehicle count (169 original + 12 H-Series)');
});

// ---------------------------------------------------------------------------
// PHASE 3 — ISUZU USA DIESEL AFTERMARKET RESOLUTION AND ELIMFILTERS BASE
// DECISION, run over the Phase 2 closure above. See config/vehicle-platform-
// closure/isuzu-us-diesel-phase3-aftermarket.json for the resolution rows
// these tests validate.
// ---------------------------------------------------------------------------

test('PHASE 3.1: Phase 3 never redefines vehicle fitment', () => {
  // A resolution row's own fields never carry year/model/engine identity --
  // that comes exclusively from Phase 1/2 via phase2_row_id. If a future
  // edit ever adds a year/model/engine field directly to a resolution row,
  // this is the guard that catches it.
  const FITMENT_FIELDS = ['year', 'model', 'model_year', 'engine', 'engine_code', 'vehicle'];
  for (const row of phase3.resolution_rows) {
    for (const field of FITMENT_FIELDS) {
      assert.equal(row[field], undefined, `${row.row_id} carries a ${field} field; fitment must come only from phase2_row_id`);
    }
  }
});

test('PHASE 3.2: every resolution row points back to a real Phase 2 row', () => {
  const phase2Ids = new Set(phase2.oen_rows.map((r) => r.row_id));
  assert.ok(phase3.resolution_rows.length > 0, 'this pass must have produced resolution rows');
  for (const row of phase3.resolution_rows) {
    assert.ok(phase2Ids.has(row.phase2_row_id), `${row.row_id}: phase2_row_id ${row.phase2_row_id} is not a real Phase 2 row`);
  }
});

test('PHASE 3.3: no base decision exists without an Isuzu OE/OEN behind it', () => {
  for (const row of phase3.resolution_rows) {
    assert.ok(Array.isArray(row.isuzu_oe_oen) && row.isuzu_oe_oen.length > 0, `${row.row_id} has no isuzu_oe_oen`);
    if (row.base_source_brand) {
      assert.ok(row.isuzu_oe_oen.length > 0, `${row.row_id} takes a base decision with no OE/OEN`);
    }
  }
  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

test('PHASE 3.4: Donaldson has priority — every VERIFIED_BASE/PARTIAL row with a base is Donaldson unless Fleetguard absence was verified', () => {
  for (const row of phase3.resolution_rows) {
    if (row.base_source_brand === 'DONALDSON') {
      assert.equal(row.donaldson_status, 'DONALDSON_VERIFIED', `${row.row_id} bases on Donaldson without DONALDSON_VERIFIED`);
    }
  }
  assert.equal(phase3.coverage_summary.by_decision_status.VERIFIED_BASE, 3);
  assert.equal(phase3.coverage_summary.by_decision_status.PARTIAL, 4);
});

test('PHASE 3.5: Fleetguard only defines a base when Donaldson absence is itself verified', () => {
  const fleetguardBased = phase3.resolution_rows.filter((r) => r.base_source_brand === 'FLEETGUARD');
  assert.equal(fleetguardBased.length, 0, 'this pass found zero cases of DONALDSON_NOT_MANUFACTURED_VERIFIED, so zero Fleetguard bases are expected');
  for (const row of fleetguardBased) {
    assert.equal(row.donaldson_status, 'DONALDSON_NOT_MANUFACTURED_VERIFIED');
  }
});

test('PHASE 3.6: NOT_FOUND is never treated as equivalent to NOT_MANUFACTURED', () => {
  const notFoundRows = phase3.resolution_rows.filter((r) => r.donaldson_status === 'DONALDSON_NOT_FOUND');
  assert.ok(notFoundRows.length > 0, 'this pass must have genuinely unresolved Donaldson rows');
  for (const row of notFoundRows) {
    assert.notEqual(row.base_source_brand, 'FLEETGUARD', `${row.row_id} promoted Fleetguard to base on a mere NOT_FOUND`);
    assert.equal(row.decision_status, 'BLOCKED_DONALDSON', `${row.row_id} is DONALDSON_NOT_FOUND but not BLOCKED_DONALDSON`);
  }
});

test('PHASE 3.7: MANN-FILTER, Baldwin, WIX and FRAM never define an HD base', () => {
  const HD_BASE_BRANDS = new Set(['DONALDSON', 'FLEETGUARD']);
  for (const row of phase3.resolution_rows) {
    if (row.base_source_brand) {
      assert.ok(HD_BASE_BRANDS.has(row.base_source_brand), `${row.row_id} uses ${row.base_source_brand} as a base brand`);
    }
    for (const ref of row.supporting_crossrefs || []) {
      assert.notEqual(ref.fitment_role, 'base', `${row.row_id}: supporting_crossrefs entry for ${ref.manufacturer} is marked as a base`);
    }
  }
});

test('PHASE 3.8: H-Series without a Phase 2 OEN stays BLOCKED_OEM', () => {
  assert.equal(phase2.oen_rows.filter((r) => r.series === 'H-SERIES').length, 0, 'Phase 2 must carry zero H-Series oen_rows for this test to be meaningful');
  const hSeries = phase3.blocked_oem_scopes.find((b) => b.scope.includes('H-SERIES'));
  assert.ok(hSeries, 'H-Series must appear in blocked_oem_scopes');
  assert.equal(hSeries.status, 'BLOCKED_OEM');
  assert.equal(hSeries.no_equivalence_invented, true);
  assert.match(hSeries.reason, /6HK1-TC|does not create/i);
});

test('PHASE 3.9: FRR and FXR without a Phase 2 OEN stay BLOCKED_OEM', () => {
  for (const line of ['FRR', 'FXR']) {
    assert.ok(!phase2.oen_rows.some((r) => (r.applies_to_model_lines || []).includes(line)), `Phase 2 must not carry a ${line} oen_row for this test to be meaningful`);
    const entry = phase3.blocked_oem_scopes.find((b) => b.scope.startsWith(line));
    assert.ok(entry, `${line} must appear in blocked_oem_scopes`);
    assert.equal(entry.status, 'BLOCKED_OEM');
    assert.equal(entry.no_equivalence_invented, true);
  }
});

test('PHASE 3.10: assembly and element are not conflated in the Donaldson evidence', () => {
  const airRow = phase3.resolution_rows.find((r) => r.row_id === 'P3-N-AIR-1986-2005');
  assert.ok(airRow, 'P3-N-AIR-1986-2005 must exist');
  const r804759 = (airRow.donaldson_candidates || []).find((c) => c.part === 'R804759');
  assert.ok(r804759, 'R804759 candidate must be documented');
  assert.match(r804759.type, /element/i, 'R804759 must be typed as an element, not left ambiguous with an assembly');

  const fuelRow = phase3.resolution_rows.find((r) => r.row_id === 'P3-N-FUEL-4HE');
  assert.match(fuelRow.donaldson_part, /spin-on/i);
  assert.doesNotMatch(fuelRow.donaldson_part, /\bassembly\b/i);
});

test('PHASE 3.11: no gasoline scope entered Phase 3', () => {
  assert.equal(phase3.fuel_scope, 'DIESEL_ONLY');
  const GASOLINE_ENGINES = /VORTEC|L8T|GMPT|6\.6L gas/i;
  for (const row of phase3.resolution_rows) {
    assert.ok(!GASOLINE_ENGINES.test(row.oem_scope || ''), `${row.row_id} carries a gasoline engine hint in oem_scope`);
  }
});

test('PHASE 3.12: this pass performs no direct SQL writes', () => {
  assert.equal(phase3.governance.no_direct_sql_writes, true);
});

test('PHASE 3.13: this pass does not automatically publish to production', () => {
  assert.ok(typeof phase3.governance.no_automatic_production_publication === 'string' && phase3.governance.no_automatic_production_publication.length > 0);
  assert.match(phase3.governance.no_automatic_production_publication, /candidate|ready-for-review/i);
});

test('PHASE 3.14: an existing ELIMFILTERS SKU is reused rather than re-invented', () => {
  // These four SKUs are catalog ground truth (three from the task's own known
  // historical candidates, one -- EF50953 -- found directly in this
  // repository's competitor_cross_references_ld.csv during this pass) and
  // must be reused verbatim, never replaced with a freshly-minted SKU.
  const expectedReuse = {
    'P3-N-AIR-2006-ON': 'EA13614',
    'P3-N-LUBE-1998-2010': 'EL82042',
    'P3-N-FUEL-4HE': 'EF50953',
    'P3-F-FUEL-1994-2004': 'EF50953',
    'P3-N-FUEL-2013-2021-A': 'EF92599',
    'P3-F-FUEL-2018-2020-C': 'EF92599',
  };
  for (const [rowId, sku] of Object.entries(expectedReuse)) {
    const row = phase3.resolution_rows.find((r) => r.row_id === rowId);
    assert.ok(row, `${rowId} must exist`);
    assert.equal(row.elimfilters_existing_sku, sku, `${rowId} must reuse ${sku}`);
    assert.match(row.elimfilters_base_decision, /REUSE_EXISTING_SKU/, `${rowId} must document the reuse explicitly`);
  }
  assert.deepEqual(phase3.coverage_summary.elimfilters_skus_reused.slice().sort(), ['EA13614', 'EF50953', 'EF92599', 'EL82042'].sort());
  assert.equal(phase3.coverage_summary.elimfilters_new_skus_created, 0);
});

test('PHASE 3.15: no ELIMFILTERS SKU is attached to more than one physical base part', () => {
  const skuToParts = new Map();
  for (const row of phase3.resolution_rows) {
    if (!row.elimfilters_existing_sku) continue;
    if (!skuToParts.has(row.elimfilters_existing_sku)) skuToParts.set(row.elimfilters_existing_sku, new Set());
    if (row.base_source_part) skuToParts.get(row.elimfilters_existing_sku).add(row.base_source_part);
  }
  for (const [sku, parts] of skuToParts) {
    assert.equal(parts.size, 1, `SKU ${sku} is attached to ${parts.size} different base parts: ${[...parts].join(', ')}`);
  }
  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

test('PHASE 3.16: Phase 1 and Phase 2 remain intact after the Phase 3 pass', () => {
  assert.equal(phase1.year_blocks.filter((b) => b.series === 'H-SERIES').length > 0, true, 'Phase 1 H-Series blocks must still be present');
  assert.equal(phase2.oen_rows.length, 21, 'Phase 2 must still carry exactly the 21 oen_rows closed in the prior pass');
  assert.equal(phase2.phase2_status, 'CLOSED', 'Phase 2 status must remain CLOSED');
  const p2 = phase2CoverageSummary();
  assert.equal(p2.total_vehicle_year_combinations, 181, 'Phase 2 coverage must be unchanged by the Phase 3 pass');
});

test('PHASE 3 FINAL: phase3_status is CLOSED and every eligible Phase 2 row has an explicit Phase 3 decision', () => {
  assert.equal(phase3.phase3_status, 'CLOSED');
  assert.ok(Array.isArray(phase3.phase3_status_history) && phase3.phase3_status_history.length >= 2);

  const matrix = phase3CoverageMatrix();
  assert.equal(matrix.length, phase2.oen_rows.length, 'every Phase 2 oen_row must appear in the Phase 3 coverage matrix, none silently absent');
  for (const cell of matrix) {
    assert.notEqual(cell.decision_status, undefined, `${cell.phase2_row_id} has no explicit Phase 3 decision_status`);
    if (cell.eligible) {
      assert.notEqual(cell.decision_status, 'NO_PHASE3_ROW', `${cell.phase2_row_id} is eligible but has no Phase 3 resolution row`);
    }
  }

  const summary = phase3CoverageSummary();
  assert.equal(summary.eligible_phase2_oen_rows, 19);
  assert.equal(summary.not_applicable_phase2_oen_rows, 2);
  const sumByDecision = Object.values(summary.by_decision_status).reduce((a, b) => a + b, 0);
  assert.equal(sumByDecision, summary.eligible_phase2_oen_rows, 'per-decision-status counts must add up to the eligible row count');
  // The JSON's coverage_summary spells out every possible status with an
  // explicit 0 for the ones that did not occur; the JS-computed summary only
  // adds a key when it actually saw that status. Comparing them means
  // treating an absent JS key as 0, not requiring identical object shape.
  assert.equal(summary.total_phase2_oen_rows, phase2.oen_rows.length);
  assert.equal(summary.eligible_phase2_oen_rows, phase3.coverage_summary.eligible_phase2_oen_rows);
  assert.equal(summary.not_applicable_phase2_oen_rows, phase3.coverage_summary.not_applicable_phase2_oen_rows);
  for (const [status, count] of Object.entries(phase3.coverage_summary.by_decision_status)) {
    assert.equal(summary.by_decision_status[status] || 0, count, `by_decision_status.${status} mismatch between JS and JSON`);
  }
  for (const [status, count] of Object.entries(phase3.coverage_summary.by_donaldson_status)) {
    assert.equal(summary.by_donaldson_status[status] || 0, count, `by_donaldson_status.${status} mismatch between JS and JSON`);
  }

  assert.equal(phase3.blocked_oem_scopes.length, 4);
  for (const scope of phase3.blocked_oem_scopes) {
    assert.equal(scope.status, 'BLOCKED_OEM');
  }
});
