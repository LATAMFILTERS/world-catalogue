'use strict';
const fs=require('fs'),crypto=require('crypto'),{Pool}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');
const {applicationPayloadHash}=require('../../lib/catalog-application-governance');
const SOURCE='C:/Work/world-catalogue-hd/scripts/donaldson_fuel_final_results_20260917.json';
const AUDIT='C:/Work/world-catalogue-hd/scripts/donaldson_fuel_final_strict_audit_20260917.json';
const REPORT='C:/Work/world-catalogue-hd/scripts/donaldson_fuel_catalog_apply_report_20260917.json';
const rows=JSON.parse(fs.readFileSync(SOURCE,'utf8')),audit=JSON.parse(fs.readFileSync(AUDIT,'utf8'));
if(!audit.complete||audit.pass!==499||rows.length!==499)throw new Error('FUEL_SOURCE_NOT_COMPLETE');
const norm=v=>String(v||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');
const uniq=(a,key)=>{const s=new Set();return a.filter(x=>{const k=key(x);if(!k||s.has(k))return false;s.add(k);return true})};
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v??null)).digest('hex');
const attr=(r,...names)=>{const a=r.official?.attributes||{};for(const n of names)if(a[n])return a[n];return null};
function mm(v){if(!v)return null;let m=String(v).match(/([\d.]+)\s*mm\b/i);if(m)return +m[1];m=String(v).match(/([\d.]+)\s*(?:inch|in\b)/i);return m?+(+m[1]*25.4).toFixed(3):null}
function title(v){return String(v||'Fuel Filter').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(/Donaldson Blue/,'Donaldson BLUE®')}
function crossRefs(r){return uniq((r.official?.cross_references_raw||[]).filter(x=>x.length>1&&!/manufacturer name/i.test(x[0])).map(x=>({manufacturer:String(x[0]).trim(),code:String(x[1]).trim(),classification:'OEM',source:'DONALDSON_OFFICIAL',source_url:r.source_url})).filter(x=>x.manufacturer&&x.code),x=>norm(x.manufacturer)+'|'+norm(x.code))}
function apps(r){return uniq((r.official?.equipment_raw||[]).filter(x=>x.length>1&&!/^equipment$/i.test(x[0])).map(x=>({equipment:String(x[0]).trim(),year:String(x[1]||'').trim()||null,equipment_type:String(x[2]||'').trim()||null,equipment_options:String(x[3]||'').trim()||null,engine:String(x[4]||'').trim()||null,engine_option:String(x[5]||'').trim()||null,source:'DONALDSON_OFFICIAL',source_url:r.source_url})).filter(x=>x.equipment),x=>[x.equipment,x.year,x.engine,x.equipment_options].map(norm).join('|'))}
function comp(r){return uniq((r.competitor_codes||[]).map(x=>({manufacturer:String(x.manufacturer).trim(),code:String(x.code).trim(),classification:'AFTERMARKET',source:'FUELFILTER_CROSSREFERENCE',source_url:r.competitor_source?.url||null})).filter(x=>x.manufacturer&&x.code),x=>norm(x.manufacturer)+'|'+norm(x.code))}
function merged(a,b){return uniq([...(Array.isArray(a)?a:[]),...b],x=>norm(x.manufacturer||x.brand)+'|'+norm(x.code||x.reference))}
function install(r){const d=(r.official?.description||'').toUpperCase(),s=String(attr(r,'Style')||'').toUpperCase();if(/SPIN[- ]?ON/.test(d+s))return'Spin-On';if(/CARTRIDGE|ELEMENT/.test(d+s))return'Cartridge';if(/BOX/.test(d+s))return'Box';if(/IN[- ]?LINE/.test(d+s))return'In-Line';return'Filter'}
function governance(r){return{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED',required_authority:'DONALDSON_PRIMARY',approved_manufacturer:'DONALDSON',approved_codigo_base:r.codigo_base,current_codigo_base:r.codigo_base,approved_source_column:'CODIGO_BASE',primary_manufacturer_verified:true,verification_method:'DONALDSON_FUEL_OFFICIAL_CATALOG_20260917',verified_at:new Date().toISOString(),evidence_authority:'DONALDSON_OFFICIAL_CATALOG',evidence_url:r.source_url,evidence_level:r.audit?.evidence_level||'OFFICIAL_PRODUCT_PAGE'}}
function candidate(r,before){
 const o=merged(before?.oem_codes,crossRefs(r)).filter(x=>norm(x.code||x.reference)!==norm(r.codigo_base));
 const oCodes=new Set(o.map(x=>norm(x.code||x.reference)));
 const c=merged(before?.competitor_codes,comp(r)).filter(x=>norm(x.code||x.reference)!==norm(r.codigo_base)&&!oCodes.has(norm(x.code||x.reference))),a=apps(r);
 const finalApps=(a.length?a:(before?.equipment_applications||[])).filter(x=>String(x?.equipment||x?.vehicle||x?.application||'').trim()||(String(x?.make||x?.manufacturer||'').trim()&&String(x?.model||'').trim())),attrs=r.official?.attributes||{};
 const appGov={policy_version:'2026-08-19-app-v1',evidence_recorded:true,evidence_authority:'DONALDSON_OFFICIAL_CATALOG',equipment_verified:true,equipment_payload_hash:applicationPayloadHash(finalApps),vehicle_verified:true,vehicle_payload_hash:applicationPayloadHash([]),engine_verified:finalApps.some(x=>x.engine),engine_payload_hash:finalApps.some(x=>x.engine)?applicationPayloadHash(finalApps):null,verified_at:new Date().toISOString(),source_urls:[r.source_url]};
 const enrichment={...(before?.enrichment_data||{}),codigo_base_governance:governance(r),application_governance:appGov,donaldson_fuel_official:{dataset:'donaldson_fuel_final_results_20260917.json',scraped_at:r.scraped_at,source_url:r.source_url,evidence_level:r.audit?.evidence_level||'OFFICIAL_PRODUCT_PAGE',description:r.official?.description,attributes:attrs,cross_references_raw:r.official?.cross_references_raw||[],equipment_raw:r.official?.equipment_raw||[],related_parts:r.official?.related_parts||[],resources:r.official?.resources||[],audit:r.audit,evidence_hash:hash(r)}};
 return{...(before||{}),sku:r.sku,codigo_base:r.codigo_base,filter_type:'fuel',sub_type:r.family==='ES9'?'Fuel Water Separator':'Fuel Filter',technology:r.technology,duty:'HEAVY_DUTY',description:`ELIMFILTERS® ${title(r.official?.description)}.`,name:`ELIMFILTERS® ${title(r.official?.description)}`,installation_type:install(r),thread_size:attr(r,'Thread Size'),height_mm:mm(attr(r,'Length','Height')),outer_diameter_mm:mm(attr(r,'Outer Diameter')),gasket_od_mm:mm(attr(r,'Gasket OD')),gasket_id_mm:mm(attr(r,'Gasket ID')),micron_rating:attr(r,'Efficiency 99.9%','Efficiency 99.95%','Efficiency 99%','Nominal Filtration Rating'),iso_test_method:attr(r,'Efficiency Test Std'),filter_media:attr(r,'Media Type'),oem_codes:o,competitor_codes:c,equipment_applications:finalApps,vehicle_applications:[],alternative_products:r.official?.alternatives||[],image_url:r.official?.image_url||before?.image_url||null,donaldson_url:r.source_url,specs:attrs,enrichment_data:enrichment,canonical_source_brand:'DONALDSON',canonical_source_code:r.codigo_base,canonical_source_url:r.source_url,canonical_source_status:'VERIFIED',canonical_verified_at:new Date().toISOString()};
}
const json=v=>JSON.stringify(v??[]);
async function apply(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!url)throw new Error('Missing catalog database URL');
 const pool=new Pool({connectionString:url,ssl:{rejectUnauthorized:false},max:1}),db=await pool.connect();
 const report={migration:'103_DONALDSON_FUEL_499_20260917',requested:499,inserted:0,updated:0,moved_family:0,rejected:[],before:{},verify:{}};
 try{
  await db.query('BEGIN');
  await db.query(`CREATE TABLE IF NOT EXISTS catalog_fuel_ingest_audit_20260917(id bigserial primary key,sku text not null,codigo_base text not null,action text not null,before_row jsonb,after_row jsonb,created_at timestamptz not null default now())`);
  const pre=await db.query(`select count(*)::int n,count(*) filter(where sku like 'EF9%')::int ef9,count(*) filter(where sku like 'ES9%')::int es9 from elimfilters_catalog where codigo_base=any($1)`,[rows.map(x=>x.codigo_base)]);
  report.before=pre.rows[0];
  for(const row of rows){
   const found=await db.query('select * from elimfilters_catalog where upper(regexp_replace(codigo_base,\'[^A-Z0-9]\',\'\',\'g\'))=$1 for update',[norm(row.codigo_base)]);
   const exact=found.rows.find(x=>x.sku===row.sku);
   const before=exact||(found.rowCount===1?found.rows[0]:null),conflict=await db.query('select sku,codigo_base from elimfilters_catalog where sku=$1 and ($2::int is null or id<>$2)',[row.sku,before?.id||null]);
   if(conflict.rowCount)throw new Error(`SKU_CONFLICT:${row.sku}:${conflict.rows[0].codigo_base}`);
   const v=candidate(row,before);
   {
    const h=(await db.query('select md5($1::jsonb::text) h',[JSON.stringify(v.equipment_applications)])).rows[0].h;
    const vh=(await db.query('select md5($1::jsonb::text) h',['[]'])).rows[0].h;
    const evidence=[['EQUIPMENT',h],['VEHICLE',vh],...(v.equipment_applications.some(x=>x.engine)?[['ENGINE',h]]:[])];
    for(const [kind,payloadHash] of evidence)await db.query(`insert into catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) values($1,$2,$3,'DONALDSON_OFFICIAL_CATALOG',$4,true,now(),$5::jsonb) on conflict do nothing`,[v.sku,kind,payloadHash,v.donaldson_url,JSON.stringify({migration:'103_DONALDSON_FUEL_499_20260917',codigo_base:v.codigo_base})]);
    Object.assign(v.enrichment_data.application_governance,{equipment_db_payload_hash:h,vehicle_db_payload_hash:vh,engine_db_payload_hash:v.equipment_applications.some(x=>x.engine)?h:null});
   }
   assertCanonicalWrite(v,{applicationWrite:true});
   let after;
   const params=[v.sku,v.codigo_base,v.filter_type,v.sub_type,v.technology,v.duty,v.description,v.name,v.installation_type,v.thread_size,v.height_mm,v.outer_diameter_mm,v.gasket_od_mm,v.gasket_id_mm,v.micron_rating,v.iso_test_method,v.filter_media,json(v.oem_codes),json(v.competitor_codes),json(v.equipment_applications),json(v.vehicle_applications),json(v.alternative_products),v.image_url,v.donaldson_url,json(v.specs),JSON.stringify(v.enrichment_data),v.canonical_source_brand,v.canonical_source_code,v.canonical_source_url,v.canonical_source_status,v.canonical_verified_at];
   if(before){
    after=(await db.query(`update elimfilters_catalog set sku=$1,codigo_base=$2,filter_type=$3,sub_type=$4,technology=$5,duty=$6,description=$7,name=$8,installation_type=$9,thread_size=$10,height_mm=$11,outer_diameter_mm=$12,gasket_od_mm=$13,gasket_id_mm=$14,micron_rating=$15,iso_test_method=$16,filter_media=$17,oem_codes=$18::jsonb,competitor_codes=$19::jsonb,equipment_applications=$20::jsonb,vehicle_applications=$21::jsonb,alternative_products=$22::jsonb,image_url=$23,donaldson_url=$24,specs=$25::jsonb,enrichment_data=$26::jsonb,canonical_source_brand=$27,canonical_source_code=$28,canonical_source_url=$29,canonical_source_status=$30,canonical_verified_at=$31 where id=$32 returning *`,[...params,before.id])).rows[0];
    report.updated++;if(before.sku!==v.sku)report.moved_family++;
   }else{
    after=(await db.query(`insert into elimfilters_catalog(sku,codigo_base,filter_type,sub_type,technology,duty,description,name,installation_type,thread_size,height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,micron_rating,iso_test_method,filter_media,oem_codes,competitor_codes,equipment_applications,vehicle_applications,alternative_products,image_url,donaldson_url,specs,enrichment_data,canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19::jsonb,$20::jsonb,$21::jsonb,$22::jsonb,$23,$24,$25::jsonb,$26::jsonb,$27,$28,$29,$30,$31,now()) returning *`,params)).rows[0];report.inserted++;
   }
   await db.query('insert into catalog_fuel_ingest_audit_20260917(sku,codigo_base,action,before_row,after_row) values($1,$2,$3,$4::jsonb,$5::jsonb)',[v.sku,v.codigo_base,before?'UPDATE':'INSERT',JSON.stringify(before),JSON.stringify(after)]);
  }
  const q=await db.query(`select count(*)::int rows,count(distinct sku)::int unique_skus,count(*) filter(where sku like 'EF9%')::int ef9,count(*) filter(where sku like 'ES9%')::int es9,count(*) filter(where technology='SYNTAPORE™')::int syntapore,count(*) filter(where technology='HYDROCORE™')::int hydrocore,count(*) filter(where coalesce(enrichment_data->'donaldson_fuel_official'->>'dataset','')='donaldson_fuel_final_results_20260917.json')::int evidenced,count(*) filter(where description~'\\m(EF9|ES9)\\M')::int category_in_description from elimfilters_catalog where sku=any($1)`,[rows.map(x=>x.sku)]);
  report.verify=q.rows[0];
  report.ok=report.inserted+report.updated===499&&report.verify.rows===499&&report.verify.unique_skus===499&&report.verify.ef9===248&&report.verify.es9===251&&report.verify.syntapore===248&&report.verify.hydrocore===251&&report.verify.evidenced===499&&report.verify.category_in_description===0;
  if(!report.ok)throw new Error('POST_LOAD_AUDIT_FAILED:'+JSON.stringify(report.verify));
  await db.query('COMMIT');fs.writeFileSync(REPORT,JSON.stringify(report,null,2));return report;
 }catch(e){try{await db.query('ROLLBACK')}catch{}report.rejected.push({error:e.message});report.ok=false;fs.writeFileSync(REPORT,JSON.stringify(report,null,2));throw e}
 finally{db.release();await pool.end()}
}
if(require.main===module)apply().then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={apply};
