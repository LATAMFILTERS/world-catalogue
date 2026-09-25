'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');
const {applyVerifiedApplications}=require('../../lib/catalog-application-write-service');
const APPLY=process.argv.includes('--apply');
const TARGET='EL85570',DUP='EL39293',BASE='P555570';
const MANIFEST=path.resolve(__dirname,'../candidates/premium_guard_oil_hg50012_el85570_strict_20260924.json');
const DONALDSON_URL='https://shop.donaldson.com/store/es-us/product/P555570/20932';
const PG_APP_URL='https://api.pgfilters.com/catalog/api/v1/products/HG50012/applications?format=ranges';
const norm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function years(v){const s=String(v||'');let m=s.match(/(\d{4})-(\d{4})/);if(m)return{year:null,year_from:+m[1],year_to:+m[2]};m=s.match(/(\d{4})/);return m?{year:+m[1],year_from:+m[1],year_to:+m[1]}:{year:null,year_from:null,year_to:null};}
function equipmentApps(m){return m.vehicle_applications.map(a=>({make:a.make,model:a.model,equipment:[a.make,a.model].filter(Boolean).join(' '),type:'TRUCK_OR_EQUIPMENT',engine:a.engine,year:a.year}));}
async function run(){
 const m=JSON.parse(fs.readFileSync(MANIFEST,'utf8'));
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing database URL');
 const db=new Client({connectionString:url,ssl:false});const report={mode:APPLY?'apply':'dry-run',target:TARGET};await db.connect();
 try{
  await db.query('BEGIN');
  const q=await db.query('select * from public.elimfilters_catalog where sku=any($1::text[]) for update',[[TARGET,DUP]]);
  const by=new Map(q.rows.map(r=>[r.sku,r]));const target=by.get(TARGET),dup=by.get(DUP);
  if(!target||!dup)throw new Error('ROWS_MISSING');
  if(target.codigo_base!==BASE||target.filter_type!=='oil'||target.duty!=='HEAVY_DUTY')throw new Error('TARGET_IDENTITY_MISMATCH');
  if(dup.filter_type!=='oil')throw new Error('DUP_FAMILY_MISMATCH');
  report.dup_gateway=assertGovernedCatalogPatch(dup,{catalog_active:false});
  const old=target.enrichment_data&&typeof target.enrichment_data==='object'?target.enrichment_data:{};
  const nextEn={...old,codigo_base_governance:{...(old.codigo_base_governance||{}),
   policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'NON_EUROPEAN',
   approved_manufacturer:'DONALDSON',approved_codigo_base:BASE,approved_source_column:'CANONICAL_POLICY',current_codigo_base:BASE,
   primary_manufacturer_verified:true,required_authority:'DONALDSON_MANUFACTURING_AUTHORITY_SATISFIED',
   oem_code_count:m.oem_codes.length,competitor_code_count:m.competitor_codes.length,
   contamination_flags:[],observed_primary_candidates:[],observed_fallback_candidates:[],observed_preferred_candidates:[],
   verified_equivalents:m.verified_equivalents,
   evidence_note:'Donaldson P555570 is canonical HD oil authority; HG50012/PH3519A/W929/3 are reviewed equivalents. EL39293 is superseded duplicate.'
  },reference_governance_hold:{status:'HELD_AMBIGUOUS_REFERENCES',held_codes:m.reference_governance.held_codes,
   publication_rule:m.reference_governance.publication_rule,verified_at:new Date().toISOString()}};
  report.target_gateway=assertGovernedCatalogPatch(target,{oem_codes:m.oem_codes,competitor_codes:m.competitor_codes,enrichment_data:nextEn});
  report.preflight={oem:m.oem_codes.length,competitors:m.competitor_codes.length,applications:m.vehicle_applications.length,held:m.reference_governance.held_codes.length};
  if(!APPLY){await db.query('ROLLBACK');report.transaction='ROLLBACK';return report;}
  await db.query('update public.elimfilters_catalog set catalog_active=false where sku=$1',[DUP]);
  await db.query('delete from ld_catalog.ld_oem_cross_references where elimfilters_sku=$1',[DUP]);
  await db.query('delete from ld_catalog.ld_competitor_cross_references where elimfilters_sku=$1',[DUP]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1',[DUP]);
  await db.query(`update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb,
   canonical_source_brand='DONALDSON',canonical_source_code=$4::text,canonical_source_url=$5,
   canonical_source_status='VERIFIED',canonical_verified_at=now(),canonical_evidence=$6::jsonb,
   duty_source_brand='DONALDSON',duty_validation_status='VERIFIED',duty_verified_at=now(),duty_evidence=$7::jsonb where sku=$8`,
   [JSON.stringify(m.oem_codes),JSON.stringify(m.competitor_codes),JSON.stringify(nextEn),BASE,DONALDSON_URL,
    JSON.stringify({authority:'DONALDSON',code:BASE,source_url:DONALDSON_URL,premium_guard_code:'HG50012'}),
    JSON.stringify({duty:'HEAVY_DUTY',source:'DONALDSON_OFFICIAL',authority:BASE}),TARGET]);

  const manifestHash=crypto.createHash('sha256').update(fs.readFileSync(MANIFEST)).digest('hex');
  const apps=equipmentApps(m);
  report.public_application_write=await applyVerifiedApplications(db,{sku:TARGET,equipment_applications:apps,vehicle_applications:[],evidence:{
    authority:'DONALDSON_PLUS_PREMIUM_GUARD',source_url:PG_APP_URL,evidence_hash:manifestHash,
    metadata:{canonical_code:BASE,premium_guard_code:'HG50012'}
  }});
  await db.query('select refresh_crossref_cache_sku($1)',[TARGET]);
  await db.query('delete from public.crossref_resolved_cache where sku=$1',[DUP]);
  const audit=(await db.query("select sku,catalog_active,codigo_base,duty,canonical_source_brand,canonical_source_code,jsonb_array_length(coalesce(oem_codes,'[]'::jsonb)) oem_count,jsonb_array_length(coalesce(competitor_codes,'[]'::jsonb)) comp_count,jsonb_array_length(coalesce(equipment_applications,'[]'::jsonb)) app_count,enrichment_data from public.elimfilters_catalog where sku=any($1::text[]) order by sku",[[TARGET,DUP]])).rows;
  const t=audit.find(x=>x.sku===TARGET),d=audit.find(x=>x.sku===DUP);
  if(!t||t.codigo_base!==BASE||t.duty!=='HEAVY_DUTY'||t.canonical_source_brand!=='DONALDSON'||Number(t.oem_count)!==m.oem_codes.length||Number(t.comp_count)!==m.competitor_codes.length||Number(t.app_count)!==m.vehicle_applications.length||t.enrichment_data?.codigo_base_governance?.state!=='CANONICAL_VERIFIED')throw new Error('TARGET_AUDIT_FAILED');
  if(!d||d.catalog_active!==false)throw new Error('DUP_NOT_SUPERSEDED');

  const safe=['HG50012','PH3519A','BT230','LF3342','L30215'];
  const routes=await db.query("select v.code,array_agg(distinct v.sku order by v.sku) skus from public.v_api_resolver_v5 v join public.elimfilters_catalog_active_v a on a.sku=v.sku where v.code=any($1::text[]) group by v.code order by v.code",[safe]);
  report.audit=audit;report.routes=routes.rows;
  const owners=Object.fromEntries(routes.rows.map(r=>[r.code,r.skus]));
  for(const code of safe)if(JSON.stringify(owners[code])!==JSON.stringify([TARGET]))throw new Error('ROUTE_'+code+':'+JSON.stringify(owners[code]||[]));

  await db.query('COMMIT');report.transaction='COMMIT';return report;
 }catch(e){try{await db.query('ROLLBACK')}catch(_){}e.report=report;throw e;}finally{await db.end();}
}
if(require.main===module){run().then(r=>console.log('[run143]',JSON.stringify(r,null,2))).catch(e=>{console.error('[run143] failed',JSON.stringify({error:e.message,report:e.report||null},null,2));process.exit(1)});}
module.exports={run};