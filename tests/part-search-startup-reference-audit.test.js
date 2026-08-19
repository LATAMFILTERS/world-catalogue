'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { summarize } = require('../lib/part-search-startup-reference-audit');

test('startup audit excludes metadata-only tokens and keeps true part-number families', () => {
  const rows = [
    {
      reference: 'DONGFENGMOTOR',
      sku_count: 80,
      duties: ['HEAVY_DUTY'],
      filter_types: ['fuel', 'oil'],
      thread_sizes: ['1-14 UN', 'M20 x 1.5'],
      governance_states: ['REVIEW_DONALDSON_CANDIDATE'],
      min_height_mm: 100,
      max_height_mm: 300,
      min_outer_diameter_mm: 80,
      max_outer_diameter_mm: 150,
      skus: ['A','B'],
      codigo_bases: ['X','Y']
    },
    {
      reference: '1R1808',
      sku_count: 5,
      duties: ['HEAVY_DUTY'],
      filter_types: ['oil'],
      thread_sizes: ['1 1/2-16 UN'],
      governance_states: ['CANONICAL_EVIDENCED'],
      min_height_mm: 244,
      max_height_mm: 308,
      min_outer_diameter_mm: 118,
      max_outer_diameter_mm: 136,
      skus: ['EL81808','EL84005','EL84105','EL87405','EL87505'],
      codigo_bases: ['P551808','P554005','P554105','P554206','P557405']
    }
  ];

  const report = summarize(rows);
  assert.equal(report.audit, 'CATALOG_REFERENCE_FAMILY_GOVERNANCE_V2');
  assert.equal(report.mode, 'READ_ONLY');
  assert.equal(report.metadata_contamination_tokens, 1);
  assert.equal(report.ambiguous_part_number_families, 1);
  assert.equal(report.mutation_count, 0);
  assert.equal(report.high_risk_sample.some(row => row.reference === 'DONGFENGMOTOR'), false);
});
