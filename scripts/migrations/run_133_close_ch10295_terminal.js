'use strict';
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const SKU='EL30295';
const HELD=['7041','7310'];
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',sku:SKU};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[SKU]);
  if(q.rowCount!==1)throw new Error('SKU_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!=='CH10295'||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY'||row.canonical_source_brand!=='FRAM')throw new Error('CANONICAL_IDENTITY_MISMATCH');
  const codes=new Set([...(row.oem_codes||[]),...(row.competitor_codes||[])].map(refCode));
  if(codes.has('7041')||codes.has('7310'))throw new Error('HELD_BASE_COLLISION_STILL_PUBLISHED');
  if(!codes.has('HU7062Z'))throw new Error('MANN_EQUIVALENT_MISSING');
  if((row.oem_codes||[]).length!==5||(row.competitor_codes||[]).length!==45||(row.vehicle_applications||[]).length!==13)throw new Error('COUNT_MISMATCH');
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const next={...old,
    codigo_base_governance:{...(old.codigo_base_governance||{}),
      policy_version:'2026-08-29-regional-v3.2',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'NON_EUROPEAN',
      approved_manufacturer:'FRAM',
      approved_codigo_base:'CH10295',
      approved_source_column:'CANONICAL_POLICY',
      current_codigo_base:'CH10295',
      primary_manufacturer_verified:true,
      required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
      oem_code_count:5,
      competitor_code_count:45,
      observed_primary_candidates:[],
      verified_equivalents:['MANN-FILTER HU7062Z'],
      evidence_note:'FRAM CH10295 is canonical LD non-European oil authority; MANN-FILTER HU7062Z is a verified equivalent. NAPA 7041 and 7310 are held because active base-code identities in other filter categories outrank xref search.'
    },
    reference_governance_hold:{
      status:'HELD_ACTIVE_BASE_COLLISION',
      reason:'PUBLIC_SEARCH_BASE_PRECEDENCE',
      held_codes:HELD,
      held_code_owners:{
        '7041':{sku:'EF37041',filter_type:'fuel'},
        '7310':{sku:'EA37310',filter_type:'air'}
      },
      publication_rule:'FAIL_CLOSED_UNTIL_BRAND_AWARE_OR_CANONICAL_RESOLUTION',
      verified_at:new Date().toISOString()
    }
  };
  report.gateway=assertGovernedCatalogPatch(row,{enrichment_data:next});
  const refs=[...codes];
  const base=await db.query(`select regexp_replace(upper(coalesce(codigo_base,'')),'[^A-Z0-9]','','g') code,array_agg(sku order by sku) skus from public.elimfilters_catalog_active_v where sku<>$1 and regexp_replace(upper(coalesce(codigo_base,'')),'[^A-Z0-9]','','g')=any($2::text[]) group by 1`,[SKU,refs]);
  const v5=await db.query(`select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=any($1::text[]) group by v.code`,[refs]);
  const failures=v5.rows.filter(r=>r.skus.length!==1||r.skus[0]!==SKU);
  report.preflight={base_collisions:base.rows,v5_failures:failures,held:HELD};
  if(base.rowCount||failures.length)throw new Error('PUBLISHED_REFERENCE_SAFETY_FAILED');
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku=$2',[JSON.stringify(next),SKU]);
  await db.query('select refresh_crossref_cache_sku($1)',[SKU]);
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run133]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run133] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
