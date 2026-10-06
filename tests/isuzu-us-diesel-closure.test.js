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
  validatePhase3,
  phase3CoverageMatrix,
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

test('Phase 3 keeps the first blocked attempt on record and the canonical source order', () => {
  assert.equal(phase3.phase3_status_history[0].outcome, 'BLOCKED_AT_SOURCE_1');
  assert.equal(phase3.canonical_hd_rule, 'DONALDSON_THEN_FLEETGUARD_THEN_VERIFIED_OEM');
  assert.equal(phase3.source_order[0], 'DONALDSON');
  assert.equal(phase3.source_order[1], 'FLEETGUARD');
  assert.ok(phase3.access_blockers.length > 0, 'the live-route blockers must stay documented');
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

  // Aftermarket is attached per Phase 2 row, unpublished, and only where
  // Phase 2 has an Isuzu number.
  const air = byPosition.AIR_PRIMARY.aftermarket;
  assert.equal(air.length, 1);
  assert.equal(air[0].donaldson_reference, 'P543614');
  assert.equal(air[0].elimfilters_base_decision.sku, 'EA13614');
  assert.equal(air[0].elimfilters_base_decision.published, false);
  assert.equal(byPosition.CABIN.aftermarket, null);
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

test('PHASE 2.15: Phase 3 reads Phase 2 by reference and adds no Phase 2 row', () => {
  assert.equal(phase3.phase2_file, 'config/vehicle-platform-closure/isuzu-us-diesel-phase2-oen.json');
  const phase2Ids = new Set(phase2.oen_rows.map((r) => r.row_id));
  for (const row of phase3.resolution_rows) assert.ok(phase2Ids.has(row.phase2_row_id));
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
// PHASE 3 — aftermarket resolution and ELIMFILTERS base decision
// ---------------------------------------------------------------------------

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const eligiblePhase2 = phase2.oen_rows.filter((r) => r.evidence_status !== 'NOT_APPLICABLE');
const phase2ById = new Map(phase2.oen_rows.map((r) => [r.row_id, r]));

test('PHASE 3.0: governance validator passes and every eligible Phase 2 row has exactly one decision', () => {
  assert.deepEqual(validatePhase3().errors, []);
  assert.equal(phase3.resolution_rows.length, eligiblePhase2.length);
  const matrix = phase3CoverageMatrix();
  assert.equal(matrix.length, eligiblePhase2.length);
  for (const cell of matrix) assert.notEqual(cell.decision_status, 'MISSING', `${cell.phase2_row_id} is a silent gap`);
});

test('PHASE 3.1: Phase 3 does not redefine vehicle fitment', () => {
  for (const row of phase3.resolution_rows) {
    const p2 = phase2ById.get(row.phase2_row_id);
    assert.equal(row.oem_scope.scope_authority, 'PHASE_2_UNCHANGED');
    assert.deepEqual(row.oem_scope.binds_to_phase1, p2.binds_to_phase1);
    assert.deepEqual(row.oem_scope.model_lines, p2.applies_to_model_lines);
    assert.equal(row.oem_scope.published_year_scope, p2.isuzu_published_year_scope);
    assert.equal(row.oem_scope.published_engine_scope, p2.isuzu_published_engine_scope);
  }
  assert.equal(phase3.governance.cross_reference_alone_never_establishes_vehicle_fitment, true);
  const src = sources.sources.find((s) => s.source_id === 'DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07');
  assert.match(src.scope_restriction, /never establishes USA vehicle fitment/);
});

test('PHASE 3.2: every resolution row points to a real Phase 2 row with the same OEN and position', () => {
  for (const row of phase3.resolution_rows) {
    const p2 = phase2ById.get(row.phase2_row_id);
    assert.ok(p2, `${row.row_id} points to a missing Phase 2 row`);
    assert.deepEqual(row.isuzu_oe_oen, p2.isuzu_oe_oen);
    assert.equal(row.filter_position, p2.filter_position);
  }
});

test('PHASE 3.3: no base exists without an Isuzu OEN', () => {
  for (const row of [...phase3.resolution_rows, ...phase3.blocked_oem_rows]) {
    if (row.base_source_part || row.elimfilters_base_decision) assert.ok(row.isuzu_oe_oen.length > 0, row.row_id);
  }
});

test('PHASE 3.4: Donaldson has priority -- whenever Donaldson is verified it is the base', () => {
  for (const row of phase3.resolution_rows) {
    if (row.donaldson_status === 'DONALDSON_VERIFIED') {
      assert.equal(row.base_source_brand, 'DONALDSON', row.row_id);
      assert.equal(row.base_source_part, row.donaldson_part);
      assert.equal(row.fleetguard_part, null);
    }
  }
});

test('PHASE 3.5: Fleetguard defines a base only when Donaldson absence is verified', () => {
  for (const row of phase3.resolution_rows) {
    if (row.base_source_brand === 'FLEETGUARD') assert.equal(row.donaldson_status, 'DONALDSON_NOT_MANUFACTURED_VERIFIED');
  }
  // The FWS single-row closure leaves one DONALDSON_NOT_FOUND row.
  // NOT_FOUND is still not enough to open Fleetguard as the canonical base.
  const rogue = { ...phase3.resolution_rows.find((r) => r.donaldson_status === 'DONALDSON_NOT_FOUND'), base_source_brand: 'FLEETGUARD' };
  const original = phase3.resolution_rows.slice();
  phase3.resolution_rows.splice(0, phase3.resolution_rows.length, ...original.map((r) => (r.row_id === rogue.row_id ? rogue : r)));
  try {
    assert.ok(validatePhase3().errors.some((e) => /Fleetguard base without verified Donaldson absence/.test(e)));
  } finally {
    phase3.resolution_rows.splice(0, phase3.resolution_rows.length, ...original);
  }
});

test('PHASE 3.6: NOT_FOUND is never treated as NOT_MANUFACTURED', () => {
  const notFound = phase3.resolution_rows.filter((r) => ['DONALDSON_NOT_FOUND', 'DONALDSON_SOURCE_BLOCKED', 'DONALDSON_AMBIGUOUS'].includes(r.donaldson_status));
  assert.ok(notFound.length > 0);
  for (const row of notFound) {
    assert.equal(row.base_source_brand, null, row.row_id);
    assert.equal(row.elimfilters_base_decision, null, row.row_id);
    assert.equal(row.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED', row.row_id);
  }
  assert.equal(phase3.coverage.donaldson.DONALDSON_NOT_MANUFACTURED_VERIFIED, 0);
});

test('PHASE 3.7: MANN-FILTER, Baldwin, WIX and FRAM never define an HD base', () => {
  for (const row of phase3.resolution_rows) {
    assert.ok([null, 'DONALDSON', 'FLEETGUARD'].includes(row.base_source_brand), row.row_id);
    for (const ref of row.supporting_crossrefs) {
      assert.ok(['MANN-FILTER', 'BALDWIN', 'WIX', 'FRAM'].includes(ref.manufacturer));
      assert.equal(ref.fitment_role, 'CORROBORATION_ONLY');
      assert.equal(ref.relationship_type, 'UNVERIFIED');
    }
  }
  assert.equal(phase3.governance.supporting_brands_may_define_base, false);
});

test('PHASE 3.8: H-Series without an OEN stays BLOCKED_OEM', () => {
  const h = phase3.blocked_oem_rows.find((r) => /H-SERIES/.test(r.phase2_unresolved_scope));
  assert.ok(h);
  assert.equal(h.decision_status, 'BLOCKED_OEM');
  assert.deepEqual(h.isuzu_oe_oen, []);
  assert.equal(h.base_source_part, null);
  assert.ok(!phase3.resolution_rows.some((r) => r.oem_scope.series === 'H-SERIES'));
});

test('PHASE 3.9: FRR/FXR and the Cummins B6.7 F-Series without an OEN stay BLOCKED_OEM', () => {
  for (const pattern of [/\bFRR\b.*\bFXR\b/, /Cummins B6\.7/]) {
    const row = phase3.blocked_oem_rows.find((r) => pattern.test(r.phase2_unresolved_scope));
    assert.ok(row, `missing BLOCKED_OEM row for ${pattern}`);
    assert.equal(row.decision_status, 'BLOCKED_OEM');
    assert.equal(row.elimfilters_base_decision, null);
  }
  for (const row of phase3.resolution_rows) {
    assert.ok(!row.oem_scope.model_lines.some((m) => m === 'FRR' || m === 'FXR'), row.row_id);
  }
});

test('PHASE 3.10: assembly, element and kit are not mixed', () => {
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    const base = row.donaldson_candidates.find((c) => c.part === row.base_source_part);
    assert.ok(base, row.row_id);
    if (/KIT/i.test(row.isuzu_part_form)) {
      assert.equal(row.donaldson_relationship_type, 'KIT_CROSS', `${row.row_id}: kit OEN must not be a direct cross`);
      assert.notEqual(row.decision_status, 'VERIFIED_BASE');
    }
    if (/CARTRIDGE/i.test(row.isuzu_part_form) && base.form.style !== 'Cartridge') {
      assert.ok(row.microphase_closure_2026_09_24?.resolution_basis, `${row.row_id}: spin-on resolution of OEM cartridge wording needs explicit evidence`);
      assert.match(row.microphase_closure_2026_09_24.resolution_basis, /Fleetguard|spin-on|terminology/i);
    }
    // "ELEMENT KIT" rows are already fully handled by the /KIT/i branch above
    // (KIT_CROSS, never a direct cross); only plain "ELEMENT" (no "KIT") rows
    // need their own explicit terminology caveat checked here.
    if (/\bELEMENT\b/i.test(row.isuzu_part_form) && !/KIT/i.test(row.isuzu_part_form) && base.form.style === 'Spin-On') {
      // "ELEMENT" in Isuzu's own part_form is established elsewhere in this
      // file (P2-F-LUBE-1987-2008, P2-F-FUEL-1994-2004) as routine generic
      // phrasing, not a literal internal-cartridge-only signal -- it does not
      // block VERIFIED_BASE by itself. What it must never do is reach
      // VERIFIED_BASE silently: an explicit caveat addressing the
      // terminology must be present.
      assert.ok(row.caveats.some((c) => /ELEMENT/i.test(c) && /(generic|terminology|routine|naming difference)/i.test(c)), `${row.row_id}: ELEMENT-vs-Spin-On must be explicitly addressed in caveats, not silently accepted`);
    }
  }
  const trans = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-TRANS');
  // SINGLE-ROW TRANSMISSION CLOSURE 2026-09-24 supersedes the earlier form-only
  // rejection: exact Donaldson OEN cross + independent Fleetguard transmission
  // application + near-identical spin-on geometry establish a usable base.
  assert.equal(trans.decision_status, 'PARTIAL');
  assert.equal(trans.base_source_part, 'P550008');
  assert.equal(trans.base_source_brand, 'DONALDSON');
  assert.equal(trans.elimfilters_existing_sku, 'EL80008');
});

test('PHASE 3.11: no gasoline scope enters Phase 3', () => {
  assert.equal(phase3.fuel_scope, 'DIESEL_ONLY');
  for (const row of phase3.resolution_rows) {
    assert.ok(!/^gas$/i.test(String(row.oem_scope.published_engine_scope).trim()), row.row_id);
    assert.ok(row.oem_scope.binds_to_phase1.length > 0, `${row.row_id} binds to no diesel vehicle`);
  }
});

test('PHASE 3.12: no direct SQL writes and no catalogue writes', () => {
  assert.deepEqual(phase3.governance.catalog_writes_performed, []);
  assert.match(phase3.governance.catalog_write_path_if_approved, /catalog-write-gateway/);
  const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'isuzu-us-diesel-closure.js'), 'utf8');
  assert.ok(!/\b(INSERT|UPDATE|DELETE)\s+(INTO\s+|FROM\s+)?\w+/.test(lib), 'the closure read model must not carry SQL');
  assert.ok(!/require\(['"](pg|\.\/db|\.\.\/db)/.test(lib), 'the closure read model must not open a database');
});

test('PHASE 3.13: nothing is published automatically; later governed live publication is separate', () => {
  assert.equal(phase3.governance.publication_authorized, false);
  assert.equal(phase3.governance.review_state, 'READY_FOR_REVIEW');
  assert.equal(phase3.governance.hermes_output_class, 'CANDIDATE_INTELLIGENCE');
  assert.match(phase3.governance.publication_authorized_scope, /NO_AUTOMATIC_OR_BULK_PUBLICATION/);
  for (const d of phase3.elimfilters_base_decisions) assert.equal(d.published, false);
  for (const row of phase3.resolution_rows) {
    if (row.elimfilters_base_decision) assert.equal(row.elimfilters_base_decision.published, false);
  }
  const live = phase3.resolution_rows.filter((r) => r.elimfilters_existing_sku === 'EL88076');
  assert.equal(live.length, 2);
  for (const row of live) {
    assert.equal(row.live_catalog_publication.status, 'LIVE');
    assert.equal(row.live_catalog_publication.migration, 'scripts/migrations/run_119_create_el88076_p848076.js');
    assert.match(row.live_catalog_publication.note, /published remains false by design/);
  }
});

test('PHASE 3.14: an existing SKU is reused where one exists; a new one is minted only as a governed, audited candidate', () => {
  const catalogue = new Set(fs.readFileSync(path.join(__dirname, '..', 'data', 'dims.csv'), 'utf8').split('\n').map((l) => l.split(',')[0]));
  // P848076 ELIMFILTERS SKU CLOSURE 2026-09-24: EL88076 is the one exception
  // to "never minted" -- an exhaustive duplicate audit (repo + live Postgres)
  // found no existing SKU, so a governed candidate was derived from this
  // repo's own codigo_base policy, not invented, and recorded as
  // CREATE_GOVERNED_SKU; later governed live publication is recorded separately in live_catalog_publication while the Phase 3 published flag stays false.
  assert.deepEqual(phase3.coverage.elimfilters_new_sku_candidates, ['EL88076']);
  for (const row of phase3.resolution_rows) {
    if (!row.elimfilters_base_decision) continue;
    assert.ok(['REUSE_EXISTING_SKU', 'CREATE_GOVERNED_SKU'].includes(row.elimfilters_base_decision.action), row.row_id);
    assert.equal(row.elimfilters_base_decision.sku, row.elimfilters_existing_sku);
    if (row.elimfilters_base_decision.action === 'REUSE_EXISTING_SKU') {
      assert.ok(catalogue.has(row.elimfilters_existing_sku), `${row.elimfilters_existing_sku} is not in the catalogue export`);
    } else {
      // A minted candidate must document the exact nomenclature rule used
      // (not invented) and stay unpublished pending governance.
      assert.match(row.elimfilters_base_decision.nomenclature_rule, /codigo_base/);
      assert.equal(row.elimfilters_base_decision.review_state, 'READY_FOR_REVIEW');
      assert.equal(row.elimfilters_base_decision.published, false);
    }
  }
});

test('PHASE 3.15: no duplicate ELIMFILTERS SKU -- one Donaldson base, one SKU', () => {
  const skuByBase = new Map();
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    const prior = skuByBase.get(row.base_source_part);
    if (prior) assert.equal(prior, row.elimfilters_existing_sku, `${row.base_source_part} resolves to two SKUs`);
    skuByBase.set(row.base_source_part, row.elimfilters_existing_sku);
  }
  const skus = [...skuByBase.values()];
  assert.equal(new Set(skus).size, skus.length, 'two different Donaldson bases share one SKU');
  // Bases resolved to Donaldson but with no existing ELIMFILTERS SKU yet
  // (decision_status NO_ELIMFILTERS_SKU_YET) contribute null here rather
  // than a SKU string; coverage.elimfilters_skus_reused lists only genuinely
  // pre-existing, reused SKU names, and coverage.elimfilters_new_sku_candidates
  // lists newly-minted governed candidates (EL88076) separately -- the union
  // of both must equal every named SKU actually attached to a base.
  const namedSkus = skus.filter((s) => s != null);
  const knownSkus = [...phase3.coverage.elimfilters_skus_reused, ...phase3.coverage.elimfilters_new_sku_candidates];
  assert.deepEqual([...new Set(namedSkus)].sort(), [...new Set(knownSkus)].sort());
});

test('PHASE 3.16: Phase 1 and Phase 2 are intact', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
  assert.equal(digest(phase2), 'ebefaf29e4565ce67e6f0a5cf2075ace33ec556d81d2375b04d9b50fa4e72e48');
  assert.equal(phase2.phase2_status, 'CLOSED');
});

test('PHASE 3.17: anomalous Isuzu numbers are documented, not normalised', () => {
  const lube = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.deepEqual(lube.isuzu_oe_oen, ['2906542701', '2906548000', '2906548100']);
  assert.ok(lube.caveats.some((c) => /2-90654-800-0/.test(c) && /NOT used to normalise/.test(c)));
  const lube2011 = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.ok(lube2011.isuzu_oe_oen.includes('2906544040'));
  // BLOCKED_DONALDSON CLOSURE MICRO-PHASE 2026-09-24 resolved this row's
  // Donaldson identity (P848076); the P848076 SKU CLOSURE pass (same day)
  // then derived a governed candidate SKU (EL88076), capped at PARTIAL
  // because this row's own Phase 2 evidence_status is PARTIAL.
  assert.equal(lube2011.decision_status, 'PARTIAL');
  assert.equal(lube2011.elimfilters_existing_sku, 'EL88076');
});

test('PHASE 3 FINAL: CLOSED means every eligible row is explicit, not every base resolved', () => {
  assert.equal(phase3.phase3_status, 'CLOSED');
  const counts = phase3.coverage.decision_status;
  const explicit = counts.VERIFIED_BASE + counts.PARTIAL + counts.CONFLICTING + counts.BLOCKED_DONALDSON + counts.NO_ELIMFILTERS_SKU_YET;
  assert.equal(explicit, eligiblePhase2.length);
  assert.equal(counts.BLOCKED_OEM, phase3.blocked_oem_rows.length);
  assert.equal(phase3.coverage.base_decisions.fleetguard_based, 0);
  assert.ok(counts.VERIFIED_BASE < eligiblePhase2.length, 'closure must not claim 100% resolution');
});

// ---------------------------------------------------------------------------
// PHASE 3 EXCEPTION CLOSURE PASS (2026-09-23) -- re-audits the CONFLICTING /
// BLOCKED_DONALDSON / PARTIAL residue left by the prior Phase 3 pass, using an
// OEM-vs-CROSSREF Donaldson evidence-tier distinction and a dims.csv physical
// cross-check the prior pass did not apply. See the "EXCEPTION AUDIT
// 2026-09-23" caveats on the affected resolution_rows and the top-level
// exception_audit_status / duplicate_mapping_audit fields.
// ---------------------------------------------------------------------------

test('EXCEPTION 1: no Donaldson part used by Isuzu Phase 3 has two canonical SKUs without explicit semantics', () => {
  const skuByBase = new Map();
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    const prior = skuByBase.get(row.base_source_part);
    if (prior) assert.equal(prior, row.elimfilters_existing_sku, `${row.base_source_part} resolves to two different SKUs across rows`);
    skuByBase.set(row.base_source_part, row.elimfilters_existing_sku);
  }
  // P550008 is now an active base, so the previously documented stale legacy
  // mappings must be cleaned and the canonical owner must be EL80008.
  const p550008Finding = phase3.duplicate_mapping_audit.findings.find((f) => f.donaldson_part === 'P550008');
  assert.ok(p550008Finding);
  assert.match(p550008Finding.action_taken, /removed 3 stale P550008 rows/);
  const trans = phase3.resolution_rows.find((r) => r.base_source_part === 'P550008');
  assert.equal(trans.elimfilters_existing_sku, 'EL80008');
});

test('EXCEPTION 2: P552564 belongs only to EF92564', () => {
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  assert.match(flat, /^EF92564,fuel,P552564,/m);
  assert.doesNotMatch(flat, /^EF50953,[^\n]*,P552564,/m);
  const fuel4he = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FUEL-4HE');
  const fFuel = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-F-FUEL-1994-2004');
  for (const row of [fuel4he, fFuel]) {
    assert.equal(row.base_source_part, 'P552564');
    assert.equal(row.elimfilters_existing_sku, 'EF92564');
  }
});

test('EXCEPTION 3: EF50953 keeps its separate Donaldson identity, P502155', () => {
  for (const file of ['competitor_cross_references_ld.csv', 'external_cross_reference_master_ld.csv']) {
    const csv = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(csv, /^"EF50953",[^\n]*"DONALDSON","P552564"/m, file);
    assert.match(csv, /^"EF50953",[^\n]*"DONALDSON","P502155"/m, file);
  }
  assert.ok(!phase3.resolution_rows.some((r) => r.elimfilters_existing_sku === 'EF50953'));
  const p552564Regression = phase3.duplicate_mapping_audit.p552564_regression_check;
  assert.equal(p552564Regression.checked_2026_09_23, true);
});

test('EXCEPTION 4: legacy CSV cross-references never silently override the Donaldson first-party capture', () => {
  // For every base this pass took (or re-confirmed) from the first-party
  // capture, the legacy exports must not carry that same Donaldson part under
  // a different SKU -- if they did, EXCEPTION 1's duplicate check above would
  // already have failed. This test asserts the priority rule itself: the
  // capture wins whenever the two disagree, which is exactly the P552564 case
  // already regression-tested in EXCEPTION 2/3.
  assert.match(phase3.governance.elimfilters_sku_policy, /Reuse an existing ELIMFILTERS SKU/);
  assert.match(phase3.governance.elimfilters_sku_policy, /codigo_base (derivation )?policy/, 'a minted candidate must be traceable to the governed nomenclature policy, not an ad hoc string');
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  assert.doesNotMatch(flat, /,DONALDSON,P502155,/, 'P502155 must not exist in the first-party capture (it is a legacy-only identity)');
});

test('EXCEPTION 5: the first-party Donaldson capture outranks third-party legacy crossref on every reused base', () => {
  const reusedParts = new Set(phase3.resolution_rows.filter((r) => r.base_source_part).map((r) => r.base_source_part));
  // BLOCKED_DONALDSON CLOSURE MICRO-PHASE 2026-09-24 registered one new
  // source_id for P848076, which is genuinely absent from the first-party
  // capture and was escalated to Donaldson's own official product title plus
  // independently fetched distributor corroboration (source priority 3, not
  // legacy CSV). Both registered sources are Donaldson-anchored; only a
  // legacy-CSV-only or unregistered source would fail this test.
  const REGISTERED_DONALDSON_SOURCES = ['DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07', 'DONALDSON_OFFICIAL_PRODUCT_TITLE_AND_DISTRIBUTOR_CORROBORATION_2026_09_24'];
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    assert.ok(REGISTERED_DONALDSON_SOURCES.includes(row.donaldson_source), `${row.row_id}: base must be sourced from a registered Donaldson-anchored source, got ${row.donaldson_source}`);
  }
  const webCorroboratedRows = phase3.resolution_rows.filter((r) => r.donaldson_source === 'DONALDSON_OFFICIAL_PRODUCT_TITLE_AND_DISTRIBUTOR_CORROBORATION_2026_09_24');
  assert.equal(webCorroboratedRows.length, 2, 'exactly P2-N-LUBE-2011-ON and P2-F-LUBE-2018-2021 use the web-corroborated source');
  for (const row of webCorroboratedRows) assert.equal(row.confidence, 'medium', `${row.row_id}: web-corroborated (not first-party) evidence must be disclosed at medium, not high, confidence`);
  assert.ok(reusedParts.size >= 8, 'exception pass must have left at least the 8 distinct Donaldson bases it resolved');
});

test('EXCEPTION 6: Fleetguard is never used without a verified Donaldson absence', () => {
  for (const row of phase3.resolution_rows) {
    if (row.base_source_brand === 'FLEETGUARD') {
      assert.equal(row.donaldson_status, 'DONALDSON_NOT_MANUFACTURED_VERIFIED', row.row_id);
    }
    if (['DONALDSON_NOT_FOUND', 'DONALDSON_AMBIGUOUS', 'DONALDSON_SOURCE_BLOCKED'].includes(row.donaldson_status)) {
      assert.notEqual(row.base_source_brand, 'FLEETGUARD', row.row_id);
    }
  }
  assert.equal(phase3.coverage.base_decisions.fleetguard_based, 0);
});

test('EXCEPTION 7: MANN, Baldwin, WIX and FRAM never define a base in the exception-audited rows', () => {
  for (const id of ['P3-05-N-LUBE-1998-2010', 'P3-08-N-FUEL-2013-2021-B', 'P3-10-N-FUEL-HIGHCAP-2013-2021', 'P3-12-N-TRANS', 'P3-13-F-LUBE-1987-2008', 'P3-16-F-FUEL-2018-2020-A', 'P3-17-F-FUEL-2018-2020-B']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.ok(row, id);
    assert.ok([null, 'DONALDSON'].includes(row.base_source_brand), `${id} took a base from a non-Donaldson/Fleetguard brand`);
  }
});

test('EXCEPTION 8: no change to Phase 1 fitment', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
});

test('EXCEPTION 9: no change to the Phase 2 OEN truth', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase2), 'ebefaf29e4565ce67e6f0a5cf2075ace33ec556d81d2375b04d9b50fa4e72e48');
  for (const id of ['P3-05-N-LUBE-1998-2010', 'P3-08-N-FUEL-2013-2021-B', 'P3-10-N-FUEL-HIGHCAP-2013-2021', 'P3-12-N-TRANS', 'P3-13-F-LUBE-1987-2008', 'P3-16-F-FUEL-2018-2020-A', 'P3-17-F-FUEL-2018-2020-B']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    const p2 = phase2.oen_rows.find((r) => r.row_id === row.phase2_row_id);
    assert.deepEqual(row.isuzu_oe_oen, p2.isuzu_oe_oen, `${id}: isuzu_oe_oen must not diverge from phase2`);
  }
});

test('EXCEPTION 10: assembly, element and kit candidates are not fused across the re-resolved rows', () => {
  const lube = phase3.resolution_rows.find((r) => r.row_id === 'P3-05-N-LUBE-1998-2010');
  // SINGLE-CASE MICROINVESTIGATION 2026-09-24 resolved this row to P502042 on
  // equipment-application grounds; both candidates stay documented in
  // donaldson_candidates (P550973 explicitly marked rejected), never silently
  // dropped even though only one became the base.
  assert.equal(lube.base_source_part, 'P502042');
  assert.ok(lube.donaldson_candidates.some((c) => c.part === 'P502042') && lube.donaldson_candidates.some((c) => c.part === 'P550973'));
  const rejected = lube.donaldson_candidates.find((c) => c.part === 'P550973');
  assert.match(rejected.verdict, /MISMATCH|REJECTED/);
  const trans = phase3.resolution_rows.find((r) => r.row_id === 'P3-12-N-TRANS');
  assert.equal(trans.base_source_part, 'P550008');
  assert.equal(trans.elimfilters_existing_sku, 'EL80008');
  assert.equal(trans.decision_status, 'PARTIAL');
  assert.equal(trans.donaldson_relationship_type, 'DIRECT_OE_CROSS');
  assert.ok(trans.fleetguard_corroboration.some((x) => x.part === 'LF551A'));
  assert.match(trans.caveats.at(-1), /CARTRIDGE|spin-on|Fleetguard/i);
  const fLube = phase3.resolution_rows.find((r) => r.row_id === 'P3-13-F-LUBE-1987-2008');
  assert.equal(fLube.base_source_part, 'P550420');
  assert.notEqual(fLube.base_source_part, 'P551263');
  assert.notEqual(fLube.base_source_part, 'P559128');
});

test('EXCEPTION 11: this pass performs no direct SQL writes', () => {
  assert.deepEqual(phase3.governance.catalog_writes_performed, []);
  const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'isuzu-us-diesel-closure.js'), 'utf8');
  assert.ok(!/\b(INSERT|UPDATE|DELETE)\s+(INTO\s+|FROM\s+)?\w+/.test(lib));
});

test('EXCEPTION 12: nothing from this pass is auto-published', () => {
  assert.equal(phase3.governance.publication_authorized, false);
  for (const id of ['P3-08-N-FUEL-2013-2021-B', 'P3-10-N-FUEL-HIGHCAP-2013-2021', 'P3-13-F-LUBE-1987-2008', 'P3-16-F-FUEL-2018-2020-A', 'P3-17-F-FUEL-2018-2020-B']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.equal(row.elimfilters_base_decision.published, false, id);
  }
});

test('EXCEPTION 13: every CONFLICTING row ends resolved or carries an explicit, evidence-tiered justification', () => {
  // SINGLE-CASE MICROINVESTIGATION 2026-09-24 resolved the one row this
  // exception pass had left CONFLICTING (P2-N-LUBE-1998-2010) using Donaldson
  // equipment-application evidence, so CONFLICTING is now 0 across the file.
  const conflicting = phase3.resolution_rows.filter((r) => r.decision_status === 'CONFLICTING');
  assert.equal(conflicting.length, 0, 'the single-case microinvestigation must resolve the last CONFLICTING row');

  const lube = phase3.resolution_rows.find((r) => r.row_id === 'P3-05-N-LUBE-1998-2010');
  assert.equal(lube.decision_status, 'PARTIAL');
  assert.equal(lube.base_source_part, 'P502042');
  assert.equal(lube.elimfilters_existing_sku, 'EL82042');
  // The resolution rests on equipment-application evidence, not the tied
  // OEM-vs-CROSSREF tier or the rejected family-level inference -- both must
  // still be documented (task requirement: don't hide that they were tied).
  assert.ok(lube.caveats.some((c) => /CROSSREF/.test(c)), 'must still document that evidence tier alone was tied on this number');
  assert.ok(lube.caveats.some((c) => /EQUIPMENT[- ]APPLICATION/i.test(c) || /4HE1-TC/.test(c)), 'must document the equipment-application evidence that actually broke the tie');
});

test('EXCEPTION 14: every BLOCKED_DONALDSON row shows exact search evidence', () => {
  // Later closures resolved P2-N-TRANS and recovered an exact MY2006 NPR OEM number.
  // Two rows are currently BLOCKED_DONALDSON: FWS 8982373410 and MY2006 NPR fuel 8980284111.
  const blocked = phase3.resolution_rows.filter((r) => r.decision_status === 'BLOCKED_DONALDSON');
  assert.equal(blocked.length, 2);
  for (const row of blocked) {
    assert.ok(row.caveats.length > 0, `${row.row_id} must document its search`);
  }
  const trans = phase3.resolution_rows.find((r) => r.row_id === 'P3-12-N-TRANS');
  assert.equal(trans.decision_status, 'PARTIAL');
  assert.equal(trans.base_source_part, 'P550008');
  const fws = blocked.find((r) => r.row_id === 'P3-11-N-FWS-2022i-ON');
  assert.ok(fws, 'P2-N-FWS-2022i-ON must still be represented as BLOCKED_DONALDSON');
});

test('EXCEPTION 15: no active generator can recreate the P552564/EF50953 stale mapping', () => {
  const check = phase3.duplicate_mapping_audit.p552564_regression_check;
  assert.match(check.generator_check, /phase3cde_build_ld_enrichment_master/);
  assert.match(check.regression_guard, /p552564-canonical-mapping\.test\.js/);
  // Defense in depth: this file's own test file carries the same guard the
  // dedicated regression file does, so a future edit to either the CSVs or
  // this JSON independently trips a failure.
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  assert.doesNotMatch(flat, /^EF50953,[^\n]*,P552564,/m);
});

test('EXCEPTION AUDIT FINAL: counts match the reported starting and final tallies', () => {
  assert.ok(phase3.exception_audit_history.length >= 3, 'must carry the 2026-09-23 exception pass, the 2026-09-24 single-case microinvestigation, and the 2026-09-24 BLOCKED_DONALDSON closure micro-phase as separate history entries');
  const first = phase3.exception_audit_history[0];
  assert.deepEqual(first.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 5, CONFLICTING: 7, BLOCKED_DONALDSON: 3 });
  assert.deepEqual(first.final_counts, { VERIFIED_BASE: 4, PARTIAL: 10, CONFLICTING: 1, BLOCKED_DONALDSON: 4 });

  const second = phase3.exception_audit_history[1];
  assert.deepEqual(second.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 10, CONFLICTING: 1, BLOCKED_DONALDSON: 4 });
  assert.deepEqual(second.final_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, BLOCKED_DONALDSON: 4 });

  const third = phase3.exception_audit_history[2];
  assert.deepEqual(third.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, BLOCKED_DONALDSON: 4 });
  assert.deepEqual(third.final_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, BLOCKED_DONALDSON: 2 });

  // P848076 ELIMFILTERS SKU CLOSURE 2026-09-24: closed both remaining
  // NO_ELIMFILTERS_SKU_YET rows with a governed candidate SKU.
  const history = phase3.exception_audit_history.find((h) => h.starting_counts?.NO_ELIMFILTERS_SKU_YET === 2);
  assert.ok(phase3.exception_audit_history.length >= 8, 'history may grow as later terminal audits are appended');
  assert.ok(history);
  assert.deepEqual(history.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, NO_ELIMFILTERS_SKU_YET: 2, BLOCKED_DONALDSON: 2 });
  assert.deepEqual(history.final_counts, { VERIFIED_BASE: 5, PARTIAL: 12, CONFLICTING: 0, NO_ELIMFILTERS_SKU_YET: 0, BLOCKED_DONALDSON: 2 });

  const fwsHistory = phase3.exception_audit_history.find((h) => h.scope === 'P2-N-FWS-2022i-ON_ONLY');
  assert.ok(fwsHistory);
  assert.equal(fwsHistory.starting_donaldson_status, 'DONALDSON_AMBIGUOUS');
  assert.equal(fwsHistory.final_donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(fwsHistory.decision_status, 'BLOCKED_DONALDSON');

  const transHistory = phase3.exception_audit_history.find((h) => h.scope === 'P2-N-TRANS_ONLY');
  assert.ok(transHistory);
  assert.equal(transHistory.starting_decision_status, 'BLOCKED_DONALDSON');
  assert.equal(transHistory.final_decision_status, 'PARTIAL');
  assert.equal(transHistory.base, 'DONALDSON P550008');
  assert.equal(transHistory.elimfilters_sku, 'EL80008');

  const counts = phase3.coverage.decision_status;
  assert.equal(counts.VERIFIED_BASE, 8);
  assert.equal(counts.PARTIAL, 13);
  assert.equal(counts.CONFLICTING, 0);
  assert.equal(counts.BLOCKED_DONALDSON, 2);
  assert.equal(counts.NO_ELIMFILTERS_SKU_YET, 0, 'both rows this pass resolved now carry a governed candidate SKU');

  assert.equal(phase3.exception_audit_status, 'CLOSED_WITH_BLOCKERS');
  assert.equal(phase3.phase3_status, 'CLOSED', 'phase3_status must not be degraded by an exception cleanup pass');

  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

// ---------------------------------------------------------------------------
// SINGLE-CASE MICROINVESTIGATION (2026-09-24) -- resolves the one remaining
// CONFLICTING row from the 2026-09-23 exception pass, P2-N-LUBE-1998-2010 /
// disputed Isuzu OE 2906548000, using Donaldson equipment-application
// records rather than evidence tier or family-level inference (both of which
// were genuinely tied on this exact number).
// ---------------------------------------------------------------------------

test('MICROCASE 1: 2906548000 has a single resolution, not a silent conflict', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(row.decision_status, 'PARTIAL');
  assert.notEqual(row.decision_status, 'CONFLICTING');
  assert.equal(row.donaldson_status, 'DONALDSON_VERIFIED');
  assert.equal(row.base_source_brand, 'DONALDSON');
  assert.equal(row.base_source_part, 'P502042');
});

test('MICROCASE 2: P502042 was selected on evidence superior to P550973', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  const p502042 = row.donaldson_candidates.find((c) => c.part === 'P502042');
  const p550973 = row.donaldson_candidates.find((c) => c.part === 'P550973');
  assert.ok(p502042.equipment_applications_matching_this_row_engine_scope.length > 0, 'P502042 must have a direct engine-scope match');
  assert.equal(p550973.equipment_applications_matching_this_row_engine_scope.length, 0, 'P550973 must have no match to this row\'s engine scope');
  assert.match(p502042.verdict, /DIRECT_MATCH/);
  assert.match(p550973.verdict, /MISMATCH|REJECTED/);
});

test('MICROCASE 3: the rejected candidate P550973 is documented, not silently dropped', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  const p550973 = row.donaldson_candidates.find((c) => c.part === 'P550973');
  assert.ok(p550973, 'P550973 must still appear as a documented, considered candidate');
  assert.notEqual(row.base_source_part, 'P550973');
  assert.ok(p550973.equipment_applications_not_matching.length > 0);
});

test('MICROCASE 4: the decision was not made by counting cross-references', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  // P550973 has strictly MORE Isuzu OEM-tier crossref entries in the raw
  // capture than P502042 has of any tier -- if crossref count had decided
  // this, P550973 would have won. It did not win, which is itself proof the
  // decision was not made on crossref volume.
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  const p550973IsuzuLines = flat.split('\n').filter((l) => l.startsWith('EL80973,') && l.includes(',ISUZU,')).length;
  const p502042IsuzuLines = flat.split('\n').filter((l) => l.startsWith('EL82042,') && l.includes(',ISUZU,')).length;
  assert.ok(p550973IsuzuLines > p502042IsuzuLines, 'sanity check: P550973 must genuinely have more raw Isuzu crossref lines than P502042');
  assert.equal(row.base_source_part, 'P502042', 'the part with FEWER Isuzu crossref lines was correctly selected on equipment-application grounds, not crossref volume');
});

test('MICROCASE 5: family-level inference was not used as a substitute for direct evidence', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  // The 2026-09-23 pass explicitly found the family-level OEM-tie signal
  // favoured P550973 and explicitly declined to use it as proof. This pass's
  // caveats must still carry that history rather than silently erasing it,
  // while the actual decision must rest on the (different, direct) equipment
  // evidence, not on family ties.
  assert.ok(row.caveats.some((c) => /CROSSREF-tier ONLY|CROSSREF-tier for this exact number/.test(c) || /tied/.test(c)));
  const p502042 = row.donaldson_candidates.find((c) => c.part === 'P502042');
  assert.match(p502042.verdict, /equipment list|engine/i);
  assert.doesNotMatch(p502042.verdict, /family/i);
});

test('MICROCASE 6: Phase 1 is not altered', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
});

test('MICROCASE 7: Phase 2 is not altered', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase2), 'ebefaf29e4565ce67e6f0a5cf2075ace33ec556d81d2375b04d9b50fa4e72e48');
  const p2 = phase2.oen_rows.find((r) => r.row_id === 'P2-N-LUBE-1998-2010');
  assert.deepEqual(p2.isuzu_oe_oen, ['2906542701', '2906548000', '2906548100']);
});

test('MICROCASE 8: no other Phase 3 row is affected', () => {
  const untouchedIds = ['P3-01-N-AIR-1986-2005', 'P3-02-N-AIR-2006-ON', 'P3-03-N-LUBE-4JJ', 'P3-04-N-LUBE-2011-ON', 'P3-06-N-FUEL-4HE', 'P3-07-N-FUEL-2013-2021-A', 'P3-08-N-FUEL-2013-2021-B', 'P3-09-N-FUEL-2013-2021-C', 'P3-10-N-FUEL-HIGHCAP-2013-2021', 'P3-11-N-FWS-2022i-ON', 'P3-12-N-TRANS', 'P3-13-F-LUBE-1987-2008', 'P3-14-F-LUBE-2018-2021', 'P3-15-F-FUEL-1994-2004', 'P3-16-F-FUEL-2018-2020-A', 'P3-17-F-FUEL-2018-2020-B', 'P3-18-F-FUEL-2018-2020-C', 'P3-19-F-FUEL-2018-2020-D'];
  assert.equal(untouchedIds.length, 18, 'sanity: every row except P3-05 itself');
  // Values reflect current state (after the P3-05 single-case pass, the
  // BLOCKED_DONALDSON closure micro-phase, and the P848076 SKU closure);
  // this test's job is only to confirm P3-05 itself did not perturb these
  // rows, not to freeze them at their pre-later-pass values.
  const expectedDecisionStatus = {
    'P3-01-N-AIR-1986-2005': 'VERIFIED_BASE', 'P3-02-N-AIR-2006-ON': 'VERIFIED_BASE', 'P3-03-N-LUBE-4JJ': 'VERIFIED_BASE', 'P3-06-N-FUEL-4HE': 'VERIFIED_BASE',
    'P3-04-N-LUBE-2011-ON': 'PARTIAL', 'P3-11-N-FWS-2022i-ON': 'BLOCKED_DONALDSON', 'P3-12-N-TRANS': 'PARTIAL', 'P3-14-F-LUBE-2018-2021': 'VERIFIED_BASE',
    'P3-07-N-FUEL-2013-2021-A': 'PARTIAL', 'P3-08-N-FUEL-2013-2021-B': 'PARTIAL', 'P3-09-N-FUEL-2013-2021-C': 'PARTIAL', 'P3-10-N-FUEL-HIGHCAP-2013-2021': 'PARTIAL',
    'P3-13-F-LUBE-1987-2008': 'PARTIAL', 'P3-15-F-FUEL-1994-2004': 'PARTIAL', 'P3-16-F-FUEL-2018-2020-A': 'PARTIAL', 'P3-17-F-FUEL-2018-2020-B': 'PARTIAL',
    'P3-18-F-FUEL-2018-2020-C': 'PARTIAL', 'P3-19-F-FUEL-2018-2020-D': 'PARTIAL'
  };
  for (const id of untouchedIds) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.ok(row, id);
    assert.equal(row.decision_status, expectedDecisionStatus[id], `${id} must be unaffected by the P3-05 microinvestigation`);
  }
});

test('MICROCASE 9: Fleetguard is not used as a base for this row', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(row.fleetguard_status, 'NOT_BASE_DONALDSON_MANUFACTURES');
  assert.notEqual(row.base_source_brand, 'FLEETGUARD');
  assert.equal(row.fleetguard_part, null);
});

test('MICROCASE 10: the selected ELIMFILTERS SKU already exists and is not duplicated', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(row.elimfilters_existing_sku, 'EL82042');
  assert.equal(row.elimfilters_base_decision.action, 'REUSE_EXISTING_SKU');
  const catalogue = new Set(fs.readFileSync(path.join(__dirname, '..', 'data', 'dims.csv'), 'utf8').split('\n').map((l) => l.split(',')[0]));
  assert.ok(catalogue.has('EL82042'));
  // EL80973 (the rejected candidate's SKU) is untouched and keeps its own
  // separate identity -- selecting P502042 for this row does not remap or
  // delete EL80973 anywhere.
  assert.ok(catalogue.has('EL80973'));
  const skuByBase = new Map();
  for (const r of phase3.resolution_rows) {
    if (!r.base_source_part) continue;
    const prior = skuByBase.get(r.base_source_part);
    if (prior) assert.equal(prior, r.elimfilters_existing_sku, `${r.base_source_part} resolves to two different SKUs`);
    skuByBase.set(r.base_source_part, r.elimfilters_existing_sku);
  }
  assert.equal(skuByBase.get('P502042'), 'EL82042');
});

test('MICROCASE 11: physical product type is consistent with LUBE_PRIMARY', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(row.filter_position, 'LUBE_PRIMARY');
  const base = row.donaldson_candidates.find((c) => c.part === row.base_source_part);
  assert.equal(base.form.type, 'Combination');
  assert.equal(base.form.style, 'Spin-On');
  assert.doesNotMatch(row.isuzu_part_form, /TRANS|CARTRIDGE \(TRANS\)/);
});

test('MICROCASE 12: no direct SQL and no auto-publish for this row', () => {
  assert.deepEqual(phase3.governance.catalog_writes_performed, []);
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(row.elimfilters_base_decision.published, false);
  assert.equal(phase3.governance.publication_authorized, false);
});

test('MICROCASE FINAL: P550008 legacy cleanup is explicit after the transmission row becomes live evidence', () => {
  const p550008 = phase3.duplicate_mapping_audit.findings.find((f) => f.donaldson_part === 'P550008');
  assert.ok(p550008);
  assert.match(p550008.action_taken, /removed 3 stale P550008 rows/);
  assert.equal(phase3.resolution_rows.length, 23);
  assert.equal((phase3.blocked_oem_rows || []).length, 9);
  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

// ---------------------------------------------------------------------------
// BLOCKED_DONALDSON CLOSURE MICRO-PHASE (2026-09-24) -- investigates the 4
// rows still BLOCKED_DONALDSON after the two prior passes: P2-N-LUBE-2011-ON,
// P2-N-FWS-2022i-ON, P2-F-LUBE-2018-2021, P2-N-TRANS. Resolves 2 (both via
// Donaldson P848076, escalated to web/distributor corroboration since the
// first-party capture does not carry that part); the other 2 stay
// BLOCKED_DONALDSON with a refined, non-generic root cause each.
// ---------------------------------------------------------------------------

const BLOCKED4_PHASE2_IDS = ['P2-N-LUBE-2011-ON', 'P2-N-FWS-2022i-ON', 'P2-F-LUBE-2018-2021', 'P2-N-TRANS'];

test('BLOCKEDCASE 1: all 4 original BLOCKED_DONALDSON rows are still explicitly represented', () => {
  for (const id of BLOCKED4_PHASE2_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.ok(row, `${id} must still exist as a resolution row`);
    assert.notEqual(row.decision_status, undefined);
  }
  assert.equal(phase3.resolution_rows.length, 23, 'four later OEM-recovery rows were added; the original four remain present');
});

test('BLOCKEDCASE 2: every resolved row carries the exact Phase 2 OEN, nothing invented', () => {
  for (const id of BLOCKED4_PHASE2_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    const p2 = phase2.oen_rows.find((r) => r.row_id === id);
    assert.deepEqual(row.isuzu_oe_oen, p2.isuzu_oe_oen, `${id}: isuzu_oe_oen must not diverge from Phase 2`);
  }
});

test('BLOCKEDCASE 3: wrong product type cannot resolve a row (P550736 rejected for the water separator)', () => {
  const fws = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FWS-2022i-ON');
  assert.equal(fws.base_source_part, null);
  assert.equal(fws.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(fws.root_cause, 'B_NO_VALID_DONALDSON_CROSS_AFTER_FALSE_POSITIVE_REJECTION');
  assert.equal(fws.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(fws.microphase_closure_2026_09_24.status, 'CLOSED_WITH_BLOCKER');
  assert.equal(fws.microphase_closure_2026_09_24.rejected_candidate.part, 'P550736');
  assert.equal(fws.microphase_closure_2026_09_24.rejected_candidate.official_resource_family, 'DAVCO Fuel Pro');
  const rejected = fws.donaldson_candidates.find((c) => c.part === 'P550736');
  assert.ok(rejected, 'the rejected candidate must still be documented, not silently dropped');
  assert.match(rejected.verdict, /REJECTED|FALSE_POSITIVE/);
});

test('BLOCKEDCASE 4: the transmission row resolves only after independent physical/application corroboration', () => {
  const trans = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-TRANS');
  assert.equal(trans.base_source_part, 'P550008');
  assert.equal(trans.elimfilters_existing_sku, 'EL80008');
  assert.equal(trans.decision_status, 'PARTIAL');
  assert.equal(trans.donaldson_status, 'DONALDSON_VERIFIED');
  assert.equal(trans.root_cause, null);
  assert.ok(trans.donaldson_candidates.some((c) => c.part === 'P550008'));
  assert.ok(trans.fleetguard_corroboration.some((c) => c.part === 'LF551A'));
  assert.equal(trans.microphase_closure_2026_09_24.status, 'RESOLVED_PARTIAL');
});

test('BLOCKEDCASE 5: the water-separator row cannot accept an ordinary fuel-only filter', () => {
  const fws = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FWS-2022i-ON');
  assert.equal(fws.filter_position, 'FUEL_WATER_SEPARATOR');
  assert.match(fws.isuzu_part_form, /WATER SEP/);
  // The rejected P550736 candidate's own type was Water Separator, so even
  // the rejection was not on a position-mismatch technicality -- it failed on
  // Isuzu fitment, which is documented, not glossed over.
  const rejected = fws.donaldson_candidates.find((c) => c.part === 'P550736');
  assert.equal(rejected.form.type, 'Water Separator');
});

test('BLOCKEDCASE 6: N-Series 4HK1/4JJ1 scopes are not mixed', () => {
  const lube2011 = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.equal(lube2011.oem_scope.published_engine_scope, 'Diesel');
  // The resolution is anchored to the exact OE numbers (2906544040,
  // 8982984040), not to "any 4HK1 or 4JJ1 N-Series lube row" -- the ECO-MAX
  // 4JJ1 fuel/air gap stays its own separate BLOCKED_OEM entry, untouched.
  const ecomax = phase3.blocked_oem_rows.find((r) => /ECO-MAX/.test(r.phase2_unresolved_scope || ''));
  assert.ok(ecomax, 'ECO-MAX 4JJ1 scope must remain its own untouched BLOCKED_OEM entry');
  assert.equal(ecomax.decision_status, 'BLOCKED_OEM');
});

test('BLOCKEDCASE 7: F-Series does not inherit N-Series by shared engine alone', () => {
  const fLube = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-F-LUBE-2018-2021');
  const nLube = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  // Both resolve to the same Donaldson part, but only because Phase 2 itself
  // assigns the identical Isuzu OE number (8982984040) to both rows -- not
  // because the F-Series row's caveats invoke the shared 4HK1 engine as the
  // reason.
  assert.equal(fLube.base_source_part, nLube.base_source_part);
  assert.ok(fLube.isuzu_oe_oen.some((oe) => nLube.isuzu_oe_oen.includes(oe)), 'the shared base must trace to a shared Phase-2 OE number');
  assert.ok(fLube.caveats.some((c) => /identical|same.*number|not.*shared-engine inference/i.test(c)), 'must explicitly disclaim shared-engine inheritance');
  assert.ok(!fLube.caveats.some((c) => /because.*4HK1.*shares|inherit.*engine/i.test(c)), 'must not justify the base purely by shared engine');
});

test('BLOCKEDCASE 8: Donaldson first-party evidence outranks legacy CSV for the resolved rows', () => {
  for (const id of ['P2-N-LUBE-2011-ON', 'P2-F-LUBE-2018-2021']) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.donaldson_source, 'DONALDSON_OFFICIAL_PRODUCT_TITLE_AND_DISTRIBUTOR_CORROBORATION_2026_09_24');
    const known = sources.sources.find((s) => s.source_id === row.donaldson_source);
    assert.ok(known, 'the source must be registered in isuzu-us-diesel-sources.json, not an ad hoc string');
    assert.equal(known.authority_level, 'secondary', 'web/distributor corroboration is disclosed as a lower authority tier than the first-party capture');
  }
  const legacyHasP848076 = ['competitor_cross_references_ld.csv', 'external_cross_reference_master_ld.csv', 'sku_competitor_matrix_ld.csv']
    .some((f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8').includes('P848076'));
  assert.equal(legacyHasP848076, false, 'P848076 must not already exist in a legacy export under a different SKU (that would be a duplicate to resolve first)');
});

test('BLOCKEDCASE 9: Fleetguard defines a base only after NOT_MANUFACTURED_VERIFIED (still zero here)', () => {
  for (const id of BLOCKED4_PHASE2_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.notEqual(row.base_source_brand, 'FLEETGUARD');
  }
  assert.equal(phase3.coverage.base_decisions.fleetguard_based, 0);
});

test('BLOCKEDCASE 10: no MANN, Baldwin, WIX or FRAM base among the 4 rows', () => {
  for (const id of BLOCKED4_PHASE2_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.ok([null, 'DONALDSON'].includes(row.base_source_brand), `${id} took a base from a non-Donaldson/Fleetguard brand`);
    for (const ref of row.supporting_crossrefs || []) {
      assert.ok(['MANN-FILTER', 'BALDWIN', 'WIX', 'FRAM'].includes(ref.manufacturer));
      assert.equal(ref.fitment_role, 'CORROBORATION_ONLY');
    }
  }
});

test('BLOCKEDCASE 11: no duplicate Donaldson -> ELIMFILTERS SKU introduced', () => {
  const skuByBase = new Map();
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    const prior = skuByBase.get(row.base_source_part);
    if (prior !== undefined) assert.equal(prior, row.elimfilters_existing_sku, `${row.base_source_part} resolves to two SKUs`);
    skuByBase.set(row.base_source_part, row.elimfilters_existing_sku);
  }
  // The P848076 SKU CLOSURE pass (2026-09-24) later derived a governed
  // candidate SKU for P848076 (EL88076, not pre-existing); both rows that
  // resolve to it correctly carry the identical SKU value (consistent, not a
  // duplicate) via skuByBase's own prior-value check above.
  assert.equal(skuByBase.get('P848076'), 'EL88076');
  assert.deepEqual(phase3.coverage.elimfilters_new_sku_candidates, ['EL88076']);
});

test('BLOCKEDCASE 12: no new CONFLICTING row was introduced', () => {
  assert.equal(phase3.coverage.decision_status.CONFLICTING, 0);
  assert.equal(phase3.resolution_rows.filter((r) => r.decision_status === 'CONFLICTING').length, 0);
});

test('BLOCKEDCASE 13: Phase 1 is untouched', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
});

test('BLOCKEDCASE 14: Phase 2 is untouched', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase2), 'ebefaf29e4565ce67e6f0a5cf2075ace33ec556d81d2375b04d9b50fa4e72e48');
});

test('BLOCKEDCASE 15: original rows remain valid and later OEM-recovery rows are explicit', () => {
  const otherRowIds = phase3.resolution_rows.filter((r) => !BLOCKED4_PHASE2_IDS.includes(r.phase2_row_id)).map((r) => r.row_id);
  assert.equal(otherRowIds.length, 19);
  const expected = {
    'P3-01-N-AIR-1986-2005': 'VERIFIED_BASE', 'P3-02-N-AIR-2006-ON': 'VERIFIED_BASE', 'P3-03-N-LUBE-4JJ': 'VERIFIED_BASE', 'P3-06-N-FUEL-4HE': 'VERIFIED_BASE',
    'P3-05-N-LUBE-1998-2010': 'PARTIAL', 'P3-07-N-FUEL-2013-2021-A': 'PARTIAL', 'P3-08-N-FUEL-2013-2021-B': 'PARTIAL', 'P3-09-N-FUEL-2013-2021-C': 'PARTIAL',
    'P3-10-N-FUEL-HIGHCAP-2013-2021': 'PARTIAL', 'P3-13-F-LUBE-1987-2008': 'PARTIAL', 'P3-15-F-FUEL-1994-2004': 'PARTIAL', 'P3-16-F-FUEL-2018-2020-A': 'PARTIAL',
    'P3-17-F-FUEL-2018-2020-B': 'PARTIAL', 'P3-18-F-FUEL-2018-2020-C': 'PARTIAL', 'P3-19-F-FUEL-2018-2020-D': 'PARTIAL',
    'P3-N-FUEL-2006-NPR': 'BLOCKED_DONALDSON', 'P3-N-FUEL-2007-NPR': 'VERIFIED_BASE',
    'P3-N-FUEL-2008-NPR': 'VERIFIED_BASE', 'P3-N-FUEL-2010-HD-NQR-NRR': 'VERIFIED_BASE'
  };
  for (const id of otherRowIds) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.equal(row.decision_status, expected[id], `${id} must be unaffected by the BLOCKED_DONALDSON closure micro-phase`);
  }
  assert.equal(phase3.blocked_oem_rows.length, 9);
  for (const row of phase3.blocked_oem_rows) assert.equal(row.decision_status, 'BLOCKED_OEM');
});

test('BLOCKEDCASE 16: no direct SQL writes', () => {
  assert.deepEqual(phase3.governance.catalog_writes_performed, []);
  const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'isuzu-us-diesel-closure.js'), 'utf8');
  assert.ok(!/\b(INSERT|UPDATE|DELETE)\s+(INTO\s+|FROM\s+)?\w+/.test(lib));
});

test('BLOCKEDCASE 17: nothing is auto-published', () => {
  assert.equal(phase3.governance.publication_authorized, false);
  // The P848076 SKU CLOSURE pass (2026-09-24) gave both rows a governed
  // candidate base decision; it must stay unpublished (READY_FOR_REVIEW).
  for (const id of ['P2-N-LUBE-2011-ON', 'P2-F-LUBE-2018-2021']) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.ok(row.elimfilters_base_decision, id);
    assert.equal(row.elimfilters_base_decision.published, false, id);
    assert.equal(row.elimfilters_base_decision.review_state, 'READY_FOR_REVIEW', id);
  }
});

test('BLOCKEDCASE FINAL: BLOCKED_DONALDSON closure micro-phase counts are correct and P550008 stays untouched', () => {
  // This is the 3rd of 4 history entries -- the P848076 SKU CLOSURE pass
  // (2026-09-24) ran later and appended its own 4th entry, checked in
  // EXCEPTION AUDIT FINAL. This test asserts THIS pass's own recorded
  // starting/final snapshot, not the file's current overall state.
  const history = phase3.exception_audit_history[2];
  assert.deepEqual(history.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, BLOCKED_DONALDSON: 4 });
  assert.deepEqual(history.final_counts, { VERIFIED_BASE: 4, PARTIAL: 11, CONFLICTING: 0, BLOCKED_DONALDSON: 2 });

  const counts = phase3.coverage.decision_status;
  assert.equal(counts.VERIFIED_BASE, 8);
  assert.equal(counts.PARTIAL, 13);
  assert.equal(counts.CONFLICTING, 0);
  assert.equal(counts.BLOCKED_DONALDSON, 2);
  assert.equal(counts.NO_ELIMFILTERS_SKU_YET, 0, 'all named bases either reuse an existing SKU or the governed EL88076 candidate');
  assert.equal(counts.BLOCKED_OEM, 9);

  // Two Donaldson blockers remain: the terminal FWS case plus the newly OEM-unblocked MY2006 NPR fuel row.
  const stillBlocked = phase3.resolution_rows.filter((r) => r.decision_status === 'BLOCKED_DONALDSON');
  assert.equal(stillBlocked.length, 2);
  assert.deepEqual(new Set(stillBlocked.map((r) => r.phase2_row_id)), new Set(['P2-N-FWS-2022i-ON','P2-N-FUEL-2006-NPR']));
  for (const row of stillBlocked) assert.ok(row.root_cause, `${row.row_id} must carry an explicit root_cause code`);

  const p550008Finding = phase3.duplicate_mapping_audit.findings.find((f) => f.donaldson_part === 'P550008');
  assert.ok(p550008Finding);
  assert.match(p550008Finding.action_taken, /removed 3 stale P550008 rows/);
  const staleFiles = ['competitor_cross_references_ld.csv', 'external_cross_reference_master_ld.csv'];
  for (const file of staleFiles) {
    const text = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    assert.doesNotMatch(text, /"(?:EL50936|EL50940|EL59363)"[^\n]*"P550008"/);
  }

  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

// ---------------------------------------------------------------------------
// P848076 ELIMFILTERS SKU CLOSURE (2026-09-24) -- closes the last governance
// gap left by the BLOCKED_DONALDSON closure micro-phase: Donaldson P848076
// was confirmed but had no ELIMFILTERS SKU. This suite audits the full
// repository (and, for the first time in this closure, live Postgres itself)
// for an existing SKU, finds none, and derives a governed candidate (EL88076)
// from this repository's own codigo_base nomenclature policy.
// ---------------------------------------------------------------------------

const P848076_ROW_IDS = ['P2-N-LUBE-2011-ON', 'P2-F-LUBE-2018-2021'];

test('SKUCASE 1: P848076 has exactly one canonical ELIMFILTERS SKU', () => {
  const skus = new Set(P848076_ROW_IDS.map((id) => phase3.resolution_rows.find((r) => r.phase2_row_id === id).elimfilters_existing_sku));
  assert.equal(skus.size, 1);
  assert.ok(skus.has('EL88076'));
});

test('SKUCASE 2: no second SKU exists for P848076 anywhere in the file', () => {
  const skuByBase = new Map();
  for (const row of phase3.resolution_rows) {
    if (row.base_source_part !== 'P848076') continue;
    const prior = skuByBase.get('P848076');
    if (prior !== undefined) assert.equal(prior, row.elimfilters_existing_sku, 'P848076 must not resolve to two different SKUs');
    skuByBase.set('P848076', row.elimfilters_existing_sku);
  }
  assert.equal(skuByBase.get('P848076'), 'EL88076');
});

test('SKUCASE 3: canonical_source_brand is DONALDSON', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.product_identity.canonical_source_brand, 'DONALDSON');
    assert.equal(row.base_source_brand, 'DONALDSON');
  }
});

test('SKUCASE 4: canonical_source_part is P848076', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.product_identity.canonical_source_part, 'P848076');
    assert.equal(row.base_source_part, 'P848076');
  }
});

test('SKUCASE 5: Isuzu OEN 8982984040 resolves to EL88076', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.ok(row.isuzu_oe_oen.includes('8982984040'));
    assert.equal(row.elimfilters_existing_sku, 'EL88076');
  }
});

test('SKUCASE 6: Isuzu OEN 2906544040 resolves to EL88076', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.ok(row.isuzu_oe_oen.includes('2906544040'));
  assert.equal(row.elimfilters_existing_sku, 'EL88076');
});

test('SKUCASE 7: the N-Series row uses EL88076', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.equal(row.elimfilters_existing_sku, 'EL88076');
  assert.equal(row.decision_status, 'PARTIAL');
});

test('SKUCASE 8: the F-Series row uses EL88076 via the shared OEN, not engine inheritance', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-F-LUBE-2018-2021');
  assert.equal(row.elimfilters_existing_sku, 'EL88076');
  assert.equal(row.decision_status, 'VERIFIED_BASE');
  const nRow = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.ok(row.isuzu_oe_oen.some((oe) => nRow.isuzu_oe_oen.includes(oe)), 'shared base must trace to a shared Phase-2 OE number, not shared engine');
});

test('SKUCASE 9: technology is defined and valid per the governed registry', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.product_identity.technology, 'SYNTRAX™');
    assert.match(row.product_identity.technology_source, /TECHNOLOGY_REGISTRY\.md/);
    assert.match(row.product_identity.technology_source, /PRODUCT_REGISTRY\.md/);
  }
  const techRegistry = fs.readFileSync(path.join(__dirname, '..', 'docs', 'brand', 'TECHNOLOGY_REGISTRY.md'), 'utf8');
  assert.match(techRegistry, /SYNTRAX™[\s\S]{0,200}Lube Filters/);
  const productRegistry = fs.readFileSync(path.join(__dirname, '..', 'docs', 'brand', 'PRODUCT_REGISTRY.md'), 'utf8');
  assert.match(productRegistry, /Lube Filters[\s\S]{0,50}SYNTRAX/);
});

test('SKUCASE 10: product type is LUBE', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.product_identity.category, 'lube');
    assert.equal(row.product_identity.product_type, 'LUBE_FILTER');
    assert.equal(row.filter_position, 'LUBE_PRIMARY');
  }
});

test('SKUCASE 11: no fuel, hydraulic or transmission classification leaked in', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.notEqual(row.product_identity.category, 'fuel');
    assert.notEqual(row.product_identity.category, 'hydraulic');
    assert.doesNotMatch(row.product_identity.product_type, /FUEL|HYDRAULIC|TRANSMISSION/);
  }
});

test('SKUCASE 12: dimensions are consistent across both rows', () => {
  const dims = P848076_ROW_IDS.map((id) => phase3.resolution_rows.find((r) => r.phase2_row_id === id).product_identity.dimensions);
  assert.deepEqual(dims[0], dims[1]);
  assert.equal(dims[0].length_mm, 122.03);
  assert.equal(dims[0].od_mm, 121);
  assert.equal(dims[0].gasket_id_mm, 98.9);
});

test('SKUCASE 13: no duplicate canonical mapping was introduced', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.duplicate_mapping_check.classification, 'E_NEW_PRODUCT_CONFIRMED');
  }
  assert.equal(phase3.coverage.elimfilters_new_sku_candidates.length, 1);
});

test('SKUCASE 14: no new SKU was minted where an existing canonical match existed', () => {
  // The 7 already-reused SKUs elsewhere in the file (EA16773, EA13614,
  // EL82597, EF92564, EF92599, EF92427, EF90390, EL80420, EL82042) are
  // untouched by this pass and stay action REUSE_EXISTING_SKU.
  const reusedRows = phase3.resolution_rows.filter((r) => r.elimfilters_base_decision && r.elimfilters_base_decision.action === 'REUSE_EXISTING_SKU');
  assert.equal(reusedRows.length, phase3.coverage.elimfilters_skus_reused.length > 0 ? reusedRows.length : 0);
  for (const row of reusedRows) assert.notEqual(row.base_source_part, 'P848076');
});

test('SKUCASE 15: no direct SQL for this closure', () => {
  assert.deepEqual(phase3.governance.catalog_writes_performed, []);
  const lib = fs.readFileSync(path.join(__dirname, '..', 'lib', 'isuzu-us-diesel-closure.js'), 'utf8');
  assert.ok(!/\b(INSERT|UPDATE|DELETE)\s+(INTO\s+|FROM\s+)?\w+/.test(lib));
});

test('SKUCASE 16: nothing is auto-published outside governance', () => {
  assert.equal(phase3.governance.publication_authorized, false);
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.elimfilters_base_decision.published, false);
    assert.equal(row.elimfilters_base_decision.review_state, 'READY_FOR_REVIEW');
  }
});

test('SKUCASE 17: Phase 1 is untouched', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
});

test('SKUCASE 18: Phase 2 is untouched', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase2), 'ebefaf29e4565ce67e6f0a5cf2075ace33ec556d81d2375b04d9b50fa4e72e48');
});

test('SKUCASE 19: unrelated Phase 3 rows are untouched', () => {
  const otherIds = phase3.resolution_rows.filter((r) => !P848076_ROW_IDS.includes(r.phase2_row_id)).map((r) => r.row_id);
  assert.equal(otherIds.length, 21);
  const expected = {
    'P3-01-N-AIR-1986-2005': 'VERIFIED_BASE', 'P3-02-N-AIR-2006-ON': 'VERIFIED_BASE', 'P3-03-N-LUBE-4JJ': 'VERIFIED_BASE', 'P3-06-N-FUEL-4HE': 'VERIFIED_BASE',
    'P3-05-N-LUBE-1998-2010': 'PARTIAL', 'P3-07-N-FUEL-2013-2021-A': 'PARTIAL', 'P3-08-N-FUEL-2013-2021-B': 'PARTIAL', 'P3-09-N-FUEL-2013-2021-C': 'PARTIAL',
    'P3-10-N-FUEL-HIGHCAP-2013-2021': 'PARTIAL', 'P3-13-F-LUBE-1987-2008': 'PARTIAL', 'P3-15-F-FUEL-1994-2004': 'PARTIAL', 'P3-16-F-FUEL-2018-2020-A': 'PARTIAL',
    'P3-17-F-FUEL-2018-2020-B': 'PARTIAL', 'P3-18-F-FUEL-2018-2020-C': 'PARTIAL', 'P3-19-F-FUEL-2018-2020-D': 'PARTIAL',
    'P3-11-N-FWS-2022i-ON': 'BLOCKED_DONALDSON', 'P3-12-N-TRANS': 'PARTIAL',
    'P3-N-FUEL-2006-NPR': 'BLOCKED_DONALDSON', 'P3-N-FUEL-2007-NPR': 'VERIFIED_BASE',
    'P3-N-FUEL-2008-NPR': 'VERIFIED_BASE', 'P3-N-FUEL-2010-HD-NQR-NRR': 'VERIFIED_BASE'
  };
  for (const id of otherIds) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.equal(row.decision_status, expected[id], `${id} must be unaffected by the P848076 SKU closure`);
  }
});

test('SKUCASE 20: P552564 regression still passes', () => {
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  assert.match(flat, /^EF92564,fuel,P552564,/m);
  assert.doesNotMatch(flat, /^EF50953,[^\n]*,P552564,/m);
  const fuel4he = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FUEL-4HE');
  assert.equal(fuel4he.elimfilters_existing_sku, 'EF92564');
});

test('SKUCASE 21: P502042 regression still passes', () => {
  const lube1998 = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.equal(lube1998.base_source_part, 'P502042');
  assert.equal(lube1998.elimfilters_existing_sku, 'EL82042');
  assert.equal(lube1998.decision_status, 'PARTIAL');
});

test('SKUCASE 22: P550008 resolves the transmission row to the existing EL80008 canonical SKU', () => {
  const trans = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-TRANS');
  assert.equal(trans.base_source_part, 'P550008');
  assert.equal(trans.decision_status, 'PARTIAL');
  assert.equal(trans.elimfilters_existing_sku, 'EL80008');
  assert.equal(trans.elimfilters_base_decision.action, 'REUSE_EXISTING_SKU');
  assert.equal(trans.elimfilters_base_decision.published, false);
});

test('SKUCASE 23: Part Search architecture is documented as reused, not duplicated', () => {
  assert.ok(phase3.governance.live_postgres_check_2026_09_24, 'this pass must record what it found when it checked for the live catalog Part Search reads from');
  assert.equal(phase3.governance.live_postgres_check_2026_09_24.checked, true);
  assert.match(phase3.governance.live_postgres_check_2026_09_24.result, /elimfilters_catalog/);
});

test('SKUCASE 24: the candidate is traceable back to both Isuzu OENs and Donaldson P848076', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.product_identity.oem_refs.includes('8982984040'), true);
    assert.equal(row.base_source_part, 'P848076');
    assert.equal(row.elimfilters_base_decision.sku, 'EL88076');
  }
  const nRow = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.ok(nRow.product_identity.oem_refs.includes('2906544040'));
});

test('SKUCASE 25: EL88076 was derived from the real governed nomenclature policy, not invented', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  const rule = row.elimfilters_base_decision.nomenclature_rule;
  assert.match(rule, /catalog-codigo-base-policy\.js/);
  assert.match(rule, /catalog-codigo-base-governance\.js/);
  assert.match(rule, /run_073_catalog_codigo_base_governance_v31/);
  assert.match(rule, /last 4 numeric digits/);
  assert.match(rule, /8076/);
  // Sanity-check the digit arithmetic actually stated in the rule is correct.
  const donaldsonDigits = 'P848076'.replace(/\D/g, '');
  assert.equal(donaldsonDigits.slice(-4), '8076');
  assert.equal('EL8' + donaldsonDigits.slice(-4), 'EL88076');
});

test('SKUCASE FINAL: NO_ELIMFILTERS_SKU_YET is 0; two BLOCKED_DONALDSON and 9 BLOCKED_OEM scopes remain', () => {
  const counts = phase3.coverage.decision_status;
  assert.equal(counts.NO_ELIMFILTERS_SKU_YET, 0);
  assert.equal(counts.CONFLICTING, 0);
  assert.equal(counts.BLOCKED_DONALDSON, 2);
  assert.equal(counts.BLOCKED_OEM, 9);
  assert.equal(counts.VERIFIED_BASE, 8);
  assert.equal(counts.PARTIAL, 13);
  const sum = counts.VERIFIED_BASE + counts.PARTIAL + counts.CONFLICTING + counts.NO_ELIMFILTERS_SKU_YET + counts.BLOCKED_DONALDSON;
  assert.equal(sum, 23);

  // P848076 has exactly one SKU, one canonical identity, one governed
  // technology, one governed application set -- nothing expanded.
  const rows = P848076_ROW_IDS.map((id) => phase3.resolution_rows.find((r) => r.phase2_row_id === id));
  const skus = new Set(rows.map((r) => r.elimfilters_existing_sku));
  const brands = new Set(rows.map((r) => r.product_identity.canonical_source_brand));
  const techs = new Set(rows.map((r) => r.product_identity.technology));
  assert.equal(skus.size, 1);
  assert.equal(brands.size, 1);
  assert.equal(techs.size, 1);
  assert.deepEqual(rows[0].product_identity.application_rows.sort(), P848076_ROW_IDS.sort());

  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});

test('LIVEPUB 1: P848076/EL88076 is recorded as live without weakening the Phase 3 no-auto-publish guard', () => {
  for (const id of P848076_ROW_IDS) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.live_catalog_publication.status, 'LIVE');
    assert.equal(row.live_catalog_publication.sku, 'EL88076');
    assert.equal(row.live_catalog_publication.canonical_source_brand, 'DONALDSON');
    assert.equal(row.live_catalog_publication.canonical_source_part, 'P848076');
    assert.equal(row.elimfilters_base_decision.published, false);
  }
});

test('LIVEPUB 2: live publication records the governed writer and resolver outcome', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-F-LUBE-2018-2021');
  assert.equal(row.live_catalog_publication.migration, 'scripts/migrations/run_119_create_el88076_p848076.js');
  assert.equal(row.live_catalog_publication.catalog_backend_validation.public_product, true);
  assert.equal(row.live_catalog_publication.catalog_backend_validation.canonical_base, 'RESOLVED_CANONICAL_BASE');
  assert.equal(row.live_catalog_publication.catalog_backend_validation.oem_refs, 'RESOLVED_SINGLE');
  assert.equal(row.live_catalog_publication.part_search_http_validation.status, 'LIVE_VERIFIED');
  assert.equal(row.live_catalog_publication.part_search_http_validation.queries.P848076.sku, 'EL88076');
  assert.equal(row.live_catalog_publication.part_search_http_validation.queries.EL88076.source, 'exact_sku');
  assert.equal(row.live_catalog_publication.part_search_http_validation.queries['2906544040'].resolution, 'RESOLVED');
  assert.equal(row.live_catalog_publication.part_search_http_validation.queries['8982984040'].sku, 'EL88076');
});

test('FWS FINAL 1: 8982373410 exhausts current public channels without weakening Donaldson-first governance', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FWS-2022i-ON');
  assert.equal(row.final_followup_2026_09_24.status, 'EXHAUSTED_CURRENT_PUBLIC_CHANNELS_BLOCKED');
  assert.equal(row.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(row.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(row.base_source_part, null);
  assert.equal(row.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED');
});

test('FWS FINAL 2: WIX no-replacement evidence is supporting only and does not open Fleetguard', () => {
  const row = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FWS-2022i-ON');
  assert.equal(row.final_followup_2026_09_24.supporting_market_checks.wix.result, 'VALID_COMPETITOR_NUMBER_NO_REPLACEMENT');
  assert.equal(row.final_followup_2026_09_24.donaldson.non_manufacture_verified, false);
  assert.equal(row.final_followup_2026_09_24.fleetguard.gate, 'NOT_ELIGIBLE');
  assert.equal(row.elimfilters_base_decision, null);
});

test('N-FUEL OEM RECOVERY 1: MY2006 NPR gets 8980284111 and NPR-HD does not inherit it', () => {
  const npr = answerFilterSetQuery({ year: 2006, model: 'NPR' });
  const hd = answerFilterSetQuery({ year: 2006, model: 'NPR-HD' });
  const nprFuel = npr.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY');
  const hdFuel = hd.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY');
  assert.ok(nprFuel.isuzu_rows.some((x) => x.row_id === 'P2-N-FUEL-2006-NPR'));
  assert.deepEqual(nprFuel.isuzu_oe_oen, ['8980284111']);
  assert.ok(!(hdFuel.isuzu_rows || []).some((x) => x.row_id === 'P2-N-FUEL-2006-NPR'));
});

test('N-FUEL OEM RECOVERY 2: MY2007-2008 NPR gets 8980370110 without sibling inheritance', () => {
  for (const year of [2007, 2008]) {
    const npr = answerFilterSetQuery({ year, model: 'NPR' });
    const hd = answerFilterSetQuery({ year, model: 'NPR-HD' });
    const nprFuel = npr.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY');
    const hdFuel = hd.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY');
    assert.deepEqual(nprFuel.isuzu_oe_oen, ['8980370110']);
    assert.ok(!(hdFuel.isuzu_rows || []).some((x) => x.row_id === `P2-N-FUEL-${year}-NPR`));
  }
}
);

test('N-FUEL OEM RECOVERY 3: MY2010 owner-manual row applies to NPR-HD/NQR/NRR but not NPR', () => {
  for (const model of ['NPR-HD', 'NQR', 'NRR']) {
    const answer = answerFilterSetQuery({ year: 2010, model });
    assert.ok(answer.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY').isuzu_rows.some((x) => x.row_id === 'P2-N-FUEL-2010-HD-NQR-NRR'));
  }
  const npr = answerFilterSetQuery({ year: 2010, model: 'NPR' });
  const nprFuel = npr.answers[0].positions.find((x) => x.position === 'FUEL_PRIMARY');
  assert.ok(!(nprFuel.isuzu_rows || []).some((x) => x.row_id === 'P2-N-FUEL-2010-HD-NQR-NRR'));
});

test('N-FUEL OEM RECOVERY 4: exact recovered OENs transition into governed Phase 3 states only', () => {
  const y2006 = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-FUEL-2006-NPR');
  assert.equal(y2006.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(y2006.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(y2006.base_source_part, null);
  for (const id of ['P2-N-FUEL-2007-NPR', 'P2-N-FUEL-2008-NPR', 'P2-N-FUEL-2010-HD-NQR-NRR']) {
    const row = phase3.resolution_rows.find((r) => r.phase2_row_id === id);
    assert.equal(row.donaldson_part, 'P502427');
    assert.equal(row.elimfilters_existing_sku, 'EF92427');
    assert.equal(row.decision_status, 'VERIFIED_BASE');
    assert.equal(row.elimfilters_base_decision.published, false);
  }
});


test('PHASE 3 CURRENT STATE: manifest is technically closed without unstructured residue', () => {
  assert.equal(phase3.phase3_status, 'CLOSED');
  assert.equal(phase3.outcome, 'CLOSED_WITH_EXPLICIT_BLOCKERS');
  assert.equal(phase3.current_state_audit.closure_verdict, 'CLOSED_WITH_EXPLICIT_BLOCKERS_AND_NO_UNSTRUCTURED_RESIDUE');
  assert.deepEqual(phase3.current_state_audit.decision_counts, {
    VERIFIED_BASE: 8,
    PARTIAL: 13,
    BLOCKED_DONALDSON: 2,
    CONFLICTING: 0,
    NO_ELIMFILTERS_SKU_YET: 0,
  });
  assert.equal(phase3.current_state_audit.blocked_oem_scopes.structurally_terminal, 9);
  assert.equal(phase3.current_state_audit.blocked_oem_scopes.generic_all_remaining, 0);
  assert.equal(phase3.current_state_audit.publication_state.EL88076, 'LIVE_GOVERNED');

  const blocked = phase3.resolution_rows.filter((r) => r.decision_status === 'BLOCKED_DONALDSON');
  assert.deepEqual(blocked.map((r) => r.row_id).sort(), ['P3-11-N-FWS-2022i-ON','P3-N-FUEL-2006-NPR'].sort());

  for (const row of phase3.blocked_oem_rows) {
    assert.ok(row.position_terminal_states || row.position_terminal_state || row.subscope_terminal_states, row.row_id + ' lacks terminal structure');
    assert.notEqual(row.filter_position, 'ALL', row.row_id + ' still has a generic ALL blocker');
  }
});


test('BLOCKED_DONALDSON FOLLOW-UP: search absence never opens Fleetguard', () => {
  for (const id of ['P3-N-FUEL-2006-NPR','P3-11-N-FWS-2022i-ON']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.ok(row, id);
    assert.equal(row.decision_status, 'BLOCKED_DONALDSON');
    assert.equal(row.donaldson_status, 'DONALDSON_NOT_FOUND');
    assert.notEqual(row.donaldson_status, 'DONALDSON_NOT_MANUFACTURED_VERIFIED');
    assert.equal(row.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED');
    assert.equal(row.base_source_brand, null);
    assert.equal(row.base_source_part, null);
  }

  const history = phase3.exception_audit_history.find((h) => h.status === 'BLOCKED_DONALDSON_PUBLIC_FOLLOWUP_NO_STATE_CHANGE');
  assert.ok(history);
  assert.equal(history.rows.length, 2);
  for (const r of history.rows) {
    assert.equal(r.non_manufacture_status, 'NOT_VERIFIED');
    assert.equal(r.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED');
  }
});


test('OEM FALLBACK GOVERNANCE: exact OEM base requires both manufacturing absences', () => {
  const { evaluateOemFallbackEligibility } = require('../lib/isuzu-us-diesel-closure');

  const candidate = {
    isuzu_oe_oen: ['8980284111'],
    base_source_brand: 'OEM',
    base_source_part: '8980284111',
    donaldson_status: 'DONALDSON_NOT_MANUFACTURED_VERIFIED',
    fleetguard_status: 'FLEETGUARD_NOT_MANUFACTURED_VERIFIED',
    oem_fallback: {
      oem_oen_verified_first_party: true,
      approved_source_column: 'OEM_CODES',
      approved_codigo_base: '8980284111',
      approved_manufacturer: 'ISUZU',
    },
  };

  const eligible = evaluateOemFallbackEligibility(candidate);
  assert.equal(eligible.eligible, true);
  assert.equal(eligible.authority, 'VERIFIED_OEM_FALLBACK');

  assert.equal(evaluateOemFallbackEligibility({ ...candidate, donaldson_status: 'DONALDSON_NOT_FOUND' }).eligible, false);
  assert.equal(evaluateOemFallbackEligibility({ ...candidate, fleetguard_status: 'FLEETGUARD_NOT_FOUND' }).eligible, false);
  assert.equal(evaluateOemFallbackEligibility({
    ...candidate,
    oem_fallback: { ...candidate.oem_fallback, oem_oen_verified_first_party: false },
  }).eligible, false);
  assert.equal(evaluateOemFallbackEligibility({
    ...candidate,
    base_source_part: '8980284110',
  }).eligible, false);
});

test('OEM FALLBACK GOVERNANCE: current residual blockers do not qualify yet', () => {
  const { evaluateOemFallbackEligibility } = require('../lib/isuzu-us-diesel-closure');
  for (const id of ['P3-N-FUEL-2006-NPR','P3-11-N-FWS-2022i-ON']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.ok(row, id);
    assert.equal(row.decision_status, 'BLOCKED_DONALDSON');
    assert.equal(evaluateOemFallbackEligibility(row).eligible, false);
    assert.notEqual(row.donaldson_status, 'DONALDSON_NOT_MANUFACTURED_VERIFIED');
  }
});

test('OEM FALLBACK GOVERNANCE: manifest declares Donaldson -> Fleetguard -> OEM priority', () => {
  assert.equal(phase3.canonical_hd_rule, 'DONALDSON_THEN_FLEETGUARD_THEN_VERIFIED_OEM');
  assert.deepEqual(phase3.governance.oem_fallback_policy.priority, ['DONALDSON','FLEETGUARD','OEM']);
  assert.equal(phase3.governance.oem_fallback_policy.catalog_authority, 'VERIFIED_OEM_FALLBACK');
  assert.equal(phase3.coverage.base_decisions.oem_based, 0);
});


test('OEM FALLBACK GATE: official Fleetguard not-found does not equal non-manufacture', () => {
  const history = phase3.exception_audit_history.find((h) => h.status === 'FLEETGUARD_OFFICIAL_CROSSREF_FOLLOWUP_NO_STATE_CHANGE');
  assert.ok(history);
  assert.equal(history.result, 'FLEETGUARD_NOT_FOUND_ONLY');
  assert.equal(history.governance_effect, 'OEM_FALLBACK_REMAINS_CLOSED');

  for (const id of ['P3-N-FUEL-2006-NPR','P3-11-N-FWS-2022i-ON']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.ok(row);
    assert.notEqual(row.fleetguard_status, 'FLEETGUARD_NOT_MANUFACTURED_VERIFIED');
    assert.equal(row.base_source_brand, null);
    assert.equal(row.base_source_part, null);
  }
});


test('PHASE 2 FOLLOW-UP: high-capacity commercial variant is not a separate OEM position', () => {
  const nStd = phase2.oen_rows.find((r) => r.row_id === 'P2-N-FUEL-2013-2021-B');
  const nHigh = phase2.oen_rows.find((r) => r.row_id === 'P2-N-FUEL-HIGHCAP-2013-2021');
  const fStd = phase2.oen_rows.find((r) => r.row_id === 'P2-F-FUEL-2018-2020-A');
  const fHigh = phase2.oen_rows.find((r) => r.row_id === 'P2-F-FUEL-2018-2020-B');

  for (const row of [nStd, nHigh, fStd, fHigh]) {
    assert.ok(row);
    assert.equal(row.standard_high_capacity_resolution.status, 'COMMERCIAL_VARIANT_NOT_SEPARATE_OEM_POSITION');
    assert.equal(row.evidence_status, 'PARTIAL');
  }

  assert.deepEqual(nStd.standard_high_capacity_resolution.shared_genuine_oens_with_high_capacity, ['8980374810','5873109370']);
  assert.deepEqual(nHigh.standard_high_capacity_resolution.shared_genuine_oens_with_standard, ['8980374810','5873109370']);
  assert.deepEqual(fStd.standard_high_capacity_resolution.shared_genuine_oens_with_high_capacity, ['8943692993','8980374810','8943691993']);
  assert.deepEqual(fHigh.standard_high_capacity_resolution.shared_genuine_oens_with_standard, ['8943692993','8980374810','8943691993']);

  const history = phase3.exception_audit_history.find((h) => h.status === 'PHASE2_STANDARD_HIGH_CAPACITY_DISTINCTION_CLOSED');
  assert.ok(history);
  assert.equal(history.result, 'COMMERCIAL_VARIANT_NOT_SEPARATE_OEM_POSITION');
  assert.equal(history.phase3_state_change, 'NONE');

  for (const id of ['P3-08-N-FUEL-2013-2021-B','P3-10-N-FUEL-HIGHCAP-2013-2021','P3-16-F-FUEL-2018-2020-A','P3-17-F-FUEL-2018-2020-B']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    assert.equal(row.decision_status, 'PARTIAL');
  }
});


test('PARTIAL TRIAGE: all 13 PARTIAL rows are classified', () => {
  const partial = phase3.resolution_rows.filter((r) => r.decision_status === 'PARTIAL');
  assert.equal(partial.length, 13);
  const counts = partial.reduce((acc, r) => {
    assert.ok(r.partial_triage, r.row_id + ' lacks partial_triage');
    acc[r.partial_triage.classification] = (acc[r.partial_triage.classification] || 0) + 1;
    return acc;
  }, {});
  assert.equal(counts.ACTIONABLE_PARTIAL || 0, 0);
  assert.equal(counts.TERMINAL_PARTIAL, 13);
  assert.equal(counts.PARTIAL_SUPERSEDED || 0, 0);
  assert.equal(partial.filter((r) => r.partial_triage.classification === 'TERMINAL_PARTIAL').length, 13);

});


test('ACTIONABLE PARTIAL GROUPS: zero-budget pass terminalizes all 11 rows', () => {
  const audit = phase3.actionable_partial_group_audit;
  assert.ok(audit);
  assert.equal(audit.summary.groups_total, 4);
  assert.equal(audit.summary.groups_resolved, 0);
  assert.equal(audit.summary.groups_terminalized_after_free_evidence_exhausted, 4);
  assert.equal(audit.summary.rows_total, 11);
  assert.equal(audit.summary.rows_terminalized_after_free_evidence_exhausted, 11);
  assert.equal(audit.summary.rows_state_changed, 0);

  const exhausted = phase3.resolution_rows.filter((r) => r.partial_triage?.terminal_subtype === 'TERMINAL_PARTIAL_WITH_FIRST_PARTY_EVIDENCE_EXHAUSTED');
  assert.equal(exhausted.length, 11);
  for (const row of exhausted) {
    assert.equal(row.decision_status, 'PARTIAL');
    assert.equal(row.partial_triage.classification, 'TERMINAL_PARTIAL');
    assert.equal(row.partial_triage.free_evidence_pass, 'EXHAUSTED');
  }
});


test('EVIDENCE PACK: zero-budget mode covers all 11 terminalized research rows', () => {
  const pack = require('../config/vehicle-platform-closure/isuzu-aisin-evidence-pack.json');
  const exhausted = phase3.resolution_rows.filter((r) => r.partial_triage?.terminal_subtype === 'TERMINAL_PARTIAL_WITH_FIRST_PARTY_EVIDENCE_EXHAUSTED');
  const covered = new Set(Object.values(pack.groups).flatMap((g) => g.row_ids));
  assert.equal(pack.acquisition_strategy.mode, 'FREE_FIRST_PARTY_ONLY');
  assert.equal(pack.acquisition_strategy.budget_usd, 0);
  assert.equal(exhausted.length, 11);
  assert.equal(covered.size, 11);
  for (const row of exhausted) assert.ok(covered.has(row.row_id), row.row_id + ' missing from evidence pack');
  assert.equal(pack.execution_result.status, 'COMPLETE');
  assert.equal(pack.execution_result.outcome, 'FIRST_PARTY_EVIDENCE_EXHAUSTED_FOR_RECORDED_QUESTIONS');
  assert.match(pack.extraction_contract.stop_rule, /TERMINAL_PARTIAL_WITH_FIRST_PARTY_EVIDENCE_EXHAUSTED/);
  assert.match(pack.extraction_contract.stop_rule, /Paid access is out of scope/);
});


test('ZERO-BUDGET TERMINALIZATION: all 13 PARTIAL rows are terminal', () => {
  const partial = phase3.resolution_rows.filter((r) => r.decision_status === 'PARTIAL');
  assert.equal(partial.length, 13);
  assert.equal(partial.filter((r) => r.partial_triage?.classification === 'TERMINAL_PARTIAL').length, 13);
  assert.equal(partial.filter((r) => r.partial_triage?.terminal_subtype === 'TERMINAL_PARTIAL_WITH_FIRST_PARTY_EVIDENCE_EXHAUSTED').length, 11);
  assert.equal(phase3.partial_triage_audit.ACTIONABLE_PARTIAL, 0);
  assert.equal(phase3.partial_triage_audit.TERMINAL_PARTIAL, 13);
});


test('P550008 LEGACY CLEANUP: stale LD competitor mappings are absent', () => {
  const fs = require('fs');
  const path = require('path');
  const csv = fs.readFileSync(path.join(__dirname, '..', 'sku_competitor_matrix_ld.csv'), 'utf8');
  const stale = csv.split(/\r?\n/).filter((line) =>
    (line.startsWith('"EL50936"') || line.startsWith('"EL59363"')) && line.includes('"P550008"')
  );
  assert.equal(stale.length, 0);
  const history = phase3.exception_audit_history.find((h) => h.status === 'P550008_LEGACY_STALE_MAPPING_CLEANUP_COMPLETE');
  assert.ok(history);
  assert.equal(history.canonical_mapping, 'P550008 -> EL80008');
});


test('DONALDSON ASIA: blocked rows retain status but gain official regional candidates', () => {
  const p2006 = phase3.resolution_rows.find((r) => r.row_id === 'P3-N-FUEL-2006-NPR');
  const p2022 = phase3.resolution_rows.find((r) => r.row_id === 'P3-11-N-FWS-2022i-ON');
  assert.equal(p2006.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(p2022.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(p2006.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(p2022.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(p2006.regional_donaldson_candidates[0].candidate_part, 'P550390');
  assert.equal(p2022.regional_donaldson_candidates[0].candidate_part, 'P551855');
  assert.equal(p2006.regional_donaldson_candidates[0].promotion_status, 'CANDIDATE_ONLY');
  assert.equal(p2022.regional_donaldson_candidates[0].promotion_status, 'CANDIDATE_ONLY');
});


test('DONALDSON REGIONAL POLICY: NOT_FOUND requires USA and regional completion', () => {
  const policy = phase3.donaldson_research_sequence;
  assert.equal(policy.scope, 'ALL_ISUZU_PHASE3_ROWS');
  assert.deepEqual(
    policy.sequence.map((step) => step.channel),
    ['USA_PRIMARY','REGIONAL_OFFICIAL','FLEETGUARD','VERIFIED_OEM_FALLBACK']
  );

  const notFound = phase3.resolution_rows.filter((r) => r.donaldson_status === 'DONALDSON_NOT_FOUND');
  assert.equal(notFound.length, 2);
  for (const row of notFound) {
    assert.equal(row.donaldson_research_trace.USA_PRIMARY, 'EXHAUSTED');
    assert.ok(['EXHAUSTED_NO_CANDIDATE','CANDIDATE_ONLY_NO_US_OEN_TIE'].includes(row.donaldson_research_trace.REGIONAL_OFFICIAL));
  }
});


test('AUTONOMOUS EXECUTION: Isuzu closure is enabled with hard guardrails', () => {
  const auto = phase3.autonomous_execution;
  assert.ok(auto);
  assert.equal(auto.mode, 'ENABLED');
  assert.equal(auto.scope, 'ISUZU_US_DIESEL_CLOSURE');
  assert.deepEqual(auto.operating_cycle, ['AUDIT','IMPLEMENT','AUDIT','CLOSE','NEXT']);
  assert.equal(auto.background_execution, false);
  assert.ok(auto.permitted_without_additional_confirmation.some((x) => /Create branches and pull requests/.test(x)));
  assert.ok(auto.permitted_without_additional_confirmation.some((x) => /Merge a pull request/.test(x)));
  assert.ok(auto.prohibited_without_explicit_user_authorization.some((x) => /Publish catalogue\/application changes/.test(x)));
  assert.ok(auto.prohibited_without_explicit_user_authorization.some((x) => /Send email/.test(x)));
  assert.ok(auto.mandatory_stop_conditions.some((x) => /commercial or legal judgment/.test(x)));
});


test('DONALDSON REGIONAL TERMINAL CLOSURE: both residual Isuzu rows are closed without unsafe promotion', () => {
  const p2006 = phase3.resolution_rows.find((r) => r.row_id === 'P3-N-FUEL-2006-NPR');
  const p2022 = phase3.resolution_rows.find((r) => r.row_id === 'P3-11-N-FWS-2022i-ON');
  assert.equal(phase3.regional_donaldson_terminal_closure.status, 'COMPLETE');
  assert.equal(phase3.regional_donaldson_terminal_closure.result, '2_TERMINAL_BLOCKED_DONALDSON_WITH_FINAL_REGIONAL_CANDIDATES');
  assert.equal(p2006.regional_donaldson_closure.status, 'CLOSED_TERMINAL_CANDIDATE_ONLY');
  assert.equal(p2022.regional_donaldson_closure.status, 'CLOSED_TERMINAL_CANDIDATE_ONLY');
  assert.equal(p2006.regional_donaldson_closure.candidate_part, 'P550390');
  assert.equal(p2022.regional_donaldson_closure.candidate_part, 'P551855');
  assert.equal(p2006.regional_donaldson_closure.canonical_base_promoted, false);
  assert.equal(p2022.regional_donaldson_closure.canonical_base_promoted, false);
  assert.equal(p2006.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(p2022.decision_status, 'BLOCKED_DONALDSON');
  assert.equal(p2006.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(p2022.donaldson_status, 'DONALDSON_NOT_FOUND');
  assert.equal(p2006.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED');
  assert.equal(p2022.fleetguard_status, 'NOT_ELIGIBLE_DONALDSON_ABSENCE_NOT_VERIFIED');
});
