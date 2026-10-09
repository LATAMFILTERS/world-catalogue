'use strict';
const fs=require('fs');
require('dotenv').config();
const {Client}=require('pg');
const OUTPUT_ARG=process.argv.find(a=>a.startsWith('--output='));
const OUTPUT=OUTPUT_ARG?OUTPUT_ARG.slice('--output='.length):null;
const policy=require('../lib/catalog-codigo-base-policy');
const {normalizeCode:n,normalizeManufacturer:brand,governanceFrom,evaluateCodigoBase,lastFourNumeric,approvedHdCollisionFallbackReady,approvedLdOemCollisionReady}=policy;
const {validateAlternateClassification}=require('../lib/catalog-write-gateway');
const mappings=[['public.exact_part_reference','sku'],['public.kit_components','filter_sku'],['public.product_element','elimfilters_sku'],['public.product_model','elimfilters_sku'],['public.kg_product_equipment','product_sku'],['public.kg_crossrefs','product_sku'],['public.catalog_sku_certification','sku'],['public.catalog_codigo_base_evidence','sku'],['public.codigo_base_review_queue','sku'],['public.catalog_codigo_base_sanitation_queue','sku'],['public.hermes_catalogue_backlog','sku'],['public.hermes_catalogue_dossier','sku'],['public.hermes_catalogue_evidence','sku'],['ld_catalog.ld_product_catalog','elimfilters_sku'],['ld_catalog.ld_vehicle_applications','elimfilters_sku'],['ld_catalog.ld_oem_cross_references','elimfilters_sku'],['ld_catalog.ld_competitor_cross_references','elimfilters_sku'],['ld_catalog.ld_product_specifications','elimfilters_sku'],['ld_catalog.ld_production_readiness','elimfilters_sku'],['public.crossref_resolved_cache','sku']];
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
 if(!url)throw new Error('CATALOG_DATABASE_URL_REQUIRED');
 const db=new Client({connectionString:url,ssl:new URL(url).searchParams.get('sslmode')==='disable'?false:{rejectUnauthorized:false},connectionTimeoutMillis:15000});await db.connect();
 try{
  await db.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const rows=(await db.query('SELECT * FROM public.elimfilters_catalog ORDER BY sku')).rows;
  const bySku=new Map(rows.map(r=>[r.sku,r]));const active=rows.filter(r=>r.catalog_active===true);
  const columns=(await db.query("SELECT table_schema,table_name,column_name FROM information_schema.columns WHERE table_schema IN ('public','ld_catalog')")).rows;
  const has=(table,col)=>columns.some(c=>c.table_schema+'.'+c.table_name===table&&c.column_name===col);
  const anomalies=[];const add=(sku,classification,reason,detail)=>anomalies.push({sku,classification,reason,...(detail?{detail}:{} )});
  const bases=new Map(), refs=new Map(), family=new Map();
  for(const r of active){
   const gov=governanceFrom(r);const verdict=evaluateCodigoBase(r);
   for(const column of ["oem_codes","competitor_codes"])if(r[column]!=null&&!Array.isArray(r[column]))add(r.sku,"POLICY_VIOLATION","MALFORMED_ALTERNATE_ARRAY",{column});
   for(const violation of validateAlternateClassification({...r,oem_codes:Array.isArray(r.oem_codes)?r.oem_codes:[],competitor_codes:Array.isArray(r.competitor_codes)?r.competitor_codes:[]}))add(r.sku,'POLICY_VIOLATION',violation.reason,violation);
   if(gov.primary_manufacturer_verified===true&&gov.donaldson_absence_verified===true)add(r.sku,'EVIDENCE_ANOMALY','PRIMARY_VERIFIED_AND_ABSENCE_VERIFIED');
   if(r.canonical_source_status==='VERIFIED'&&(!r.canonical_source_brand||!r.canonical_source_code))add(r.sku,'POLICY_VIOLATION','CANONICAL_VERIFIED_WITHOUT_BRAND_OR_CODE');
   if(!verdict.valid)add(r.sku,'POLICY_VIOLATION',verdict.reason);
   const prefix=['EA1','EA2','EF9','EL8','EH6'].find(p=>r.sku.startsWith(p));const suffix=lastFourNumeric(r.codigo_base);
   if(prefix&&suffix&&r.sku!==prefix+suffix){const target=prefix+suffix;add(r.sku,bySku.has(target)?'IDENTITY_COLLISION':'REQUIRES_AUTHORITY_RESEARCH','SKU_NUMERIC_SUFFIX_INVALID',{target,target_base:bySku.get(target)?.codigo_base||null,primary_verified:gov.primary_manufacturer_verified===true});}
   if(r.canonical_source_code&&n(r.codigo_base)!==n(r.canonical_source_code)&&!approvedHdCollisionFallbackReady(r,'FLEETGUARD')&&!approvedHdCollisionFallbackReady(r,'OEM')&&!approvedLdOemCollisionReady(r))add(r.sku,'POLICY_VIOLATION','CANONICAL_BASE_MISMATCH',{base:r.codigo_base,canonical:r.canonical_source_code});
   const key=brand(r.canonical_source_brand)+'|'+n(r.codigo_base);if(!bases.has(key))bases.set(key,[]);bases.get(key).push(r.sku);
   const b=brand(r.canonical_source_brand)||'UNASSIGNED';if(!family.has(b))family.set(b,{manufacturer:b,catalogued:0,canonical_verified:0,primary_verified:0,official_universe:null,coverage_percentage:null});const f=family.get(b);f.catalogued++;if(r.canonical_source_status==='VERIFIED')f.canonical_verified++;if(gov.primary_manufacturer_verified===true)f.primary_verified++;
   for(const column of ['oem_codes','competitor_codes'])for(const ref of Array.isArray(r[column])?r[column]:[]){
    if(!ref||typeof ref!=='object')continue;const rb=brand(ref.manufacturer||ref.brand||ref.oem);const code=n(ref.code||ref.reference);if(!code)continue;const rk=rb+'|'+code;if(!refs.has(rk))refs.set(rk,new Map());refs.get(rk).set(r.sku,column);
    const cls=String(ref.classification||'').toUpperCase();if((column==='oem_codes'&&['AFTERMARKET','CROSS_REFERENCE'].includes(cls))||(column==='competitor_codes'&&cls==='OEM'))add(r.sku,'POLICY_VIOLATION','ALTERNATE_CLASSIFICATION_ERROR',{column,manufacturer:rb,code,classification:cls});
   }
  }
  for(const [key,skus] of bases)if(skus.length>1)add(skus[0],'REQUIRES_AUTHORITY_RESEARCH','DUPLICATE_BASE_CANDIDATE',{key,skus});
  for(const [key,skus] of refs)if(skus.size>1){const types=new Set([...skus.keys()].map(s=>String(bySku.get(s).filter_type||'').toUpperCase()));if(types.size>1)add([...skus.keys()][0],'REQUIRES_AUTHORITY_RESEARCH','MANUFACTURER_REFERENCE_MULTIPLE_FILTER_TYPES',{key,skus:[...skus.keys()],types:[...types]});}
  const deps=[];
  for(const [table,col] of mappings){if(!has(table,col)){deps.push({table,column:col,status:'ABSENT'});continue;}const broken=(await db.query(`SELECT d.${col} AS sku,count(*)::int AS rows FROM ${table} d LEFT JOIN public.elimfilters_catalog c ON c.sku=d.${col} WHERE d.${col} IS NOT NULL AND btrim(d.${col}::text)<>'' AND c.sku IS NULL GROUP BY d.${col} ORDER BY d.${col}`)).rows;deps.push({table,column:col,status:broken.length?'FAIL':'PASS',broken});for(const r of broken)add(r.sku,'DEPENDENCY_REPAIR','BROKEN_DEPENDENCY',{table,column:col,rows:r.rows});}
  let ledger=[];if(has('public.catalog_codigo_base_evidence','sku'))ledger=(await db.query('SELECT sku,manufacturer,reference_code,evidence_kind,source_url,evidence_hash,verified_at,metadata FROM public.catalog_codigo_base_evidence')).rows;
  const official=ledger.filter(e=>e.verified_at&&e.source_url&&e.evidence_hash&&/OFFICIAL|MANUFACTURER/i.test(e.evidence_kind));
  const verifiedKeys=new Set(official.map(e=>e.sku+'|'+brand(e.manufacturer)+'|'+n(e.reference_code)));
  for(const r of active)if(governanceFrom(r).primary_manufacturer_verified===true&&!verifiedKeys.has(r.sku+'|'+brand(r.canonical_source_brand)+'|'+n(r.canonical_source_code)))add(r.sku,'EVIDENCE_ANOMALY','PRIMARY_VERIFIED_WITHOUT_COMPLETE_LEDGER',{canonical_brand:r.canonical_source_brand,canonical_code:r.canonical_source_code});
  const special={catalog:rows.filter(r=>['EA15551','EH65409','EH66486','EA12858','EL82015','EL82024','EF90094'].includes(r.sku)).map(r=>({sku:r.sku,base:r.codigo_base,active:r.catalog_active,canonical_brand:r.canonical_source_brand,canonical_code:r.canonical_source_code,governance:governanceFrom(r)})),elements:has('public.product_element','element_code')?(await db.query("SELECT * FROM public.product_element WHERE element_code='EA15551' OR elimfilters_sku=ANY($1::text[])",[['EA15551','EH65409','EH66486']])).rows:[],deere_refs:active.flatMap(r=>['oem_codes','competitor_codes'].flatMap(column=>(Array.isArray(r[column])?r[column]:[]).filter(ref=>['UC16183','UC21217','MIU13224','MIA881446','1365409'].includes(n(ref?.code))).map(ref=>({sku:r.sku,column,ref}))))};
  if(has('public.product_element','element_code')){const elements=(await db.query('SELECT id,element_code,elimfilters_sku FROM public.product_element WHERE elimfilters_sku IS NOT NULL')).rows;for(const e of elements)if(/^EA[12]/.test(e.element_code||'')&&/^EH6/.test(e.elimfilters_sku||''))add(e.elimfilters_sku,'GRAPH_CORRUPTION','AIR_ELEMENT_LINKED_TO_HYDRAULIC_SKU',e);}
  const ledgerGroups=new Map();for(const e of ledger){const key=[e.sku,brand(e.manufacturer),n(e.reference_code),e.evidence_kind,e.source_url,e.evidence_hash].join('|');ledgerGroups.set(key,(ledgerGroups.get(key)||0)+1);}for(const [key,count] of ledgerGroups)if(count>1)add(key.split('|')[0],'EVIDENCE_ANOMALY','DUPLICATE_IDENTICAL_EVIDENCE',{key,count});
  const dbFunction=(await db.query("SELECT pg_get_functiondef(p.oid) AS body FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='enforce_elimfilters_codigo_base_policy'")).rows.map(r=>r.body).join('\n');
  const db_policy_structure={function_present:!!dbFunction,handles_sku_updates:/OLD\.sku/i.test(dbFunction),handles_donaldson_collision:/donaldson_sku_collision_verified/i.test(dbFunction),runtime_enforcement_test:'NOT_EXECUTED'};
  const triggers=(await db.query("SELECT t.tgname,t.tgenabled,p.proname FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid WHERE t.tgrelid='public.elimfilters_catalog'::regclass AND NOT t.tgisinternal")).rows;
  const schema=columns.filter(c=>/product_model|product_element|model_element_compatibility|equipment|vehicle_model/.test(c.table_name));
  const counts={};for(const a of anomalies)counts[a.classification]=(counts[a.classification]||0)+1;
  const report={audit:'ELIMFILTERS_STRUCTURAL_INTEGRITY_V1',timestamp:new Date().toISOString(),transaction:'READ_ONLY',mutation_count:0,catalog_integrity:anomalies.length?'FAIL':'PASS',audit_limitations:['Official manufacturer universes are not enumerated by this database audit','Shared references and duplicate bases are review candidates; identity equivalence requires authority','Historical graph edges and migrations require targeted source review','Trigger presence does not prove full enforcement'],db_policy_structure,physical_rows:rows.length,active_rows:active.length,policy_version:policy.POLICY_VERSION,anomaly_counts:counts,anomaly_assertions:anomalies.length,anomalies,dependencies:deps,evidence:{total:ledger.length,complete_official:official.length},special,manufacturer_catalog_baseline:[...family.values()],triggers,schema,status:anomalies.length?'NOT_CLOSED':'BASELINE_PASS'};
  if(OUTPUT)fs.writeFileSync(OUTPUT,JSON.stringify(report,null,2));
  console.log(JSON.stringify({physical_rows:rows.length,active_rows:active.length,anomaly_counts:counts,evidence:report.evidence,dependencies:deps.map(d=>({table:d.table,status:d.status,broken_skus:d.broken?.length||0})),special_elements:special.elements,triggers,status:report.status}));
  await db.query('ROLLBACK');
  if(anomalies.length)process.exitCode=1;
 }finally{await db.end();}
}
main().catch(e=>{console.error(e.code||e.name);process.exitCode=1;});
