'use strict';

const { Client } = require('pg');
const APPLY = process.argv.includes('--apply');

const ITEMS = [
  { sku:'EL82100', base:'P552100', url:'https://shop.donaldson.com/store/en-us/product/P552100/20823' },
  { sku:'EA17682', base:'P527682', url:'https://shop.donaldson.com/store/en-us/product/P527682/19358' },
  { sku:'EL82518', base:'P552518', url:'https://shop.donaldson.com/store/en-us/product/P552518/20838' },
  { sku:'EC14226', base:'P614226', url:'https://shop.donaldson.com/store/en-us/product/P614226/37558' }
];

async function main() {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const client = new Client({ connectionString:url, ssl:{ rejectUnauthorized:false } });
  await client.connect();
  await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try {
    const report = { mode: APPLY ? 'apply' : 'dry-run', verified:[] };

    for (const item of ITEMS) {
      const q = await client.query(
        "SELECT sku,codigo_base,canonical_source_code,enrichment_data->'codigo_base_governance' AS governance FROM public.elimfilters_catalog WHERE sku=$1",
        [item.sku]
      );
      if (q.rowCount !== 1) throw new Error(item.sku + ': canonical row missing or duplicated');
      const row = q.rows[0];
      const actual = row.canonical_source_code || row.codigo_base;
      if (String(actual || '').toUpperCase() !== item.base) {
        throw new Error(item.sku + ': expected base ' + item.base + ', got ' + actual);
      }

      const current = row.governance || {};
      report.verified.push({ sku:item.sku, base:item.base, before_state:current.state || null, evidence_url:item.url });

      if (APPLY) {
        const patch = {
          state:'CANONICAL_VERIFIED',
          policy_version:current.policy_version || '2026-08-19-v3.1',
          current_codigo_base:item.base,
          approved_codigo_base:item.base,
          approved_source_column:'CODIGO_BASE',
          approved_manufacturer:'DONALDSON',
          primary_manufacturer_verified:true,
          required_authority:'VERIFIED_DONALDSON',
          evidence_authority:'DONALDSON_OFFICIAL_CATALOG',
          evidence_level:'OFFICIAL_PRODUCT_PAGE',
          evidence_url:item.url,
          verification_method:'DONALDSON_CL120_ACCEPTANCE_20261002',
          verified_at:new Date().toISOString()
        };
        await client.query(
          "UPDATE public.elimfilters_catalog SET enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{codigo_base_governance}',coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb) || $1::jsonb,true) WHERE sku=$2",
          [JSON.stringify(patch),item.sku]
        );
      }
    }

    const verify = await client.query(
      "SELECT sku,codigo_base,enrichment_data->'codigo_base_governance'->>'state' AS state,enrichment_data->'codigo_base_governance'->>'approved_manufacturer' AS manufacturer,enrichment_data->'codigo_base_governance'->>'primary_manufacturer_verified' AS manufacturer_verified FROM public.elimfilters_catalog WHERE sku = ANY($1::varchar[]) ORDER BY sku",
      [ITEMS.map(x => x.sku)]
    );
    report.after = verify.rows;

    if (APPLY) {
      for (const row of verify.rows) {
        if (row.state !== 'CANONICAL_VERIFIED' || row.manufacturer !== 'DONALDSON' || row.manufacturer_verified !== 'true') {
          throw new Error(row.sku + ': governance verification failed');
        }
      }
      await client.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    } else {
      await client.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
