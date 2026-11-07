'use strict';
/**
 * EF90624 SYNTAPORE - WIX WF10624 source-backed candidate.
 * Read-only by default: node scripts/migrations/create_ef90624_wix_wf10624.js
 * Controlled database write ONLY with --apply after reviewing dry-run output.
 * Never claims that ELIMFILTERS has manufactured or physically certified this filter.
 */
const { Client } = require('pg');
const APPLY = process.argv.includes('--apply');
const SKU = 'EF90624';
const SOURCE = 'WF10624';
const OE = [
  ['BOBCAT','7319095'],
  ['CATERPILLAR','450-0565'],['CATERPILLAR','467-1179'],
  ['CATERPILLAR','467-1181'],['CATERPILLAR','360-8960'],
  ['CLAAS','00 077 395.20'],
  ['DAEWOO CONSTRUCTION EQUIPMENT','40050400195'],
  ['DOOSAN','3611274'],
  ['HYUNDAI CONSTRUCTION','11Q4-70110'],['HYUNDAI CONSTRUCTION','11Q470111'],
  ['MANITOU','296854'],['MASSEY-FERGUSON','3611272'],
  ['PERKINS','4461492'],['PERKINS','3611674'],['PERKINS','3611274'],
  ['SENNEBOGEN','177606'],['SENNEBOGEN','219995'],['SENNEBOGEN','244267'],
  ['TEREX','6550 2409'],['WACKER NEUSON','100 030 9595']
];
const oemCodes = OE.map(([manufacturer,code])=>({manufacturer,code}));
const competitorCodes = [{manufacturer:'WIX',code:SOURCE}];
const description = 'ELIMFILTERS EF90624 SYNTAPORE fuel filter cartridge candidate; reference WIX WF10624 (WIX discontinued 10/2026). HD diesel equipment. Reference dimensions: H 157 mm, OD top 81.5 mm, OD bottom 69.3 mm, ID bottom 15 mm; upper end closed. Synthetic media per WIX. ELIMFILTERS production, filtration rating and physical fit NOT verified. Source: https://www.wixfilters.com/en-ap/catalog/results/product.html/wf10624_wix.html';
if (!process.env.DATABASE_URL) {
  console.error('BLOCKED: DATABASE_URL is not set. No database changes.');
  process.exitCode = 2;
} else {
  const client = new Client({connectionString:process.env.DATABASE_URL});
  (async()=>{
    await client.connect();
    try {
      await client.query('BEGIN');
      // Serialize concurrent enrollment of this exact SKU.
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[SKU]);
      const existing=await client.query(
        'SELECT sku,codigo_base,filter_type,duty,technology FROM elimfilters_catalog WHERE sku=$1 OR codigo_base=$2',
        [SKU,SOURCE]);
      const competitors=await client.query(
        `SELECT sku FROM elimfilters_catalog
         WHERE competitor_codes::text ILIKE $1 OR oem_codes::text ILIKE $1
         ORDER BY sku LIMIT 50`, ['%'+SOURCE+'%']);
      console.log(JSON.stringify({mode:APPLY?'APPLY_REQUESTED':'DRY_RUN',sku:SKU,wix:SOURCE,
        existing:existing.rows, source_matches:competitors.rows,oe_count:oemCodes.length,
        dimensions:'WIX reference only; no ELIMFILTERS physical certification'},null,2));
      if(existing.rowCount || competitors.rowCount){
        console.error('BLOCKED: existing SKU/source reference. Reconcile duplicates before writing.');
        await client.query('ROLLBACK');process.exitCode=3;return;
      }
      // Duty is confirmed from WIX off-road/industrial applications, not from the numeric SKU.
      if(APPLY){
        await client.query(
          `INSERT INTO elimfilters_catalog
           (sku,codigo_base,filter_type,duty,technology,oem_codes,competitor_codes,description)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8)`,
          [SKU,SOURCE,'Fuel Filter','HEAVY_DUTY','SYNTAPORE™',
            JSON.stringify(oemCodes),JSON.stringify(competitorCodes),description]);
        await client.query('COMMIT');
        console.log('APPLIED: EF90624 catalog record written; engineering certification still pending.');
      } else {
        await client.query('ROLLBACK');
        console.log('DRY_RUN COMPLETE: zero database writes.');
      }
    } catch(err) {
      try {await client.query('ROLLBACK');}catch(_){}
      console.error('BLOCKED:',err.message);process.exitCode=4;
    } finally {await client.end();}
  })().catch(err=>{console.error('BLOCKED:',err.message);process.exitCode=5;});
}
