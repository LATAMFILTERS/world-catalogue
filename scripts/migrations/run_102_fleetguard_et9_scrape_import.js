'use strict';
require('dotenv').config();
const fs=require('fs');
const path=require('path');
const {Pool}=require('pg');
const {FUNCTION_SQL}=require('./run_073_catalog_codigo_base_governance_v31');
const DATA=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','fleetguard_et9_reference_groups_183_20260916.json'),'utf8'));
const MIGRATION='102_FLEETGUARD_ET9_SCRAPE_IMPORT';
const CONFIRMED=new Set(['FH23029','FH23061','FH23600','FH23060','FH23616M','FH23815VG','FH23068M','FH21462','FH22168','3967890S']);
const PROVISIONAL_BRANCH=`IF duty_text = 'HEAVY_DUTY' AND coalesce(gov->>'state','') = 'SOURCE_VERIFIED_PENDING_CANONICAL_AUTHORITY' THEN
    IF coalesce((gov->>'source_identity_verified')::boolean,false) IS NOT TRUE OR coalesce(gov->>'source_authority','') <> 'FLEETGUARD_OFFICIAL' OR approved_manufacturer <> 'FLEETGUARD' OR approved_code_norm = '' OR approved_code_norm <> base_norm THEN
      RAISE EXCEPTION 'CATALOG_POLICY_V31: provisional Fleetguard source identity is not fully evidenced for SKU %', NEW.sku;
    END IF;
    RETURN NEW;
  END IF;

  IF duty_text = 'HEAVY_DUTY' THEN`;
const POLICY_SQL=FUNCTION_SQL.replace("IF duty_text = 'HEAVY_DUTY' THEN",PROVISIONAL_BRANCH);
function uniq(a,key){const m=new Map();for(const x of a||[])m.set(key(x),x);return [...m.values()]}
function publicDescription(row){const type=row.officialTypes.find(x=>/Fuel Filter (Housing|Head)/i.test(x))||'Fuel Filter Housing';return `ELIMFILTERS® ${row.sku} ${type}. TURBOCORE™ fuel-system protection component for heavy-duty applications.`}
function fleetguardAlternates(row){
  return (row.sourceReferences||[]).filter(x=>x!==row.codigo_base).map(code=>({manufacturer:'FLEETGUARD',code,classification:'AFTERMARKET',source_url:`https://www.fleetguard.com/product/${code}`}));
}
function oemCodes(row){
  return uniq((row.oemCrossReferences||[]).filter(x=>x.manufacturer&&x.partNumber).map(x=>({manufacturer:x.manufacturer,code:x.partNumber,classification:'OEM',source_url:row.sourceUrls?.[0]||null})),x=>`${x.manufacturer}|${x.code}`);
}
function equipment(row){
  return uniq((row.equipmentApplications||[]).map(x=>({equipment:x.equipment||'',engine:x.engine||'',year:x.year||'',qtyRequired:x.qtyRequired||'',source_url:row.sourceUrls?.[0]||null})).filter(x=>x.equipment||x.engine),x=>JSON.stringify(x));
}
async function dbHash(client,payload){const r=await client.query('select md5($1::jsonb::text) h',[JSON.stringify(payload)]);return r.rows[0].h}
function canonicalGovernance(row,confirmed){
  const base=row.codigo_base, now=new Date().toISOString();
  if(confirmed)return {policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED',required_authority:'VERIFIED_AFTERMARKET_FALLBACK',approved_codigo_base:base,current_codigo_base:base,approved_manufacturer:'FLEETGUARD',approved_source_column:'COMPETITOR_CODES',donaldson_absence_verified:true,fallback_manufacturer_verified:true,fallback_commercial_code_verified:true,verification_method:'ELIMFILTERS_TEAM_MANUFACTURER_CONFIRMATION_PLUS_FLEETGUARD_OFFICIAL_PAGE',verified_at:now};
  return {policy_version:'2026-08-19-v3.1',state:'SOURCE_VERIFIED_PENDING_CANONICAL_AUTHORITY',required_authority:'DONALDSON_OR_VERIFIED_ABSENCE',approved_codigo_base:base,current_codigo_base:base,approved_manufacturer:'FLEETGUARD',approved_source_column:'COMPETITOR_CODES',source_identity_verified:true,source_authority:'FLEETGUARD_OFFICIAL',canonical_authority_pending:true,verified_at:now};
}
async function applicationGovernance(client,row,apps){
  if(!apps.length)return null;
  const h=await dbHash(client,apps), url=row.sourceUrls?.[0]||null, meta=JSON.stringify({migration:MIGRATION,source_urls:row.sourceUrls||[]});
  for(const kind of ['EQUIPMENT',...(apps.some(x=>x.engine)?['ENGINE']:[])]){
    await client.query(`insert into catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) values($1,$2,$3,'FLEETGUARD_OFFICIAL',$4,true,now(),$5::jsonb) on conflict do nothing`,[row.sku,kind,h,url,meta]);
  }
  return {policy_version:'2026-08-19-app-v1',evidence_recorded:true,evidence_authority:'FLEETGUARD_OFFICIAL',equipment_verified:true,equipment_db_payload_hash:h,engine_verified:apps.some(x=>x.engine),engine_db_payload_hash:apps.some(x=>x.engine)?h:null};
}
function enrichment(row,cgov,agov){return {codigo_base_governance:cgov,...(agov?{application_governance:agov}:{}),fleetguard_official_evidence:{source_references:row.sourceReferences||[],source_urls:row.sourceUrls||[],official_types:row.officialTypes||[],official_descriptions:row.descriptions||[],specifications:row.specifications||[],applicable_regions:row.applicableRegions||[],related_parts:row.relatedParts||[],oem_cross_references:row.oemCrossReferences||[],obsolete_all:row.obsoleteAll===true,obsolete_any:row.obsoleteAny===true,scrape_dataset:'fleetguard_et9_reference_groups_183_20260916.json',scraped_reference_count:187,grouped_identity_count:183}}}
async function applyFleetguardEt9ScrapeImport(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing catalog database URL');
  const pool=new Pool({connectionString:url,ssl:{rejectUnauthorized:false},max:1});const client=await pool.connect();
  const report={migration:MIGRATION,source_references:187,groups:DATA.rows.length,inserted:0,updated:0,skipped:0,rejected:[],canonical_confirmed:0,provisional:0,applications:0,oem_refs:0,alternate_refs:0};
  try{
    await client.query('begin');await client.query(POLICY_SQL);await client.query('commit');
    for(const row of DATA.rows){
      try{
        await client.query('begin');
        const current=await client.query('select sku,codigo_base from elimfilters_catalog where sku=$1 for update',[row.sku]);
        if(current.rowCount&&String(current.rows[0].codigo_base||'').toUpperCase()!==String(row.codigo_base||'').toUpperCase()){await client.query('rollback');report.skipped++;report.rejected.push({sku:row.sku,reason:'EXISTING_CODIGO_BASE_CONFLICT',existing:current.rows[0].codigo_base,incoming:row.codigo_base});continue}
        const apps=equipment(row), alts=fleetguardAlternates(row), oems=oemCodes(row), confirmed=CONFIRMED.has(row.codigo_base);
        const agov=await applicationGovernance(client,row,apps), cgov=canonicalGovernance(row,confirmed), enrich=enrichment(row,cgov,agov);
        const params=[row.sku,row.codigo_base,publicDescription(row),JSON.stringify(oems),JSON.stringify(alts),JSON.stringify(enrich),JSON.stringify(apps)];
        const sql=`insert into elimfilters_catalog(sku,codigo_base,filter_type,technology,duty,description,installation_type,oem_codes,competitor_codes,enrichment_data,equipment_applications,created_at)
          values($1,$2,'fuel','TURBOCORE™','HEAVY_DUTY',$3,'Housing/Head Assembly',$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,now())
          on conflict(sku) do update set description=excluded.description,filter_type=excluded.filter_type,technology=excluded.technology,duty=excluded.duty,installation_type=excluded.installation_type,oem_codes=excluded.oem_codes,competitor_codes=excluded.competitor_codes,enrichment_data=excluded.enrichment_data,equipment_applications=excluded.equipment_applications
          returning (xmax=0) inserted`;
        const saved=await client.query(sql,params);await client.query('commit');
        if(saved.rows[0]?.inserted)report.inserted++;else report.updated++;
        if(confirmed)report.canonical_confirmed++;else report.provisional++;
        report.applications+=apps.length;report.oem_refs+=oems.length;report.alternate_refs+=alts.length;
      }catch(e){try{await client.query('rollback')}catch(_){}report.rejected.push({sku:row.sku,codigo_base:row.codigo_base,reason:e.message});report.skipped++}
    }
    try{const r=await client.query(`select count(*)::int n from elimfilters_catalog where sku=any($1::text[])`,[DATA.rows.map(x=>x.sku)]);report.catalog_rows=r.rows[0].n}catch(e){report.verification_error=e.message}
    try{const r=await client.query('select refresh_crossref_cache() as count');report.crossref_cache=r.rows[0]?.count??null}catch(e){report.crossref_cache_error=e.message}
    return report;
  }finally{client.release();await pool.end()}
}
if(require.main===module){applyFleetguardEt9ScrapeImport().then(r=>console.log('[fleetguard-et9-scrape-import]',JSON.stringify(r))).catch(e=>{console.error('[fleetguard-et9-scrape-import] failed',e.stack||e.message);process.exit(1)})}
module.exports={MIGRATION,applyFleetguardEt9ScrapeImport};
