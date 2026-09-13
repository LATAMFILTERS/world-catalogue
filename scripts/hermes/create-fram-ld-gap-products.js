'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const REPO=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const GAP_DIR=path.join(REPO,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const REPORT_DIR=path.join(REPO,'elimfilters-vault/91-private-evidence/fram-ld-create-reports');
const TYPE={AIR:'air',CABIN:'cabin',FUEL:'fuel',LUBE:'oil'};
const SEGMENT={AIR:'Air Filter',CABIN:'Cabin Filter',FUEL:'Fuel Filter',LUBE:'Oil Filter'};
const TECH={AIR:'MACROCORE™',CABIN:'MICROKAPPA™',FUEL:'SYNTRAX™',LUBE:'SYNTRAX™'};
const norm=(v='')=>String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
const clean=(v,max=255)=>v==null?null:String(v).trim().slice(0,max);
const uniq=(rows,key)=>{const s=new Set();return rows.filter(r=>{const k=key(r);if(s.has(k))return false;s.add(k);return true})};
function latestGap(){
  const files=fs.readdirSync(GAP_DIR).filter(f=>/^fram-ld-gap-.*\.json$/.test(f)).map(f=>path.join(GAP_DIR,f));
  if(!files.length)throw new Error('No FRAM gap report found');
  return files.sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];
}
function unitFor(k){if(/_mm$/.test(k))return'mm';if(/_in$/.test(k))return'in';if(/_psi$/.test(k))return'psi';return null;}
function buildRecord(c){
  const j=JSON.parse(fs.readFileSync(c.file,'utf8'));
  const p=j.public_catalog_proposal||{};
  if(j.duty!=='LIGHT_DUTY'||j.market_scope!=='MULTI_REGION'||j.source_catalog_scope!=='FRAM_LD_MULTI_REGION') throw new Error(`Scope guard failed ${c.authority}`);
  if(TYPE[c.family]!==p.product_type?.toLowerCase().includes('cabin')&&false){}
  const specs=p.technical_specifications||{};
  return {candidate:c,j,p,specs,sku:c.sku,authority:clean(c.authority,50),family:c.family,filter_type:TYPE[c.family],segment:SEGMENT[c.family],technology:TECH[c.family]};
}
function buildPlan(records){
  const comp=[],oem=[],apps=[],specs=[];
  for(const r of records){
    const p=r.p, source=r.authority;
    comp.push({sku:r.sku,source,brand:'FRAM',part:source,canonical:true});
    for(const code of p.alternatives||[])comp.push({sku:r.sku,source,brand:'FRAM',part:clean(code),canonical:false});
    for(const x of p.competitor_cross_reference_candidates||[])comp.push({sku:r.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number),canonical:false});
    for(const x of p.oem_cross_reference_candidates||[])oem.push({sku:r.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number)});
    for(const x of p.vehicle_application_candidates||[])apps.push({sku:r.sku,source,make:clean(x.make),model:clean(x.model),year:clean(x.year,50),engine:clean(x.engine),origin:'FRAM_LD_MULTI_REGION'});
    for(const [k,v] of Object.entries(r.specs))if(v!=null&&v!=='')specs.push({sku:r.sku,source,key:clean(k),value:clean(v),unit:unitFor(k)});
  }
  return {comp:uniq(comp,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),oem:uniq(oem,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),apps:uniq(apps,x=>[x.sku,norm(x.make),norm(x.model),x.year||'',norm(x.engine)].join('|')),specs:uniq(specs,x=>[x.sku,x.key].join('|'))};
}
async function insertRows(client,table,cols,conflict,rows,batch=200){
  let nInserted=0;
  for(let i=0;i<rows.length;i+=batch){
    const chunk=rows.slice(i,i+batch),params=[],vals=[];let n=1;
    for(const r of chunk){const ps=[];for(const c of cols){params.push(r[c]);ps.push(`$${n++}`)}vals.push(`(${ps.join(',')})`)}
    const q=`INSERT INTO ${table} (${cols.join(',')}) VALUES ${vals.join(',')} ${conflict} RETURNING 1`;
    nInserted+=(await client.query(q,params)).rowCount;
  }
  return nInserted;
}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('CATALOG_DATABASE_URL missing');
  const gapFile=process.env.FRAM_LD_GAP_REPORT||latestGap();
  const gap=JSON.parse(fs.readFileSync(gapFile,'utf8'));
  const safe=gap.safe_candidates||[];
  const expectedSafe=Number(gap.create_safe||safe.length);
  if(safe.length!==expectedSafe)throw new Error(`Gap report safe count mismatch ${safe.length}/${expectedSafe}`);
  const records=safe.map(buildRecord);
  const skuSet=new Set(records.map(r=>r.sku));
  if(skuSet.size!==records.length)throw new Error(`Internal SKU collision: ${records.length-skuSet.size}`);
  const authoritySet=new Set(records.map(r=>norm(r.authority)));
  if(authoritySet.size!==records.length)throw new Error('Duplicate FRAM authorities in safe set');
  const plan=buildPlan(records);
  const client=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await client.connect();
  const report={mode:EXECUTE?'execute':'dry-run',gap_report:gapFile,candidates:records.length,planned:{competitor:plan.comp.length,oem:plan.oem.length,applications:plan.apps.length,specifications:plan.specs.length},inserted:{},skipped:{},audit:{}};
  try{
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const skus=records.map(r=>r.sku), authorities=records.map(r=>r.authority);
    const existing=await client.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[skus]);
    if(existing.rowCount)throw new Error(`SAFE_SET_STALE: ${existing.rowCount} proposed SKUs now exist`);
    const existingFram=await client.query(`SELECT competitor_part_number,elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[])`,[authorities.map(norm)]);
    if(existingFram.rowCount)throw new Error(`SAFE_SET_STALE: ${existingFram.rowCount} FRAM authorities now resolve`);
    const identities=await client.query(`SELECT canonical_part_number,elimfilters_sku FROM ld_catalog.ld_canonical_product_identity WHERE canonical_brand='FRAM' AND status='ACTIVE' AND ld_catalog.norm_part(canonical_part_number)=ANY($1::text[])`,[authorities.map(norm)]);
    if(identities.rowCount)throw new Error(`SAFE_SET_STALE: ${identities.rowCount} FRAM canonical identities now exist`);

    const existingComp=(await client.query(`SELECT elimfilters_sku,competitor_brand,competitor_part_number FROM ld_catalog.ld_competitor_cross_references`)).rows;
    const owner=new Map();
    for(const x of existingComp){const k=norm(x.competitor_brand)+'|'+norm(x.competitor_part_number);if(!owner.has(k))owner.set(k,new Set());owner.get(k).add(x.elimfilters_sku)}
    const planOwners=new Map();
    for(const x of plan.comp){const k=norm(x.brand)+'|'+norm(x.part);if(!planOwners.has(k))planOwners.set(k,new Set());planOwners.get(k).add(x.sku)}
    const compRows=[]; let existingConflicts=0,intraConflicts=0;
    for(const x of plan.comp){
      const k=norm(x.brand)+'|'+norm(x.part), old=owner.get(k)||new Set(), own=planOwners.get(k)||new Set();
      if([...old].some(s=>s!==x.sku)){if(x.canonical)throw new Error(`CANONICAL_FRAM_CONFLICT ${x.part}`);existingConflicts++;continue}
      if(own.size>1){if(x.canonical)throw new Error(`CANONICAL_PLAN_CONFLICT ${x.part}`);intraConflicts++;continue}
      if(x.brand&&x.part)compRows.push({elimfilters_sku:x.sku,source_sku:x.source,competitor_brand:x.brand,competitor_part_number:x.part});
    }
    report.skipped.competitor_existing_conflicts=existingConflicts;
    report.skipped.competitor_intra_plan_conflicts=intraConflicts;
    const publicRows=records.map(r=>{
      const s=r.specs, gov={policy_version:'2026-08-29-regional-v3.2',state:'CANONICAL_VERIFIED',governance_state:'CANONICAL_VERIFIED',origin_group:'NON_EUROPEAN',approved_manufacturer:'FRAM',approved_codigo_base:r.authority,approved_source_column:'CANONICAL_POLICY',primary_manufacturer_verified:true,required_authority:'REGIONAL_CANONICAL_POLICY_SATISFIED',evidence_note:'FRAM LD multi-region harvested authority; operator-approved catalog gap creation.'};
      const n=v=>v==null||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
      return {sku:r.sku,codigo_base:r.authority,filter_type:r.filter_type,technology:r.technology,height_mm:n(s.height_mm),outer_diameter_mm:n(s.outer_diameter_mm),gasket_od_mm:n(s.gasket_od_mm),gasket_id_mm:n(s.gasket_id_mm),thread_size:clean(s.thread_size,100),bypass_valve_psi:clean(s.bypass_setting_psi,50),burst_pressure_psi:clean(s.burst_pressure_psi,50),anti_drainback_valve:clean(s.anti_drainback_valve,50),filter_media:clean(s.media_type,100),oem_codes:JSON.stringify([]),competitor_codes:JSON.stringify([]),equipment_applications:JSON.stringify([]),vehicle_applications:JSON.stringify([]),description:null,enrichment_data:JSON.stringify({codigo_base_governance:gov,evidence_source:'FRAM_LD_MULTI_REGION_GAP_CREATE_2026_09_12'}),specs:JSON.stringify(s),duty:'LIGHT_DUTY',alternative_products:JSON.stringify([]),brand_crossrefs:JSON.stringify({}),alternatives:JSON.stringify([]),canonical_source_brand:'FRAM',canonical_source_code:r.authority,canonical_source_status:'VERIFIED',canonical_verified_at:new Date(),canonical_evidence:JSON.stringify({source_catalog_scope:'FRAM_LD_MULTI_REGION',market_scope:'MULTI_REGION',authority:r.authority}),duty_source_brand:'FRAM',duty_validation_status:'VERIFIED',duty_verified_at:new Date(),duty_evidence:JSON.stringify({duty:'LIGHT_DUTY',source:'FRAM_LD_MULTI_REGION'}),sub_type:clean(s.style,100),installation_type:clean(s.style,100)};
    });
    const pubCols=['sku','codigo_base','filter_type','technology','height_mm','outer_diameter_mm','gasket_od_mm','gasket_id_mm','thread_size','bypass_valve_psi','burst_pressure_psi','anti_drainback_valve','filter_media','oem_codes','competitor_codes','equipment_applications','vehicle_applications','description','enrichment_data','specs','duty','alternative_products','brand_crossrefs','alternatives','canonical_source_brand','canonical_source_code','canonical_source_status','canonical_verified_at','canonical_evidence','duty_source_brand','duty_validation_status','duty_verified_at','duty_evidence','sub_type','installation_type'];
    report.inserted.public_catalog=await insertRows(client,'public.elimfilters_catalog',pubCols,'ON CONFLICT (sku) DO NOTHING',publicRows,100);
    if(report.inserted.public_catalog!==records.length)throw new Error(`PUBLIC_INSERT_COUNT ${report.inserted.public_catalog}/${records.length}`);

    const parentRows=records.map(r=>({elimfilters_sku:r.sku,source_sku:r.authority,segment:r.segment}));
    report.inserted.ld_parents=await insertRows(client,'ld_catalog.ld_product_catalog',['elimfilters_sku','source_sku','segment'],'ON CONFLICT (elimfilters_sku) DO NOTHING',parentRows);
    const readyRows=records.map(r=>({elimfilters_sku:r.sku,source_sku:r.authority,segment:r.segment,has_oem:false,has_competitor:false,has_applications:false,has_specifications:false,production_tier:'FRAM_GAP_CREATED'}));
    report.inserted.readiness=await insertRows(client,'ld_catalog.ld_production_readiness',['elimfilters_sku','source_sku','segment','has_oem','has_competitor','has_applications','has_specifications','production_tier'],'ON CONFLICT (elimfilters_sku) DO NOTHING',readyRows);
    const identityRows=records.map(r=>({elimfilters_sku:r.sku,origin_group:'NON_EUROPEAN',canonical_brand:'FRAM',canonical_part_number:r.authority,filter_type:r.filter_type,status:'ACTIVE',evidence_source:'FRAM_LD_MULTI_REGION_GAP_CREATE'}));
    report.inserted.identities=await insertRows(client,'ld_catalog.ld_canonical_product_identity',['elimfilters_sku','origin_group','canonical_brand','canonical_part_number','filter_type','status','evidence_source'],'ON CONFLICT (elimfilters_sku) DO NOTHING',identityRows);
    if(report.inserted.identities!==records.length)throw new Error(`IDENTITY_INSERT_COUNT ${report.inserted.identities}/${records.length}`);

    report.inserted.competitor=await insertRows(client,'ld_catalog.ld_competitor_cross_references',['elimfilters_sku','source_sku','competitor_brand','competitor_part_number'],'ON CONFLICT (elimfilters_sku,competitor_brand,competitor_part_number) DO NOTHING',compRows);
    const oemRows=plan.oem.filter(x=>x.brand&&x.part).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,oem_brand:x.brand,oem_part_number:x.part}));
    report.inserted.oem=await insertRows(client,'ld_catalog.ld_oem_cross_references',['elimfilters_sku','source_sku','oem_brand','oem_part_number'],'ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING',oemRows);
    const appRows=plan.apps.filter(x=>x.make&&x.model&&x.year).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,make:x.make,model_family:x.model,model_type:x.engine||'',year:x.year,engine_code:x.engine||null,ccm:null,kw:null,hp:null,source_origin:x.origin}));
    report.inserted.applications=await insertRows(client,'ld_catalog.ld_vehicle_applications',['elimfilters_sku','source_sku','make','model_family','model_type','year','engine_code','ccm','kw','hp','source_origin'],'ON CONFLICT (elimfilters_sku,make,model_family,model_type,year) DO NOTHING',appRows);
    const specRows=plan.specs.filter(x=>x.key&&x.value).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,spec_key:x.key,spec_value:x.value,spec_unit:x.unit}));
    report.inserted.specifications=await insertRows(client,'ld_catalog.ld_product_specifications',['elimfilters_sku','source_sku','spec_key','spec_value','spec_unit'],'ON CONFLICT (elimfilters_sku,spec_key) DO NOTHING',specRows);
    report.planned.valid_applications=appRows.length;
    report.planned.valid_oem=oemRows.length;
    report.planned.valid_competitor=compRows.length;
    report.planned.valid_specifications=specRows.length;
    const ready=await client.query(`UPDATE ld_catalog.ld_production_readiness r SET has_oem=EXISTS(SELECT 1 FROM ld_catalog.ld_oem_cross_references o WHERE o.elimfilters_sku=r.elimfilters_sku),has_competitor=EXISTS(SELECT 1 FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=r.elimfilters_sku),has_applications=EXISTS(SELECT 1 FROM ld_catalog.ld_vehicle_applications a WHERE a.elimfilters_sku=r.elimfilters_sku),has_specifications=EXISTS(SELECT 1 FROM ld_catalog.ld_product_specifications s WHERE s.elimfilters_sku=r.elimfilters_sku),updated_at=now() WHERE r.elimfilters_sku=ANY($1::text[])`,[records.map(r=>r.sku)]);
    report.inserted.readiness_updated=ready.rowCount;

    const audit=await client.query(`SELECT
      count(*)::int AS total,
      count(*) FILTER(WHERE duty='LIGHT_DUTY')::int AS ld,
      count(*) FILTER(WHERE duty='HEAVY_DUTY')::int AS hd,
      count(*) FILTER(WHERE (filter_type='air' AND sku NOT LIKE 'EA3%') OR (filter_type='cabin' AND sku NOT LIKE 'EC3%') OR (filter_type='fuel' AND sku NOT LIKE 'EF3%') OR (filter_type='oil' AND sku NOT LIKE 'EL3%'))::int AS bad_prefix
      FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])`,[records.map(r=>r.sku)]);
    report.audit.public=audit.rows[0];
    const canon=await client.query(`SELECT count(*)::int total,count(*) FILTER(WHERE canonical_brand='FRAM' AND origin_group='NON_EUROPEAN' AND status='ACTIVE')::int valid FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=ANY($1::text[])`,[records.map(r=>r.sku)]);
    report.audit.canonical_identity=canon.rows[0];
    const layers=await client.query(`SELECT
      (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=ANY($1::text[])) parents,
      (SELECT count(*)::int FROM ld_catalog.ld_production_readiness WHERE elimfilters_sku=ANY($1::text[])) readiness,
      (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=ANY($1::text[])) competitor,
      (SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references WHERE elimfilters_sku=ANY($1::text[])) oem,
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=ANY($1::text[])) applications,
      (SELECT count(*)::int FROM ld_catalog.ld_product_specifications WHERE elimfilters_sku=ANY($1::text[])) specifications`,[records.map(r=>r.sku)]);
    report.audit.layers=layers.rows[0];
    const direct=await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=ANY($1::text[]) AND upper(regexp_replace(coalesce(x.competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(x.competitor_part_number)=ANY($2::text[])`,[records.map(r=>r.sku),records.map(r=>norm(r.authority))]);
    report.audit.direct_fram_authorities=direct.rows[0].n;
    const hd=await client.query(`SELECT
      (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') competitor_hd,
      (SELECT count(*)::int FROM ld_catalog.ld_oem_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') oem_hd,
      (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') applications_hd,
      (SELECT count(*)::int FROM ld_catalog.ld_product_specifications x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY') specifications_hd`,[authorities]);
    report.audit.source_rows_on_hd=hd.rows[0];
    const A=report.audit;
    if(Number(A.public.total)!==records.length||Number(A.public.ld)!==records.length||Number(A.public.hd)!==0||Number(A.public.bad_prefix)!==0)throw new Error('PUBLIC_AUDIT_FAILED');
    if(Number(A.canonical_identity.valid)!==records.length||Number(A.layers.parents)!==records.length||Number(A.layers.readiness)!==records.length||Number(A.direct_fram_authorities)!==records.length)throw new Error('LD_IDENTITY_AUDIT_FAILED');
    if(Object.values(A.source_rows_on_hd).some(v=>Number(v)!==0))throw new Error('HEAVY_DUTY_CONTAMINATION');

    if(EXECUTE)await client.query('COMMIT');else await client.query('ROLLBACK');
    report.transaction=EXECUTE?'COMMIT':'ROLLBACK';
  }catch(e){
    try{await client.query('ROLLBACK')}catch{}
    report.error=e.message;
    throw Object.assign(e,{report});
  }finally{
    await client.end();
    fs.mkdirSync(REPORT_DIR,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    const out=path.join(REPORT_DIR,`fram-ld-gap-create-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:out,...report},null,2));
  }
}
main().catch(e=>{if(!e.report)console.error(e.stack||e.message);process.exit(1)});
