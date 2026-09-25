'use strict';
const fs=require('fs'),path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--apply');
const TARGET='EL36014';
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_pg99817ex_blocked_20260924.json');
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const refCode=x=>norm(x?.code||x?.part_number||x?.reference);
async function run(){
 const m=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
 const codes=[...new Set([...m.interchanges.map(x=>norm(x.partIntPartNumber)),'PG99817EX'])];
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET,blocked_reason:m.blocked_reason};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=$1 for update',[TARGET]);if(q.rowCount!==1)throw new Error('TARGET_NOT_FOUND');
  const row=q.rows[0];
  if(row.codigo_base!=='HU6014Z'||row.filter_type!=='oil'||row.duty!=='LIGHT_DUTY')throw new Error('TARGET_IDENTITY_MISMATCH');
  const nextOem=(row.oem_codes||[]).filter(x=>!codes.includes(refCode(x)));
  const nextComp=(row.competitor_codes||[]).filter(x=>!codes.includes(refCode(x)));
  const removed=(row.oem_codes||[]).length-nextOem.length+(row.competitor_codes||[]).length-nextComp.length;
  if(!removed)throw new Error('NO_WRONG_FAMILY_REFERENCES_FOUND');
  report.correction_gateway=assertGovernedCatalogPatch(row,{oem_codes:nextOem,competitor_codes:nextComp},{referenceCorrection:true,correctionEvidence:{
   authority:'MANN_FILTER_W6014_PLUS_PREMIUM_GUARD_PG99817EX',
   source_url:m.evidence.mann_w6014.url,
   evidence_hash:m.evidence.mann_w6014.sha256,
   reason:'Remove incompatible W6014/PG99817EX Alfa Romeo spin-on family from HU6014Z BMW cartridge target.'
  }});
  const old=row.enrichment_data&&typeof row.enrichment_data==='object'?row.enrichment_data:{};
  const nextEn={...old,reference_governance_block:{...(old.reference_governance_block||{}),
   premium_guard_code:'PG99817EX',rejected_authority_code:'W6014',
   status:'BLOCKED_INCOMPATIBLE_PHYSICAL_FAMILY',blocked_reason:m.blocked_reason,
   target_codigo_base:'HU6014Z',target_geometry:m.queue_target_identity.geometry,
   rejected_geometry:m.source_family.geometry,evidence:m.evidence,verified_at:new Date().toISOString()
  }};
  report.block_gateway=assertGovernedCatalogPatch(row,{enrichment_data:nextEn});
  report.preflight={oem_before:(row.oem_codes||[]).length,oem_after:nextOem.length,comp_before:(row.competitor_codes||[]).length,comp_after:nextComp.length,removed};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb where sku=$4',[JSON.stringify(nextOem),JSON.stringify(nextComp),JSON.stringify(nextEn),TARGET]);
  await db.query("delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(oem_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[TARGET,codes]);
  await db.query("delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1 and regexp_replace(upper(coalesce(competitor_part_number,'')),'[^A-Z0-9]','','g')=any($2::text[])",[TARGET,codes]);
  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
  const remain=await db.query("select code,sku,manufacturer from public.v_api_resolver_v5 where code=any($1::text[]) and sku=$2 order by code,manufacturer",[codes,TARGET]);
  report.remaining_wrong_routes=remain.rows;
  if(remain.rowCount)throw new Error('WRONG_FAMILY_STILL_RESOLVES:'+JSON.stringify(remain.rows));
  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run139]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run139] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};
