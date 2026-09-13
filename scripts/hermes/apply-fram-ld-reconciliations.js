'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const ROOT=path.resolve(__dirname,'../..');
const EXECUTE=process.argv.includes('--execute');
const GAP_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-gap-analysis');
const MAP_FILE=process.env.FRAM_LD_RECONCILIATION_MAP||path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-reconciliation-map.json');
const REPORT_DIR=path.join(ROOT,'elimfilters-vault/91-private-evidence/fram-ld-reconciliation-reports');
const TYPE={AIR:'air',CABIN:'cabin',FUEL:'fuel',LUBE:'oil'};
const SEGMENT={AIR:'Air Filter',CABIN:'Cabin Filter',FUEL:'Fuel Filter',LUBE:'Oil Filter'};
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const clean=(v,max=255)=>v==null?null:String(v).trim().slice(0,max);
const uniq=(rows,key)=>{const s=new Set();return rows.filter(r=>{const k=key(r);if(s.has(k))return false;s.add(k);return true})};
const unitFor=k=>/_mm$/.test(k)?'mm':/_in$/.test(k)?'in':/_psi$/.test(k)?'psi':null;
function latestGap(){const f=fs.readdirSync(GAP_DIR).filter(x=>/^fram-ld-gap-.*\.json$/.test(x)).map(x=>path.join(GAP_DIR,x));if(!f.length)throw new Error('No gap report');return f.sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs)[0];}
function buildPlan(entries,byAuthority){
  const comp=[],oem=[],apps=[],specs=[];
  for(const e of entries){
    const src=byAuthority.get(norm(e.authority));
    if(!src)throw new Error(`Authority missing from gap report: ${e.authority}`);
    const j=JSON.parse(fs.readFileSync(src.file,'utf8'));
    const p=j.public_catalog_proposal||{};
    const source=clean(e.authority,50);
    comp.push({sku:e.sku,source,brand:'FRAM',part:source,direct:true});
    for(const code of p.alternatives||[])comp.push({sku:e.sku,source,brand:'FRAM',part:clean(code),direct:false});
    for(const x of p.competitor_cross_reference_candidates||[])comp.push({sku:e.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number),direct:false});
    for(const x of p.oem_cross_reference_candidates||[])oem.push({sku:e.sku,source,brand:clean(x.manufacturer),part:clean(x.part_number)});
    for(const x of p.vehicle_application_candidates||[])apps.push({sku:e.sku,source,make:clean(x.make),model:clean(x.model),year:clean(x.year,50),engine:clean(x.engine),origin:'FRAM_LD_MULTI_REGION'});
    for(const [k,v] of Object.entries(p.technical_specifications||{}))if(v!=null&&v!=='')specs.push({sku:e.sku,source,key:clean(k),value:clean(v),unit:unitFor(k)});
  }
  return {comp:uniq(comp,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),oem:uniq(oem,x=>[x.sku,norm(x.brand),norm(x.part)].join('|')),apps:uniq(apps,x=>[x.sku,norm(x.make),norm(x.model),x.year||'',norm(x.engine)].join('|')),specs:uniq(specs,x=>[x.sku,x.key].join('|'))};
}
async function insertRows(client,table,cols,conflict,rows,batch=250){let total=0;for(let i=0;i<rows.length;i+=batch){const part=rows.slice(i,i+batch),params=[],vals=[];let n=1;for(const r of part){const ps=[];for(const c of cols){params.push(r[c]);ps.push(`$${n++}`)}vals.push(`(${ps.join(',')})`)}if(!vals.length)continue;total+=(await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES ${vals.join(',')} ${conflict} RETURNING 1`,params)).rowCount;}return total;}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL missing');
  const entries=JSON.parse(fs.readFileSync(MAP_FILE,'utf8'));
  if(!Array.isArray(entries)||!entries.length) throw new Error('Empty reconciliation map');
  const gapFile=latestGap();
  const gap=JSON.parse(fs.readFileSync(gapFile,'utf8'));
  const byAuthority=new Map(gap.results.map(r=>[norm(r.authority),r]));
  const plan=buildPlan(entries,byAuthority);
  const skus=[...new Set(entries.map(e=>e.sku))];
  const client=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await client.connect();
  const report={mode:EXECUTE?'execute':'dry-run',gap_report:gapFile,map:MAP_FILE,authorities:entries.length,targets:skus.length,planned:{competitor:plan.comp.length,oem:plan.oem.length,applications:plan.apps.length,specifications:plan.specs.length},inserted:{},skipped:{},audit:{}};
  try{
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const targets=(await client.query(
      'SELECT sku,duty,filter_type FROM public.elimfilters_catalog WHERE sku=ANY($1::text[])',
      [skus]
    )).rows;
    if(targets.length!==skus.length) throw new Error(`Missing targets ${targets.length}/${skus.length}`);
    const tm=new Map(targets.map(x=>[x.sku,x]));
    for(const e of entries){
      const t=tm.get(e.sku);
      if(t.duty!=='LIGHT_DUTY'||t.filter_type!==TYPE[e.family]) throw new Error(`Target guard failed ${e.authority}->${e.sku}`);
    }
    const existing=(await client.query(
      'SELECT elimfilters_sku,competitor_brand,competitor_part_number FROM ld_catalog.ld_competitor_cross_references'
    )).rows;
    const owner=new Map();
    for(const x of existing){const k=norm(x.competitor_brand)+'|'+norm(x.competitor_part_number);if(!owner.has(k))owner.set(k,new Set());owner.get(k).add(x.elimfilters_sku)}
    for(const e of entries){
      const owners=owner.get('FRAM|'+norm(e.authority))||new Set();
      const bad=[...owners].filter(s=>s!==e.sku);
      if(bad.length) throw new Error(`FRAM_AUTHORITY_CONFLICT ${e.authority} -> ${bad.join(',')}`);
    }
    const proposedOwners=new Map();
    for(const r of plan.comp){const k=norm(r.brand)+'|'+norm(r.part);if(!proposedOwners.has(k))proposedOwners.set(k,new Set());proposedOwners.get(k).add(r.sku)}
    const compRows=[];
    let compSkipped=0;
    for(const r of plan.comp){
      if(!r.brand||!r.part) continue;
      const k=norm(r.brand)+'|'+norm(r.part),old=owner.get(k)||new Set(),planned=proposedOwners.get(k)||new Set();
      const bad=[...old].filter(s=>s!==r.sku);
      if(bad.length||planned.size>1){if(r.direct)throw new Error(`DIRECT_REFERENCE_CONFLICT ${r.part}`);compSkipped++;continue;}
      compRows.push({elimfilters_sku:r.sku,source_sku:r.source,competitor_brand:r.brand,competitor_part_number:r.part});
    }
    report.skipped.competitor_conflicts=compSkipped;
    const oemRows=plan.oem.filter(x=>x.brand&&x.part).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,oem_brand:x.brand,oem_part_number:x.part}));
    const appRows=plan.apps.filter(x=>x.make&&x.model&&x.year).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,make:x.make,model_family:x.model,model_type:x.engine||'',year:x.year,engine_code:x.engine||null,ccm:null,kw:null,hp:null,source_origin:x.origin}));
    const specRows=plan.specs.filter(x=>x.key&&x.value).map(x=>({elimfilters_sku:x.sku,source_sku:x.source,spec_key:x.key,spec_value:x.value,spec_unit:x.unit}));
    report.inserted.competitor=await insertRows(client,'ld_catalog.ld_competitor_cross_references',['elimfilters_sku','source_sku','competitor_brand','competitor_part_number'],'ON CONFLICT (elimfilters_sku,competitor_brand,competitor_part_number) DO NOTHING',compRows);
    report.inserted.oem=await insertRows(client,'ld_catalog.ld_oem_cross_references',['elimfilters_sku','source_sku','oem_brand','oem_part_number'],'ON CONFLICT (elimfilters_sku,oem_brand,oem_part_number) DO NOTHING',oemRows);
    report.inserted.applications=await insertRows(client,'ld_catalog.ld_vehicle_applications',['elimfilters_sku','source_sku','make','model_family','model_type','year','engine_code','ccm','kw','hp','source_origin'],'ON CONFLICT (elimfilters_sku,make,model_family,model_type,year) DO NOTHING',appRows);
    report.inserted.specifications=await insertRows(client,'ld_catalog.ld_product_specifications',['elimfilters_sku','source_sku','spec_key','spec_value','spec_unit'],'ON CONFLICT (elimfilters_sku,spec_key) DO NOTHING',specRows);
    const ready=await client.query(`UPDATE ld_catalog.ld_production_readiness r SET has_oem=EXISTS(SELECT 1 FROM ld_catalog.ld_oem_cross_references o WHERE o.elimfilters_sku=r.elimfilters_sku),has_competitor=EXISTS(SELECT 1 FROM ld_catalog.ld_competitor_cross_references x WHERE x.elimfilters_sku=r.elimfilters_sku),has_applications=EXISTS(SELECT 1 FROM ld_catalog.ld_vehicle_applications a WHERE a.elimfilters_sku=r.elimfilters_sku),has_specifications=EXISTS(SELECT 1 FROM ld_catalog.ld_product_specifications s WHERE s.elimfilters_sku=r.elimfilters_sku),updated_at=now() WHERE r.elimfilters_sku=ANY($1::text[])`,[skus]);
    report.inserted.readiness_updated=ready.rowCount;
    const direct=(await client.query(`SELECT competitor_part_number,elimfilters_sku FROM ld_catalog.ld_competitor_cross_references WHERE upper(regexp_replace(coalesce(competitor_brand,''),'[^A-Z0-9]','','g'))='FRAM' AND ld_catalog.norm_part(competitor_part_number)=ANY($1::text[])`,[entries.map(e=>norm(e.authority))])).rows;
    const dm=new Map();for(const x of direct){const k=norm(x.competitor_part_number);if(!dm.has(k))dm.set(k,new Set());dm.get(k).add(x.elimfilters_sku)}
    const failures=[];for(const e of entries){const owners=[...(dm.get(norm(e.authority))||[])];if(owners.length!==1||owners[0]!==e.sku)failures.push({authority:e.authority,expected:e.sku,owners});}
    report.audit.direct_authorities=entries.length-failures.length;
    report.audit.direct_failures=failures;
    if(failures.length) throw new Error(`DIRECT_AUTHORITY_AUDIT_FAILED ${failures.length}`);
    const hd=(await client.query(`SELECT count(*)::int n FROM ld_catalog.ld_competitor_cross_references x JOIN public.elimfilters_catalog c ON c.sku=x.elimfilters_sku WHERE x.source_sku=ANY($1::text[]) AND c.duty='HEAVY_DUTY'`,[entries.map(e=>e.authority)])).rows[0].n;
    report.audit.heavy_duty_rows=hd;
    if(hd!==0) throw new Error(`HEAVY_DUTY_CONTAMINATION ${hd}`);
    if(EXECUTE) await client.query('COMMIT'); else await client.query('ROLLBACK');
    report.transaction=EXECUTE?'COMMIT':'ROLLBACK';
  }catch(e){try{await client.query('ROLLBACK')}catch{}report.error=e.message;throw Object.assign(e,{report});}
  finally{
    await client.end();fs.mkdirSync(REPORT_DIR,{recursive:true});
    const stamp=new Date().toISOString().replace(/[:.]/g,'-');
    const out=path.join(REPORT_DIR,`fram-ld-reconcile-${EXECUTE?'execute':'dryrun'}-${stamp}.json`);
    fs.writeFileSync(out,JSON.stringify(report,null,2));
    console.log(JSON.stringify({report:out,...report},null,2));
  }
}
main().catch(e=>{if(!e.report)console.error(e.stack||e.message);process.exit(1)});
