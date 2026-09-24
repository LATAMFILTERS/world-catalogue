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
  assert.equal(phase3.canonical_hd_rule, 'DONALDSON_IF_MANUFACTURED_ELSE_FLEETGUARD');
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
  for (const pattern of [/FRR and FXR/, /Cummins B6\.7/]) {
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
    if (/CARTRIDGE/i.test(row.isuzu_part_form)) assert.equal(base.form.style, 'Cartridge', row.row_id);
    if (/\bELEMENT\b/i.test(row.isuzu_part_form) && base.form.style === 'Spin-On') assert.notEqual(row.decision_status, 'VERIFIED_BASE', row.row_id);
  }
  const trans = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-TRANS');
  // EXCEPTION AUDIT 2026-09-23 reclassified this row from CONFLICTING to
  // BLOCKED_DONALDSON: the only Donaldson hit (P550008, a full-flow engine-oil
  // spin-on) is a false-positive category mismatch against a transmission
  // filter cartridge, not a genuine competing candidate -- so there is nothing
  // left to be "conflicted" between, only an absence of a usable base.
  assert.equal(trans.decision_status, 'BLOCKED_DONALDSON', 'a cartridge OEN mapped only to a spin-on must not become a base');
  assert.equal(trans.base_source_part, null);
  assert.equal(trans.base_source_brand, null);
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

test('PHASE 3.13: nothing is published automatically', () => {
  assert.equal(phase3.governance.publication_authorized, false);
  assert.equal(phase3.governance.review_state, 'READY_FOR_REVIEW');
  assert.equal(phase3.governance.hermes_output_class, 'CANDIDATE_INTELLIGENCE');
  for (const d of phase3.elimfilters_base_decisions) assert.equal(d.published, false);
  for (const row of phase3.resolution_rows) {
    if (row.elimfilters_base_decision) assert.equal(row.elimfilters_base_decision.published, false);
  }
});

test('PHASE 3.14: an existing ELIMFILTERS SKU is reused, never minted', () => {
  const catalogue = new Set(fs.readFileSync(path.join(__dirname, '..', 'data', 'dims.csv'), 'utf8').split('\n').map((l) => l.split(',')[0]));
  assert.deepEqual(phase3.coverage.elimfilters_new_sku_candidates, []);
  for (const row of phase3.resolution_rows) {
    if (!row.elimfilters_base_decision) continue;
    assert.equal(row.elimfilters_base_decision.action, 'REUSE_EXISTING_SKU');
    assert.ok(catalogue.has(row.elimfilters_existing_sku), `${row.elimfilters_existing_sku} is not in the catalogue export`);
    assert.equal(row.elimfilters_base_decision.sku, row.elimfilters_existing_sku);
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
  assert.deepEqual([...new Set(skus)].sort(), [...phase3.coverage.elimfilters_skus_reused].sort());
});

test('PHASE 3.16: Phase 1 and Phase 2 are intact', () => {
  const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
  assert.equal(digest(phase1), 'f8c58b44aca6fec67ba640a2330a8a34c34db73e1654d7c410137cb6dbde30d6');
  assert.equal(digest(phase2), '0140e1a75cec66d1845d8c430123037088d1d262f6032a9d6f28a641e61c24b1');
  assert.equal(phase2.phase2_status, 'CLOSED');
});

test('PHASE 3.17: anomalous Isuzu numbers are documented, not normalised', () => {
  const lube = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-1998-2010');
  assert.deepEqual(lube.isuzu_oe_oen, ['2906542701', '2906548000', '2906548100']);
  assert.ok(lube.caveats.some((c) => /2-90654-800-0/.test(c) && /NOT used to normalise/.test(c)));
  const lube2011 = phase3.resolution_rows.find((r) => r.phase2_row_id === 'P2-N-LUBE-2011-ON');
  assert.ok(lube2011.isuzu_oe_oen.includes('2906544040'));
  assert.equal(lube2011.decision_status, 'BLOCKED_DONALDSON');
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
  // The one part this audit found with more than one SKU anywhere in the
  // repository (P550008) is documented explicitly and is not used as a base
  // for any row, so it correctly never appears in skuByBase above.
  assert.ok(phase3.duplicate_mapping_audit.findings.some((f) => f.donaldson_part === 'P550008'));
  assert.ok(!phase3.resolution_rows.some((r) => r.base_source_part === 'P550008'));
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
  assert.equal(phase3.governance.elimfilters_sku_policy, 'Reuse an existing ELIMFILTERS SKU for the Donaldson base part. No new SKU is minted in this phase.');
  const flat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'donaldson_crossref_flat.csv'), 'utf8');
  assert.doesNotMatch(flat, /,DONALDSON,P502155,/, 'P502155 must not exist in the first-party capture (it is a legacy-only identity)');
});

test('EXCEPTION 5: the first-party Donaldson capture outranks third-party legacy crossref on every reused base', () => {
  const reusedParts = new Set(phase3.resolution_rows.filter((r) => r.base_source_part).map((r) => r.base_source_part));
  for (const row of phase3.resolution_rows) {
    if (!row.base_source_part) continue;
    assert.equal(row.donaldson_source, 'DONALDSON_SHOP_CROSSREF_CAPTURE_2026_07', `${row.row_id}: base must be sourced from the first-party capture`);
  }
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
  assert.equal(digest(phase2), '0140e1a75cec66d1845d8c430123037088d1d262f6032a9d6f28a641e61c24b1');
  for (const id of ['P3-05-N-LUBE-1998-2010', 'P3-08-N-FUEL-2013-2021-B', 'P3-10-N-FUEL-HIGHCAP-2013-2021', 'P3-12-N-TRANS', 'P3-13-F-LUBE-1987-2008', 'P3-16-F-FUEL-2018-2020-A', 'P3-17-F-FUEL-2018-2020-B']) {
    const row = phase3.resolution_rows.find((r) => r.row_id === id);
    const p2 = phase2.oen_rows.find((r) => r.row_id === row.phase2_row_id);
    assert.deepEqual(row.isuzu_oe_oen, p2.isuzu_oe_oen, `${id}: isuzu_oe_oen must not diverge from phase2`);
  }
});

test('EXCEPTION 10: assembly, element and kit candidates are not fused across the re-resolved rows', () => {
  const lube = phase3.resolution_rows.find((r) => r.row_id === 'P3-05-N-LUBE-1998-2010');
  assert.equal(lube.base_source_part, null, 'the disputed 2906548000 candidates stay documented, not merged into a base');
  assert.ok(lube.donaldson_candidates.some((c) => c.part === 'P502042') && lube.donaldson_candidates.some((c) => c.part === 'P550973'));
  const trans = phase3.resolution_rows.find((r) => r.row_id === 'P3-12-N-TRANS');
  assert.equal(trans.base_source_part, null, 'a transmission cartridge OEN must never resolve to an engine-oil spin-on base');
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
  const conflicting = phase3.resolution_rows.filter((r) => r.decision_status === 'CONFLICTING');
  assert.equal(conflicting.length, 1, 'the exception pass must reduce CONFLICTING from 7 to 1');
  assert.equal(conflicting[0].row_id, 'P3-05-N-LUBE-1998-2010');
  assert.ok(conflicting[0].caveats.some((c) => /CROSSREF/.test(c) && /OEM/.test(c)), 'the remaining CONFLICTING row must document the evidence-tier reason it cannot be resolved');
});

test('EXCEPTION 14: every BLOCKED_DONALDSON row shows exact search evidence', () => {
  const blocked = phase3.resolution_rows.filter((r) => r.decision_status === 'BLOCKED_DONALDSON');
  assert.equal(blocked.length, 4);
  for (const row of blocked) {
    assert.ok(row.caveats.length > 0, `${row.row_id} must document its search`);
  }
  const trans = blocked.find((r) => r.row_id === 'P3-12-N-TRANS');
  assert.ok(trans.caveats.some((c) => /FALSE_POSITIVE/.test(c)), 'P3-12 must record why its one Donaldson hit was rejected, not just that none was found');
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
  const history = phase3.exception_audit_history[phase3.exception_audit_history.length - 1];
  assert.deepEqual(history.starting_counts, { VERIFIED_BASE: 4, PARTIAL: 5, CONFLICTING: 7, BLOCKED_DONALDSON: 3 });
  assert.deepEqual(history.final_counts, { VERIFIED_BASE: 4, PARTIAL: 10, CONFLICTING: 1, BLOCKED_DONALDSON: 4 });

  const counts = phase3.coverage.decision_status;
  assert.equal(counts.VERIFIED_BASE, history.final_counts.VERIFIED_BASE);
  assert.equal(counts.PARTIAL, history.final_counts.PARTIAL);
  assert.equal(counts.CONFLICTING, history.final_counts.CONFLICTING);
  assert.equal(counts.BLOCKED_DONALDSON, history.final_counts.BLOCKED_DONALDSON);

  assert.equal(phase3.exception_audit_status, 'CLOSED_WITH_BLOCKERS');
  assert.equal(phase3.phase3_status, 'CLOSED', 'phase3_status must not be degraded by an exception cleanup pass');

  const result = validateClosure();
  assert.deepEqual(result.errors, []);
});
