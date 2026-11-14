'use strict';
/**
 * HERMES #1300 — strictly read-only reconciliation for EL83771.
 * Reads LIVE PostgreSQL data and reports additive deltas. Never executes UPDATE/INSERT.
 * Usage: CATALOG_DATABASE_URL=... node scripts/hermes/reconcile-el83771-issue-1300.cjs
 */
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const DATA = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/catalogue-research/el83771-issue-1300.json'), 'utf8'));
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const key = r => norm(r.manufacturer || r.brand || r.make) + ':' + norm(r.code || r.reference || r.model);
// Catalogue rows store {equipment, engine}; research candidates carry make/model too. Compare on equipment (or make+model) + engine.
const appKey = r => [norm(r.equipment || ((r.make || r.brand || '') + ' ' + (r.model || ''))),norm(r.engine)].join(':');
function additions(current, proposed, identify) {
  const seen = new Set((current || []).map(identify));
  return proposed.filter(x => !seen.has(identify(x)) && (seen.add(identify(x)) || true));
}
function plan(row, collisions=[]) {
  if (!row || row.sku !== DATA.sku) throw Error('SKU_MISSING_OR_DIFFERENT');
  if (row.catalog_active !== true || row.duty !== 'HEAVY_DUTY') throw Error('SKU_NOT_ACTIVE_HEAVY_DUTY');
  const oem = row.oem_codes || [], competitor = row.competitor_codes || [], equip = row.equipment_applications || [];
  if (![oem,competitor,equip].every(Array.isArray)) throw Error('BAD_JSONB_ARRAYS');
  const missingOem = additions(oem, DATA.oem_candidates, key);
  const missingCompetitors = additions(competitor, DATA.competitor_candidates, key);
  const missingEquipment = additions(equip, DATA.equipment_candidates, appKey);
  const conflictCodes = new Set(collisions.map(c => norm(c.code)));
  return {
    sku: DATA.sku, status: 'NO_GO_REVIEW_ONLY',
    snapshot_sha256: crypto.createHash('sha256').update(JSON.stringify({oem,competitor,equip})).digest('hex'),
    before: {oem:oem.length,competitor:competitor.length,equipment:equip.length},
    proposals: {oem:missingOem,competitor:missingCompetitors,equipment:missingEquipment},
    existing_preserved: true, // This is a proposed append-only plan; no writes have happened.
    collisions,
    blocked_oem: missingOem.filter(c => conflictCodes.has(norm(c.code))),
    next: 'REVIEW collision, application identity and evidence; run governed dry-run before any authorized write'
  };
}
async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw Error('CATALOG_DATABASE_URL_MISSING; no database accessed');
  const client = new Client({connectionString:url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : {rejectUnauthorized:false}});
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout='30s'");
    const {rows} = await client.query('SELECT sku,duty,catalog_active,oem_codes,competitor_codes,equipment_applications FROM public.elimfilters_catalog WHERE sku=$1',[DATA.sku]);
    if (rows.length !== 1) throw Error('EL83771_NOT_FOUND');
    const codes=DATA.oem_candidates.map(c=>norm(c.code));
    const {rows:collisions}=await client.query(
      `SELECT DISTINCT c.sku, x.value->>'code' AS code, x.field
         FROM public.elimfilters_catalog c
         CROSS JOIN LATERAL (
           SELECT value,'oem_codes'::text AS field FROM jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb))
           UNION ALL
           SELECT value,'competitor_codes'::text AS field FROM jsonb_array_elements(COALESCE(c.competitor_codes,'[]'::jsonb))
         ) x
        WHERE c.sku <> $1 AND regexp_replace(upper(COALESCE(x.value->>'code','')),'[^A-Z0-9]','','g') = ANY($2::text[])`,
      [DATA.sku,codes]
    );
    console.log(JSON.stringify(plan(rows[0],collisions),null,2));
    await client.query('ROLLBACK');
  } catch(e) {await client.query('ROLLBACK').catch(()=>{});throw e;}
  finally {await client.end();}
}
if(require.main===module)main().catch(e=>{console.error('NO_GO:',e.message);process.exitCode=1;});
module.exports={norm,key,appKey,additions,plan};
