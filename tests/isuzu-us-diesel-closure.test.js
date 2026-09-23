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

test('Phase 3 is blocked and therefore publishes no base decision', () => {
  assert.equal(phase3.outcome, 'BLOCKED_AT_SOURCE_1');
  assert.deepEqual(phase3.resolution_rows, []);
  assert.deepEqual(phase3.elimfilters_base_decisions, []);
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

  // No position may claim an aftermarket answer while Phase 3 is blocked.
  for (const position of vehicle.positions) {
    if (position.aftermarket) {
      assert.equal(position.aftermarket.donaldson_reference, null);
      assert.equal(position.aftermarket.elimfilters_base_decision, null);
    }
  }
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

test('the conflicts that were found are recorded, not silently resolved', () => {
  const ids = phase1.conflicts.map((c) => c.conflict_id);
  assert.ok(ids.includes('CONF-NRR-2004'));
  assert.ok(ids.includes('CONF-FVR-2020'));

  const nrr2004 = phase1.year_blocks.find((b) => b.block_id === 'N-2004-NRR');
  assert.equal(nrr2004.evidence_status['2004'], 'CONFLICTING');
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
