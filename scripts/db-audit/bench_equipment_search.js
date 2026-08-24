'use strict';
/**
 * FASE 1 — read-only benchmark of the real /api/search/equipment query
 * shape (server-original.js:1983-2062), reproduced exactly (same SQL
 * structure, same params) against representative vehicle/equipment
 * searches. Never writes to Postgres. Session is forced read-only and
 * every EXPLAIN runs under a strict statement_timeout so a slow query
 * cannot hang or block production.
 *
 * Usage: node scripts/db-audit/bench_equipment_search.js
 * Output: scripts/db-audit/output/equipment_search_benchmark.json (+.md)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Client } = require('pg');

const OUTPUT_DIR = path.join(__dirname, 'output');

// Mirrors buildJsonbCond() + the KG EXISTS clause from
// server-original.js's /api/search/equipment handler exactly.
function buildQuery({ make, model, year, engine }) {
  const params = [];
  let idx = 1;
  const conditions = [];

  const buildJsonbCond = (col) => {
    const conds = [];
    if (make) { conds.push(`UPPER(ea->>'make') LIKE $${idx}`); params.push('%' + make.toUpperCase() + '%'); idx++; }
    if (model) { conds.push(`UPPER(COALESCE(ea->>'model', ea->>'machine')) LIKE $${idx}`); params.push('%' + model.toUpperCase() + '%'); idx++; }
    if (year) { conds.push(`(ea->>'year_from')::int <= $${idx} AND (ea->>'year_to')::int >= $${idx}`); params.push(parseInt(year, 10)); idx++; }
    if (engine) { conds.push(`UPPER(COALESCE(ea->>'engine_code', ea->>'engine')) LIKE $${idx}`); params.push('%' + engine.toUpperCase() + '%'); idx++; }
    return `EXISTS (SELECT 1 FROM jsonb_array_elements(
      CASE WHEN jsonb_typeof(${col}) = 'array' THEN ${col} ELSE '[]'::jsonb END
    ) AS ea WHERE ${conds.join(' AND ')})`;
  };

  conditions.push(buildJsonbCond('equipment_applications'));
  conditions.push(buildJsonbCond('vehicle_applications'));

  const kgConds = [];
  if (make) { kgConds.push(`UPPER(kmk.display_name) LIKE $${idx}`); params.push('%' + make.toUpperCase() + '%'); idx++; }
  if (model) { kgConds.push(`UPPER(km.display_name) LIKE $${idx}`); params.push('%' + model.toUpperCase() + '%'); idx++; }
  if (kgConds.length > 0) {
    conditions.push(`EXISTS (
      SELECT 1 FROM kg_product_equipment kpe
      JOIN kg_equipment_models km ON kpe.model_id = km.id
      LEFT JOIN kg_equipment_makes kmk ON km.make_id = kmk.id
      WHERE kpe.product_sku = elimfilters_catalog.sku AND ${kgConds.join(' AND ')}
    )`);
  }

  const whereClause = 'WHERE (' + conditions.join(') OR (') + ')';
  const sql = `SELECT DISTINCT ON (sku) sku FROM elimfilters_catalog ${whereClause} ORDER BY sku LIMIT 30`;
  return { sql, params };
}

// The exact scenarios requested: representative real searches.
const SCENARIOS = [
  { label: 'Freightliner + Detroit Diesel Series 60 + 2010', p: { make: 'FREIGHTLINER', engine: 'SERIES 60', year: '2010' } },
  { label: 'Caterpillar', p: { make: 'CATERPILLAR' } },
  { label: 'Volvo truck', p: { make: 'VOLVO', model: 'TRUCK' } },
  { label: 'Mack', p: { make: 'MACK' } },
  { label: 'Komatsu', p: { make: 'KOMATSU' } },
  { label: 'Toyota pickup', p: { make: 'TOYOTA', model: 'PICKUP' } },
  { label: 'Toyota forklift', p: { make: 'TOYOTA', model: 'FORKLIFT' } },
  { label: 'Nissan pickup', p: { make: 'NISSAN', model: 'PICKUP' } },
  { label: 'BMW', p: { make: 'BMW' } },
  { label: 'Honda', p: { make: 'HONDA' } },
  { label: 'Búsqueda por motor (SERIES 60)', p: { engine: 'SERIES 60' } },
  { label: 'Búsqueda marca/modelo/año (Freightliner Cascadia 2015)', p: { make: 'FREIGHTLINER', model: 'CASCADIA', year: '2015' } },
];

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  await client.query('SET default_transaction_read_only = on');
  await client.query("SET statement_timeout = '20s'");
  await client.query("SET lock_timeout = '3s'");

  const results = [];
  for (const scenario of SCENARIOS) {
    const { sql, params } = buildQuery(scenario.p);
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sql}`;
    const start = Date.now();
    try {
      const r = await client.query(explainSql, params);
      const wallMs = Date.now() - start;
      const plan = r.rows[0]['QUERY PLAN'][0];
      results.push({
        scenario: scenario.label,
        params: scenario.p,
        wall_ms: wallMs,
        planning_time_ms: plan['Planning Time'],
        execution_time_ms: plan['Execution Time'],
        top_node_type: plan.Plan['Node Type'],
        shared_hit_blocks: plan.Plan['Shared Hit Blocks'],
        shared_read_blocks: plan.Plan['Shared Read Blocks'],
        actual_rows: plan.Plan['Actual Rows'],
        plan_json: plan,
      });
      console.log(`[ok] ${scenario.label} — exec ${plan['Execution Time'].toFixed(1)}ms, top node: ${plan.Plan['Node Type']}`);
    } catch (err) {
      const wallMs = Date.now() - start;
      results.push({ scenario: scenario.label, params: scenario.p, wall_ms: wallMs, error: err.message });
      console.log(`[error] ${scenario.label}: ${err.message} (after ${wallMs}ms)`);
    }
  }

  await client.end();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'equipment_search_benchmark.json'), JSON.stringify({ generated_at: new Date().toISOString(), results }, null, 2));

  const lines = ['# Equipment/vehicle free-text search benchmark (read-only EXPLAIN ANALYZE)', '', `Generated: ${new Date().toISOString()}`, '', 'Reproduces the exact SQL shape of `/api/search/equipment` (server-original.js).', '', '| Scenario | Wall ms | Exec ms | Top plan node | Rows | Shared read blocks |', '|---|---|---|---|---|---|'];
  for (const r of results) {
    if (r.error) {
      lines.push(`| ${r.scenario} | ${r.wall_ms} | ERROR | ${r.error} | - | - |`);
    } else {
      lines.push(`| ${r.scenario} | ${r.wall_ms} | ${r.execution_time_ms.toFixed(1)} | ${r.top_node_type} | ${r.actual_rows} | ${r.shared_read_blocks} |`);
    }
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'equipment_search_benchmark.md'), lines.join('\n') + '\n');
  console.log('\nWritten equipment_search_benchmark.json/.md');
}

main();
