'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const TARGET='EL38936';
const OP=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block1_operator_canonical_20260923.json');
const REFS=path.resolve(__dirname,'../candidates/premium_guard_oil_phase3_block1_full_refs_20260923.json');
const WRONG=new Map([
 ['1269907',['EF96916','EF97917','EL39069','EL82008']],
 ['2446R332D11',['EL39069']],
 ['2446R332D12',['EL39069']],
 ['2631145010',['EL30703']],
 ['84218257',['EL39069']],
 ['85675',['EF31045','EL82008']],
 ['LF3830',['EL82008']],
 ['LF456',['EL82008']],
 ['LFP3307',['EL39069','EL82008']],
 ['LFP8752',['EL39069']],
 ['ME013307',['EL39069','EL82008']],
 ['ME013343',['EL39069','EL82008']],
 ['ME088532',['EL39069','EL82008']],
 ['ME202472',['EL39069','EL82008']],
 ['ME215002',['EL39069','EL82008']],
 ['ME974236',['EL82008']],
 ['VAME215002',['EL39069']],
 ['W9069',['EL82008']]
]);
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const op=JSON.parse(fs.readFileSync(OP,'utf8')).find(x=>x.sku===TARGET);
 const refs=JSON.parse(fs.readFileSync(REFS,'utf8')).find(x=>x.sku===TARGET);
 if(!op||!refs)throw new Error('MANIFEST_MISSING');
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET};await db.connect();
 try{
  await db.query('BEGIN');
  const skus=[TARGET,...new Set([...WRONG.values()].flat())];
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[skus]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET);if(!target)throw new Error('TARGET_MISSING');
  if(target.codigo_base!=='PH8936'||target.filter_type!=='oil'||target.duty!=='LIGHT_DUTY'||target.canonical_source_brand!=='FRAM')throw new Error('TARGET_IDENTITY_MISMATCH');
  const codesBySku=new Map();
  for(const [code,owners] of WRONG)for(const sku of owners){
    if(!codesBySku.has(sku))codesBySku.set(sku,new Set());
    codesBySku.get(sku).add(code);
  }
  const fixes=[];
  for(const [sku,codesSet] of codesBySku){
    const row=by.get(sku);if(!row)throw new Error('WRONG_OWNER_MISSING_'+sku);
    const codes=[...codesSet];
    const incompatible=row.filter_type!=='oil'||Math.abs(Number(row.outer_diameter_mm||0)-Number(target.outer_diameter_mm||0))>10||Math.abs(Number(row.height_mm||0)-Number(target.height_mm||0))>10||String(row.thread_size||'')!==String(target.thread_size||'');
    if(!incompatible)throw new Error('OWNER_NOT_PROVEN_INCOMPATIBLE_'+sku);
    const nextOem=(row.oem_codes||[]).filter(x=>!codes.includes(refCode(x)));
    const nextComp=(row.competitor_codes||[]).filter(x=>!codes.includes(refCode(x)));
    const removed=(row.oem_codes||[]).length-nextOem.length+(row.competitor_codes||[]).length-nextComp.length;
    if(removed<codes.length)throw new Error('EXPECTED_COLLISIONS_NOT_PRESENT_'+sku);
    const validation=assertGovernedCatalogPatch(row,{oem_codes:nextOem,competitor_codes:nextComp},{referenceCorrection:true,correctionEvidence:{
      authority:'PREMIUM_GUARD_HG50040_PLUS_FRAM_PH8936',
      source_url:'https://api.pgfilters.com/catalog/api/v1/products/HG50040/interchanges',
      evidence_hash:'6a5afd9e4fcb6578e5f101fd552811a0067a30ccfdcfdc4ab1dff27c7628639d',
      reason:'Remove PH8936/HG50040 oil-family references from physically incompatible or cross-category owner.'
    }});
    fixes.push({sku,row,codes,nextOem,nextComp,removed,validation});
  }
  const old=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
    policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',
    origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:'PH8936',approved_source_column:'CANONICAL_POLICY',
    current_codigo_base:'PH8936',primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',
    oem_code_count:refs.oem_codes.length,competitor_code_count:refs.competitor_codes.length,observed_primary_candidates:[],
    verified_equivalents:[],evidence_note:'FRAM PH8936 is canonical LD non-European oil authority; HG50040 is the reviewed Premium Guard family reference.'
  },reference_governance_resolution:{
    status:'RESOLVED_CROSS_CATEGORY_AND_PHYSICAL_COLLISIONS',
    canonical_sku:TARGET,collision_count:WRONG.size,resolved_codes:[...WRONG.keys()].sort(),
    authority:'PREMIUM_GUARD_HG50040_PLUS_FRAM_PH8936',verified_at:new Date().toISOString()
  }};
  report.target_gateway=assertGovernedCatalogPatch(target,{enrichment_data:nextEn});
  report.preflight={fix_count:fixes.length,collision_codes:WRONG.size,oem:refs.oem_codes.length,competitors:refs.competitor_codes.length,applications:op.vehicle_applications.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  for(const f of fixes){
    await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where sku=$3',[JSON.stringify(f.nextOem),JSON.stringify(f.nextComp),f.sku]);
    await db.query("delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[f.sku,f.codes]);
    await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[f.sku,f.codes]);
  }
  await db.query('update public.elimfilters_catalog set enrichment_data=$1::jsonb where sku=$2',[JSON.stringify(nextEn),TARGET]);
  for(const sku of skus)await db.query('select refresh_crossref_cache_sku($1)',[sku]);
  const collisions=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=any($1::text[]) group by v.code having count(distinct v.sku)>1 order by v.code",[[...WRONG.keys()]]);
  report.post_collisions=collisions.rows;
  if(collisions.rowCount)throw new Error('POST_COLLISIONS_REMAIN:'+JSON.stringify(collisions.rows));
  const audit=(await db.query("select sku,codigo_base,canonical_source_brand,canonical_source_code,jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) comp_count,jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) app_count,enrichment_data from public.elimfilters_catalog where sku=$1",[TARGET])).rows[0];
  report.audit={sku:audit.sku,codigo_base:audit.codigo_base,canonical_source_brand:audit.canonical_source_brand,canonical_source_code:audit.canonical_source_code,oem_count:audit.oem_count,comp_count:audit.comp_count,app_count:audit.app_count,governance:audit.enrichment_data?.codigo_base_governance};
  if(audit.codigo_base!=='PH8936'||audit.canonical_source_brand!=='FRAM'||Number(audit.oem_count)!==12||Number(audit.comp_count)!==13||Number(audit.app_count)!==11||audit.enrichment_data?.codigo_base_governance?.state!=='CANONICAL_VERIFIED')throw new Error('TARGET_AUDIT_FAILED');
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run141]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run141] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
