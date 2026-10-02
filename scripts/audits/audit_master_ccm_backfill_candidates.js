'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const ROOT=path.resolve(__dirname,'../..');
const CSV=path.join(ROOT,'vehicle_applications_master.csv');
const OUTDIR=path.join(ROOT,'elimfilters-vault','91-private-evidence','ccm-backfill-audit');

function assertDatabase(url){
  const u=new URL(url);
  if(u.pathname.replace(/^\//,'')!=='catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DATABASE');
  const port=Number(u.port||5432);
  if(port===5432) throw new Error('REFUSE_PORT_5432');
  if(port!==5441) throw new Error('REFUSE_UNEXPECTED_PORT');
}
function norm(v){return String(v??'').trim().toUpperCase();}
function csvLine(line){
  const out=[]; let s='',q=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(c==='"'){ if(q&&line[i+1]==='"'){s+='"';i++;} else q=!q; }
    else if(c===','&&!q){out.push(s);s='';}
    else s+=c;
  }
  out.push(s); return out;
}
function key(r){
  return [r.source_sku,r.make,r.model_family,r.model_type,r.engine_code,r.year].map(norm).join('|');
}
function loadCsv(){
  const lines=fs.readFileSync(CSV,'utf8').split(/\r?\n/).filter(Boolean);
  const header=csvLine(lines[0]);
  const idx=Object.fromEntries(header.map((h,i)=>[h,i]));
  const map=new Map();
  for(let i=1;i<lines.length;i++){
    const a=csvLine(lines[i]);
    const row={
      source_sku:a[idx.source_sku], make:a[idx.make], model_family:a[idx.model_family],
      model_type:a[idx.model_type], engine_code:a[idx.engine_code], year:a[idx.year],
      engine_size:a[idx.engine_size], source_brand:a[idx.source_brand],
      elimfilters_sku:a[idx.elimfilters_sku], line:i+1
    };
    const k=key(row); if(!map.has(k))map.set(k,[]); map.get(k).push(row);
  }
  return {map,total:lines.length-1};
}
function classifyMatches(matches){
  const usable=matches.filter(x=>String(x.engine_size||'').trim()!=='');
  if(matches.length===1&&usable.length===1) return {cls:'MATCH_UNIQUE',reason:'ONE_EXACT_SOURCE_ROW_WITH_ENGINE_SIZE',ccm:usable[0].engine_size};
  if(matches.length>1) return {cls:'AMBIGUOUS',reason:'MULTIPLE_EXACT_SOURCE_ROWS',ccm:null};
  if(matches.length===1) return {cls:'NO_ENGINE_SIZE_IN_SOURCE',reason:'EXACT_SOURCE_ROW_WITHOUT_ENGINE_SIZE',ccm:null};
  return {cls:'NO_SOURCE_MATCH',reason:'NO_EXACT_SOURCE_ROW',ccm:null};
}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DATABASE_URL_MISSING');
  assertDatabase(url);
  const {map,total}=loadCsv();
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  await db.query('BEGIN TRANSACTION READ ONLY');
  try{
    const rows=(await db.query(`SELECT id,elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE source_origin='master' AND ccm IS NULL ORDER BY id`)).rows;
    const counts={MATCH_UNIQUE:0,AMBIGUOUS:0,NO_ENGINE_SIZE_IN_SOURCE:0,NO_SOURCE_MATCH:0};
    const reasons={};
    const samples={MATCH_UNIQUE:[],AMBIGUOUS:[],NO_ENGINE_SIZE_IN_SOURCE:[],NO_SOURCE_MATCH:[]};
    let usableEngineSize=0;
    for(const r of rows){
      const matches=map.get(key(r))||[];
      const {cls,reason,ccm}=classifyMatches(matches);
      if(cls==='MATCH_UNIQUE') usableEngineSize++;
      counts[cls]++; reasons[reason]=(reasons[reason]||0)+1;
      if(samples[cls].length<25) samples[cls].push({id:r.id,sku:r.elimfilters_sku,source_sku:r.source_sku,make:r.make,model_family:r.model_family,model_type:r.model_type,year:r.year,engine_code:r.engine_code,proposed_ccm:ccm,source_lines:matches.map(x=>x.line),reason});
    }
    const checks={
      prius_165983:(()=>{const r=rows.find(x=>x.id===165983);const m=r?(map.get(key(r))||[]):[];return {db_present:!!r,matches:m.length,engine_sizes:m.map(x=>x.engine_size),lines:m.map(x=>x.line)};})(),
      db_master_rows:rows.length,
      db_master_ccm_nonnull:Number((await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE source_origin='master' AND ccm IS NOT NULL`)).rows[0].n),
      application_count:Number((await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n)
    };
    const report={mode:'READ_ONLY',database:{db:'catalogo_elimfilters',port:5441},csv_rows:total,counts,reasons,usable_engine_size_unique:usableEngineSize,checks,samples};
    fs.mkdirSync(OUTDIR,{recursive:true});
    const file=path.join(OUTDIR,`ccm-backfill-audit-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
    fs.writeFileSync(file,JSON.stringify(report,null,2));
    await db.query('ROLLBACK');
    console.log(JSON.stringify({...report,report_file:file},null,2));
  }catch(e){try{await db.query('ROLLBACK')}catch{};throw e}
  finally{await db.end()}
}
if(require.main===module) main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={key,csvLine,loadCsv,classifyMatches,assertDatabase};
