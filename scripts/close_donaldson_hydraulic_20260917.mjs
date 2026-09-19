import fs from 'fs';
import path from 'path';
let pg;
try { pg = (await import('pg')).default; }
catch { pg = (await import('file:///C:/ELIMSERVER/repos/world-catalogue/node_modules/pg/lib/index.js')).default; }
const { Client } = pg;
const APPLY = process.argv.includes('--apply');
const DIR = 'C:/Work/world-catalogue-hd/scripts';
const DB = process.env.DATABASE_URL || 'postgresql://catalog_admin@127.0.0.1:5441/catalogo_elimfilters?sslmode=disable';
const plan = JSON.parse(fs.readFileSync(path.join(DIR,'donaldson_hydraulic_sku_plan_20260917.json'),'utf8'));
const planByCode = new Map(plan.map(r => [r.code,r]));
const targetCodes = plan.map(r => r.code);
const importRows = fs.readFileSync(path.join(DIR,'donaldson_import_ready.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const importByCode = new Map(importRows.map(r => [r.codigo_base,r]));
let deep = [];
for (const f of fs.readdirSync(DIR).filter(n => /donaldson_hydraulic_critical_batch\d+_results_20260917\.jsonl$/i.test(n)).sort()) {
  for (const line of fs.readFileSync(path.join(DIR,f),'utf8').split(/\r?\n/).filter(Boolean)) deep.push(JSON.parse(line));
}
const deepByCode = new Map(deep.map(r => [r.codigo_base,r]));
const compByCode = new Map();
for (const f of fs.readdirSync(DIR).filter(n => /donaldson_hydraulic_comp_batch\d+_20260917\.json$/i.test(n)).sort()) {
  const obj = JSON.parse(fs.readFileSync(path.join(DIR,f),'utf8'));
  for (const [code,v] of Object.entries(obj)) compByCode.set(code,v);
}
const norm = v => String(v || '').replace(/[^A-Z0-9]/gi,'').toUpperCase();
const clean = v => (!v || String(v).trim()==='-' ? null : String(v).trim());
function parseUnit(v, unit, factor=1) {
  if (!v) return null;
  const s=String(v);
  let m = unit==='mm' ? s.match(/\(([\d.]+)\s*mm\)/i) : s.match(new RegExp('([\\d.]+)\\s*'+unit,'i'));
  if (m) return Number(m[1]) * factor;
  if (unit==='mm') { m=s.match(/([\d.]+)\s*mm/i); if(m) return Number(m[1]); m=s.match(/([\d.]+)\s*inch/i); if(m) return Number(m[1])*25.4; }
  return null;
}
function parsePsi(v) { const m=String(v||'').match(/([\d.]+)\s*psi/i); return m ? Number(m[1]) : null; }
function uniqRefs(list, base) {
  const seen=new Set(), out=[]; const bn=norm(base);
  for (const x of list||[]) { const manufacturer=clean(x?.manufacturer||x?.brand||x?.[0]); const code=clean(x?.code||x?.reference||x?.[1]); if(!manufacturer||!code||norm(code)===bn) continue; const k=norm(manufacturer)+'|'+norm(code); if(seen.has(k)) continue; seen.add(k); out.push({manufacturer,code}); }
  return out;
}
function brandMap(refs) { const out={}; for(const r of refs){ if(!out[r.manufacturer]) out[r.manufacturer]=[]; if(!out[r.manufacturer].includes(r.code)) out[r.manufacturer].push(r.code); } return out; }
function deepRefs(d) { return (d?.official?.cross_references_raw||[]).slice(1).filter(r=>Array.isArray(r)&&r.length>=2).map(r=>({manufacturer:r[0],code:r[1]})); }
function deepApps(d) {
  return (d?.official?.equipment_raw||[]).slice(1).filter(r=>Array.isArray(r)&&clean(r[0])).map(r=>{
    const o={equipment:clean(r[0]),year:clean(r[1]),type:clean(r[2]),options:clean(r[3]),engine:clean(r[4]),engine_option:clean(r[5])};
    return Object.fromEntries(Object.entries(o).filter(([,v])=>v!==null));
  });
}
function mergeApps(a,b){ const out=[], seen=new Set(); for(const x of [...(a||[]),...(b||[])]){ const k=[norm(x.equipment),norm(x.year),norm(x.type),norm(x.engine)].join('|'); if(seen.has(k)) continue; seen.add(k); out.push(x); } return out; }
function mergeRefs(a,b,base){ return uniqRefs([...(a||[]),...(b||[])],base); }
function remapAlternatives(arr){ const out=[]; for(const a of arr||[]){ const raw=typeof a==='object'?(a.sku||a.code||''):String(a); if(!raw) continue; let sku=legacySkuToNew.get(raw)||planByCode.get(raw)?.sku||raw; if(/^EH6\d{4}$/.test(sku)&&!out.includes(sku)) out.push(sku); } return out; }
const legacySkuToNew = new Map();
for (const p of plan) { const old=importByCode.get(p.code)?.sku; if(old&&p.sku) legacySkuToNew.set(old,p.sku); }
function baseGovernance(code, sourceUrl, scrapedAt) {
  return {
    codigo_base_governance:{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED',primary_manufacturer_verified:true,approved_manufacturer:'DONALDSON',approved_codigo_base:code,approved_source_column:'CANONICAL_SOURCE',alternate_code_model:'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY'},
    donaldson_hydraulic_closure:{verified:true,verified_at:scrapedAt||new Date().toISOString(),source_url:sourceUrl}
  };
}
function descriptionFor(sku){ return `ELIMFILTERS® ${sku} Hydraulic filter for precision fluid power systems. NANOFORCE™ electrostatic synthetic media captures fine particles and free water before they reach proportional valves and seals, preventing the wear and leakage that follow contaminated hydraulic fluid.`; }
function deepToRow(d,p) {
  const a=d.official?.attributes||{}, direct=compByCode.get(d.codigo_base)?.refs||[];
  const refs=uniqRefs([...deepRefs(d),...direct],d.codigo_base);
  const desc=String(d.official?.description||'');
  const style=clean(a.Style)||(desc.toUpperCase().includes('SPIN-ON')?'Spin-On':(/CARTRIDGE|ELEMENT/.test(desc.toUpperCase())?'Cartridge':null));
  const lenSrc=a.Length||a['Overall Length'];
  const efficiency=a['Efficiency Beta 1000']||a['Efficiency Beta 200']||a['Efficiency Beta 75']||null;
  const micron=String(efficiency||'').match(/([\d.]+)\s*micron/i)?.[1]||null;
  const rawAlts=[...(d.official?.alternatives||[]),...(p.alternative_skus||[])];
  const altSkus=remapAlternatives(rawAlts);
  return {sku:p.sku,codigo_base:d.codigo_base,description:descriptionFor(p.sku),name:desc||null,filter_type:'hydraulic',sub_type:clean(a['Media Type']||a['Media Brand']),technology:'NANOFORCE™',installation_type:style,thread_size:clean(a['Thread Size']),outer_diameter_mm:parseUnit(a['Outer Diameter'],'mm'),inner_diameter_mm:parseUnit(a['Inner Diameter'],'mm'),height_mm:parseUnit(lenSrc,'mm'),product_length_mm:parseUnit(lenSrc,'mm'),product_length_in:parseUnit(lenSrc,'inch'),gasket_od_mm:parseUnit(a['Gasket OD'],'mm'),gasket_id_mm:parseUnit(a['Gasket ID'],'mm'),iso_test_method:clean(a['Efficiency Test Std']),micron_rating:micron,nominal_efficiency:clean(efficiency),burst_pressure_psi:parsePsi(a['Collapse Burst']),filter_media:clean(a['Media Type']||a['Media Brand']),duty:'HEAVY_DUTY',oem_codes:[],competitor_codes:refs,brand_crossrefs:brandMap(refs),alternatives:altSkus,equipment_applications:deepApps(d),vehicle_applications:[],specs:{donaldson_official_attributes:a,resources:d.official?.resources||[],audit:d.audit||{}},donaldson_url:d.source_url,canonical_source_brand:'DONALDSON',canonical_source_code:d.codigo_base,canonical_source_url:d.source_url,canonical_source_status:'VERIFIED',canonical_verified_at:d.scraped_at,canonical_evidence:{scraped_at:d.scraped_at,audit:d.audit||{}},duty_source_brand:'DONALDSON',duty_source_url:d.source_url,duty_validation_status:'VERIFIED',duty_verified_at:d.scraped_at,duty_evidence:{category:'Engine & Vehicle > Hydraulic > Filters'},packaging_source:'OFFICIAL_SOURCE_SCRAPE',packaging_source_url:d.source_url,packaging_validation_status:'VERIFIED',packaging_validated_at:d.scraped_at,product_dimensions_source:'DONALDSON',product_dimensions_validation_status:'VERIFIED',unit_packaged_length_cm:d.metric?.unit_packaged_length_cm??null,unit_packaged_width_cm:d.metric?.unit_packaged_width_cm??null,unit_packaged_height_cm:d.metric?.unit_packaged_height_cm??null,unit_packaged_weight_kg:d.metric?.unit_packaged_weight_kg??null,unit_packaged_volume_m3:d.metric?.unit_packaged_volume_m3??null,unit_packaged_length_ft:d.metric?.unit_packaged_length_ft??null,unit_packaged_width_ft:d.metric?.unit_packaged_width_ft??null,unit_packaged_height_ft:d.metric?.unit_packaged_height_ft??null,unit_packaged_weight_lb:d.metric?.unit_packaged_weight_lb??null,unit_packaged_volume_ft3:d.metric?.unit_packaged_volume_ft3??null,logistics_data_complete:Boolean(d.metric?.unit_packaged_weight_kg&&d.metric?.unit_packaged_volume_m3),is_primary:p.classification!=='ALTERNATIVE_PRODUCT',enrichment_data:baseGovernance(d.codigo_base,d.source_url,d.scraped_at)};
}
function importToRow(src,p) {
  const direct=compByCode.get(p.code)?.refs||[];
  const refs=mergeRefs(src.competitor_codes||[],direct,p.code);
  const oldSku=src.sku;
  return {...src,sku:p.sku,codigo_base:p.code,description:String(src.description||descriptionFor(p.sku)).replaceAll(oldSku||'',p.sku),filter_type:'hydraulic',technology:'NANOFORCE™',duty:'HEAVY_DUTY',oem_codes:[],competitor_codes:refs,brand_crossrefs:brandMap(refs),alternatives:remapAlternatives([...(src.alternatives||[]),...(p.alternative_skus||[])]),vehicle_applications:[],donaldson_url:p.url,canonical_source_brand:'DONALDSON',canonical_source_code:p.code,canonical_source_url:p.url,canonical_source_status:'VERIFIED',canonical_verified_at:new Date().toISOString(),canonical_evidence:{source:'Donaldson current Hydraulic category discovery 2026-09-17',url:p.url},duty_source_brand:'DONALDSON',duty_source_url:p.url,duty_validation_status:'VERIFIED',duty_verified_at:new Date().toISOString(),duty_evidence:{category:'Engine & Vehicle > Hydraulic > Filters'},is_primary:p.classification!=='ALTERNATIVE_PRODUCT',enrichment_data:baseGovernance(p.code,p.url,new Date().toISOString())};
}
const client=new Client({connectionString:DB});
await client.connect();
const jsonColumns=new Set(['oem_codes','competitor_codes','equipment_applications','alternative_products','enrichment_data','specs','vehicle_applications','brand_crossrefs','alternatives','canonical_evidence','duty_evidence']);
async function payloadHash(apps){ return (await client.query('select md5($1::jsonb::text) h',[JSON.stringify(apps||[])])).rows[0].h; }
async function ensureEvidence(sku,apps,sourceUrl,enrichment){
  if(!apps?.length) return enrichment||{};
  const h=await payloadHash(apps); const hasEngine=apps.some(x=>clean(x.engine||x.engine_model||x.motor));
  for(const kind of hasEngine?['EQUIPMENT','ENGINE']:['EQUIPMENT']){
    const ex=(await client.query('select 1 from catalog_application_evidence where sku=$1 and application_kind=$2 and payload_hash=$3 and verified=true limit 1',[sku,kind,h])).rowCount;
    if(!ex) await client.query('insert into catalog_application_evidence(sku,application_kind,payload_hash,evidence_authority,source_url,verified,verified_at,metadata) values($1,$2,$3,$4,$5,true,now(),$6::jsonb)',[sku,kind,h,'DONALDSON',sourceUrl,JSON.stringify({closure:'DONALDSON_HYDRAULIC_2026-09-17'})]);
  }
  return {...(enrichment||{}),application_governance:{policy_version:'2026-08-19-app-v1',evidence_recorded:true,evidence_authority:'DONALDSON',equipment_verified:true,equipment_db_payload_hash:h,engine_verified:hasEngine,engine_db_payload_hash:hasEngine?h:null}};
}
async function insertRow(row,allowed,typeBy){
  const apps=row.equipment_applications||[]; row={...row,equipment_applications:[],enrichment_data:row.enrichment_data||{}};
  const keys=Object.keys(row).filter(k=>allowed.has(k)&&!['id','created_at','logistics_data_complete'].includes(k)); const vals=keys.map(k=>jsonColumns.has(k)?JSON.stringify(row[k]??null):row[k]); const ph=keys.map((k,i)=>'$'+(i+1)+(jsonColumns.has(k)?'::jsonb':''));
  await client.query('insert into elimfilters_catalog('+keys.map(k=>'"'+k+'"').join(',')+') values('+ph.join(',')+')',vals);
  if(apps.length){ const e=await ensureEvidence(row.sku,apps,row.donaldson_url,row.enrichment_data); await client.query('update elimfilters_catalog set equipment_applications=$1::jsonb,enrichment_data=$2::jsonb where sku=$3',[JSON.stringify(apps),JSON.stringify(e),row.sku]); }
}
async function updateDeepRow(row,current,allowed){
  const patch={};
  for(const [k,v] of Object.entries(row)) if(allowed.has(k)&&!['id','created_at','logistics_data_complete','sku','codigo_base','equipment_applications','competitor_codes','oem_codes','alternatives','brand_crossrefs','enrichment_data'].includes(k)&&v!==null&&v!==undefined) patch[k]=v;
  patch.oem_codes=current.oem_codes||[];
  patch.competitor_codes=mergeRefs(current.competitor_codes||[],row.competitor_codes||[],row.codigo_base);
  patch.brand_crossrefs=brandMap(patch.competitor_codes);
  patch.alternatives=[...new Set([...(current.alternatives||[]),...(row.alternatives||[])].filter(x=>x&&x!==row.sku))];
  patch.equipment_applications=mergeApps(current.equipment_applications||[],row.equipment_applications||[]);
  patch.enrichment_data={...(current.enrichment_data||{}),...(row.enrichment_data||{})};
  patch.enrichment_data=await ensureEvidence(row.sku,patch.equipment_applications,row.donaldson_url,patch.enrichment_data);
  const keys=Object.keys(patch); const vals=keys.map(k=>jsonColumns.has(k)?JSON.stringify(patch[k]??null):patch[k]); const set=keys.map((k,i)=>'"'+k+'"=$'+(i+1)+(jsonColumns.has(k)?'::jsonb':''));
  vals.push(row.sku); await client.query('update elimfilters_catalog set '+set.join(',')+' where sku=$'+vals.length,vals);
}
try {
  await client.query('BEGIN');
  const cols=(await client.query("select column_name,data_type from information_schema.columns where table_schema='public' and table_name='elimfilters_catalog'")).rows;
  const allowed=new Set(cols.map(x=>x.column_name));
  const typeBy=new Map(cols.map(x=>[x.column_name,x.data_type]));
  const existingRows=(await client.query('select * from elimfilters_catalog where codigo_base=any($1)',[targetCodes])).rows;
  const existingByCode=new Map(existingRows.map(r=>[r.codigo_base,r]));
  const missing=plan.filter(p=>!existingByCode.has(p.code));
  const deepExisting=deep.filter(d=>existingByCode.has(d.codigo_base));
  const deepMissing=missing.filter(p=>deepByCode.has(p.code));
  const importMissing=missing.filter(p=>!deepByCode.has(p.code)&&importByCode.has(p.code));
  const unresolved=missing.filter(p=>!deepByCode.has(p.code)&&!importByCode.has(p.code));
  if(deep.length!==107||new Set(deep.map(x=>x.codigo_base)).size!==107||deep.some(x=>x.status!=='OK')) throw new Error('deep audit is not 107/107 OK');
  if(compByCode.size!==2034) throw new Error('competitor direct audit is not 2034/2034');
  if(unresolved.length) throw new Error('unresolved missing rows: '+unresolved.map(x=>x.code).join(','));
  if(deepMissing.length+importMissing.length!==missing.length||deepMissing.length+deepExisting.length!==107) throw new Error(`unexpected partition missing=${missing.length} deepMissing=${deepMissing.length} importMissing=${importMissing.length} deepExisting=${deepExisting.length}`);
  await client.query('create table if not exists catalog_hydraulic_close_backup_20260917(id integer primary key,sku text,codigo_base text,row_data jsonb,backed_up_at timestamptz default now())');
  for(const d of deepExisting){ const cur=existingByCode.get(d.codigo_base); await client.query('insert into catalog_hydraulic_close_backup_20260917(id,sku,codigo_base,row_data) values($1,$2,$3,$4::jsonb) on conflict(id) do nothing',[cur.id,cur.sku,cur.codigo_base,JSON.stringify(cur)]); }
  let updated=0, insertedDeep=0, insertedImport=0;
  for(const d of deepExisting){ const p=planByCode.get(d.codigo_base); const row=deepToRow(d,p); await updateDeepRow(row,existingByCode.get(d.codigo_base),allowed); updated++; }
  for(const p of deepMissing){ const row=deepToRow(deepByCode.get(p.code),p); await insertRow(row,allowed,typeBy); insertedDeep++; }
  for(const p of importMissing){ const row=importToRow(importByCode.get(p.code),p); await insertRow(row,allowed,typeBy); insertedImport++; }
  const rows=(await client.query('select sku,codigo_base,technology,alternatives,competitor_codes,equipment_applications,canonical_source_status,donaldson_url from elimfilters_catalog where codigo_base=any($1)',[targetCodes])).rows;
  const byCode=new Map(rows.map(r=>[r.codigo_base,r]));
  const mismatches=[];
  for(const p of plan){ const r=byCode.get(p.code); if(!r||r.sku!==p.sku) mismatches.push({code:p.code,expected:p.sku,actual:r?.sku||null}); }
  const selfRefs=[];
  for(const r of rows){ const bn=norm(r.codigo_base); for(const x of r.competitor_codes||[]) if(norm(x.code||x.reference)===bn) selfRefs.push(r.codigo_base); }
  const deepDbMissing=deep.filter(d=>!byCode.has(d.codigo_base)).map(d=>d.codigo_base);
  const deepUnverified=deep.filter(d=>byCode.get(d.codigo_base)?.canonical_source_status!=='VERIFIED').map(d=>d.codigo_base);
  const touchedCodes=new Set([...deepExisting.map(x=>x.codigo_base),...deepMissing.map(x=>x.code),...importMissing.map(x=>x.code)]);
  const appEvidenceMissing=[];
  for(const r of rows.filter(x=>touchedCodes.has(x.codigo_base)&&(x.equipment_applications||[]).length)){
    const h=await payloadHash(r.equipment_applications); const ok=(await client.query("select 1 from catalog_application_evidence where sku=$1 and application_kind='EQUIPMENT' and payload_hash=$2 and verified=true limit 1",[r.sku,h])).rowCount; if(!ok) appEvidenceMissing.push(r.sku);
  }
  const compStatus={OK:0,NOT_FOUND:0,OTHER:0}; let compRefs=0;
  for(const v of compByCode.values()){ if(v.status==='OK')compStatus.OK++; else if(v.status==='NOT_FOUND')compStatus.NOT_FOUND++; else compStatus.OTHER++; compRefs+=(v.refs||[]).length; }
  const checks={mode:APPLY?'APPLY_COMMIT':'DRY_RUN_ROLLBACK',target_rows:rows.length,target_unique_codes:new Set(rows.map(r=>r.codigo_base)).size,target_unique_skus:new Set(rows.map(r=>r.sku)).size,nanoforce_rows:rows.filter(r=>r.technology==='NANOFORCE™').length,mismatches:mismatches.length,self_refs:selfRefs.length,deep_107_present:107-deepDbMissing.length,deep_107_verified:107-deepUnverified.length,application_evidence_missing:appEvidenceMissing.length,updated_deep_existing:updated,inserted_deep:insertedDeep,inserted_import_ready:insertedImport,competitor_direct:{checked:compByCode.size,status:compStatus,raw_refs:compRefs},short_code_examples:Object.fromEntries(['HPDEL11','HPWEL11','HPDEL22','HPPEL22','HPWEL22','HPKL18-3MB'].map(c=>[c,planByCode.get(c)?.sku]))};
  if(checks.target_rows!==2034||checks.target_unique_codes!==2034||checks.target_unique_skus!==2034||checks.nanoforce_rows!==2034||checks.mismatches||checks.self_refs||checks.deep_107_present!==107||checks.deep_107_verified!==107||checks.application_evidence_missing||checks.competitor_direct.status.OTHER) throw new Error('closure validation failed '+JSON.stringify(checks));
  if(APPLY) await client.query('COMMIT'); else await client.query('ROLLBACK');
  fs.writeFileSync(path.join(DIR,'donaldson_hydraulic_close_audit_20260917.json'),JSON.stringify(checks,null,2));
  console.log(JSON.stringify(checks,null,2));
} catch(e){ try{await client.query('ROLLBACK');}catch{} console.error(e.stack||e); process.exitCode=1; }
finally { await client.end(); }
