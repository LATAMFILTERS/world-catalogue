'use strict';

const fs=require('fs');
const path=require('path');
const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../lib/catalog-write-gateway');
const {physicalIssues}=require('../lib/product-page-data');
const {
  normalizePart,
  fetchOfficialMannSpecs,
}=require('../lib/mann-official-spec-verifier');

const EXECUTE=process.argv.includes('--execute');
const limitArg=process.argv.find(a=>a.startsWith('--limit='));
const LIMIT=limitArg?Math.max(1,Math.min(150,Number(limitArg.split('=')[1])||25)):25;
const scanArg=process.argv.find(a=>a.startsWith('--scan-limit='));
const SCAN_LIMIT=scanArg?Math.max(LIMIT,Math.min(500,Number(scanArg.split('=')[1])||250)):250;
const PATCH_FILE=path.join(__dirname,'mann_specs_patch.jsonl');
const outArg=process.argv.find(a=>a.startsWith('--out='));
const OUT_FILE=outArg?outArg.slice('--out='.length):null;

function n(v){return v==null||v===''?null:Number(v);}
function same(a,b){return a==null&&b==null?true:n(a)===n(b);}
function patchComparable(row){
  return {
    outer_diameter_mm:n(row.outer_diameter_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm),
  };
}
function liveComparable(row){
  return {
    outer_diameter_mm:n(row.outer_diameter_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm),
  };
}
function equalShape(a,b){
  return Object.keys(b).every(k=>same(a[k],b[k]));
}

function loadCollisionGroups(){
  const rows=fs.readFileSync(PATCH_FILE,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const grouped=new Map();
  for(const row of rows){
    const sku=String(row.sku||'').trim().toUpperCase();
    if(!sku) continue;
    if(!grouped.has(sku)) grouped.set(sku,[]);
    grouped.get(sku).push(row);
  }
  return [...grouped.entries()].filter(([,items])=>items.length>1);
}

function classifyOfficial(values){
  const hasRound=values.outer_diameter_mm!=null&&values.height_mm!=null;
  const hasPanel=values.product_length_mm!=null&&values.product_width_mm!=null&&values.height_mm!=null;
  if(hasRound&&hasPanel) return {ok:false,reason:'AMBIGUOUS_GEOMETRY'};
  if(hasRound) return {ok:true,shape:'round'};
  if(hasPanel) return {ok:true,shape:'panel'};
  return {ok:false,reason:'INCOMPLETE_GEOMETRY'};
}

function validateOfficialGeometry(values,shape){
  const nums=Object.entries(values).filter(([,v])=>v!=null);
  for(const [key,value] of nums){
    if(!Number.isFinite(value)||value<=0) return {valid:false,reasons:[`${key}_NON_POSITIVE`]};
    if(value>2000) return {valid:false,reasons:[`${key}_OVER_2000MM`]};
  }
  const reasons=[];
  if(shape==='round'){
    const physical=physicalIssues({
      height:values.height_mm,
      outerDiameter:values.outer_diameter_mm,
      gasketOuter:null,
      gasketInner:null,
    });
    reasons.push(...physical.errors);
    if(values.inner_diameter_mm!=null&&values.inner_diameter_mm>=values.outer_diameter_mm){
      reasons.push('INNER_DIAMETER_NOT_BELOW_OUTER');
    }
    if(values.inner_diameter_1_mm!=null&&values.inner_diameter_1_mm>=values.outer_diameter_mm){
      reasons.push('INNER_DIAMETER_1_NOT_BELOW_OUTER');
    }
  }else{
    const dims=[values.product_length_mm,values.product_width_mm,values.height_mm];
    const min=Math.min(...dims);
    const max=Math.max(...dims);
    if(max/min>25) reasons.push('PANEL_DIMENSION_RATIO_IMPLAUSIBLE');
  }
  return {valid:reasons.length===0,reasons};
}

function buildPatch(values,shape,sourceUrl){
  const patch={
    height_mm:values.height_mm,
    canonical_source_url:sourceUrl,
    canonical_source_status:'VERIFIED',
    canonical_verified_at:new Date(),
  };
  if(shape==='round'){
    patch.outer_diameter_mm=values.outer_diameter_mm;
    patch.inner_diameter_mm=values.inner_diameter_mm??null;
    patch.product_length_mm=null;
    patch.gasket_od_mm=null;
    patch.gasket_id_mm=null;
  }else{
    patch.product_length_mm=values.product_length_mm;
    patch.outer_diameter_mm=null;
    patch.inner_diameter_mm=null;
    patch.gasket_od_mm=null;
    patch.gasket_id_mm=null;
  }
  return patch;
}

function patchDiffers(row,patch){
  const fields=['height_mm','product_length_mm','outer_diameter_mm','inner_diameter_mm','gasket_od_mm','gasket_id_mm'];
  return fields.some(k=>Object.hasOwn(patch,k)&&!same(row[k],patch[k]));
}

async function fetchRows(db,skus){
  const out=[];
  for(let i=0;i<skus.length;i+=400){
    const q=await db.query(`
      SELECT *
      FROM public.elimfilters_catalog
      WHERE sku=ANY($1::text[])
    `,[skus.slice(i,i+400)]);
    out.push(...q.rows);
  }
  return out;
}

async function resolverCheck(db,row){
  const q=await db.query(
    `SELECT sku FROM public.v_api_resolver_v7
      WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
      ORDER BY sku`,
    [row.canonical_source_code]
  );
  return {valid:q.rowCount===1&&q.rows[0].sku===row.sku,rows:q.rows};
}

async function upsertSemanticSpecs(db,row,official){
  for(const [key,value] of official.specs){
    await db.query(
      `INSERT INTO ld_catalog.ld_product_specifications(
         elimfilters_sku,source_sku,spec_key,spec_value,spec_unit,created_at
       ) VALUES($1,$2,$3,$4,'',now())
       ON CONFLICT(elimfilters_sku,spec_key)
       DO UPDATE SET source_sku=EXCLUDED.source_sku,
                     spec_value=EXCLUDED.spec_value,
                     spec_unit=EXCLUDED.spec_unit`,
      [row.sku,row.canonical_source_code,key,value]
    );
  }
}

async function applyOne(db,row,official,shape,patch){
  const gateway=assertGovernedCatalogPatch(row,patch);
  const resolver=await resolverCheck(db,row);
  if(!resolver.valid) throw new Error('RESOLVER_IDENTITY_CONFLICT '+JSON.stringify(resolver.rows));

  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try{
    const locked=(await db.query(
      `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,
      [row.sku]
    )).rows[0];
    if(!locked) throw new Error('TARGET_MISSING');
    if(locked.canonical_source_brand!=='MANN-FILTER'||
       normalizePart(locked.canonical_source_code)!==normalizePart(row.canonical_source_code)||
       locked.filter_type!=='air'||locked.duty!=='LIGHT_DUTY'||locked.catalog_active!==true){
      throw new Error('IDENTITY_OR_SCOPE_CHANGED');
    }
    assertGovernedCatalogPatch(locked,patch);

    const q=await db.query(
      `UPDATE public.elimfilters_catalog
          SET height_mm=$2,
              product_length_mm=$3,
              outer_diameter_mm=$4,
              inner_diameter_mm=$5,
              gasket_od_mm=$6,
              gasket_id_mm=$7,
              canonical_source_url=$8,
              canonical_source_status='VERIFIED',
              canonical_verified_at=now()
        WHERE sku=$1
          AND canonical_source_brand='MANN-FILTER'
          AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($9)
      RETURNING sku,canonical_source_code,height_mm,product_length_mm,
                outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
                canonical_source_status,catalog_active`,
      [
        row.sku,
        patch.height_mm,
        patch.product_length_mm??null,
        patch.outer_diameter_mm??null,
        patch.inner_diameter_mm??null,
        patch.gasket_od_mm??null,
        patch.gasket_id_mm??null,
        official.url,
        row.canonical_source_code,
      ]
    );
    if(q.rowCount!==1) throw new Error('UPDATE_CARDINALITY_INVALID');

    await upsertSemanticSpecs(db,row,official);

    const post=q.rows[0];
    for(const key of ['height_mm','product_length_mm','outer_diameter_mm','inner_diameter_mm','gasket_od_mm','gasket_id_mm']){
      if(Object.hasOwn(patch,key)&&!same(post[key],patch[key])) throw new Error(`POSTCHECK_${key}_FAILED`);
    }
    const resolverPost=await resolverCheck(db,row);
    if(!resolverPost.valid) throw new Error('POST_RESOLVER_IDENTITY_CONFLICT');

    if(EXECUTE) await db.query('COMMIT');
    else await db.query('ROLLBACK');

    return {gateway,post,transaction:EXECUTE?'COMMIT':'ROLLBACK'};
  }catch(error){
    try{await db.query('ROLLBACK')}catch{}
    throw error;
  }
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

  const groups=loadCollisionGroups();
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={
    mode:EXECUTE?'execute':'dry-run',
    filter_type:'air',
    limit:LIMIT,
    scanned:0,
    official_verified:0,
    repaired:0,
    already_consistent:0,
    rejected:0,
    fetch_failed:0,
    details:[],
  };

  try{
    const rows=await fetchRows(db,groups.map(([sku])=>sku));
    const rowMap=new Map(rows.map(r=>[r.sku,r]));
    const candidates=[];

    for(const [sku,patchRows] of groups){
      const row=rowMap.get(sku);
      if(!row) continue;
      if(row.filter_type!=='air'||row.duty!=='LIGHT_DUTY'||row.catalog_active!==true||
         row.canonical_source_brand!=='MANN-FILTER'||!row.canonical_source_code) continue;

      const canonicalPatchRows=patchRows.filter(p=>normalizePart(p.mann_source)===normalizePart(row.canonical_source_code));
      if(canonicalPatchRows.length!==1) continue;
      const live=liveComparable(row);
      const offMatches=patchRows.filter(
        p=>normalizePart(p.mann_source)!==normalizePart(row.canonical_source_code)&&
           equalShape(live,patchComparable(p))
      );
      if(!offMatches.length) continue;
      candidates.push({row,offMatches:offMatches.map(p=>p.mann_source)});
    }

    candidates.sort((a,b)=>a.row.sku.localeCompare(b.row.sku));
    const scanCandidates=candidates.slice(0,SCAN_LIMIT);
    const verifiedReady=[];
    const CONCURRENCY=6;

    for(let i=0;i<scanCandidates.length && verifiedReady.length<LIMIT;i+=CONCURRENCY){
      const chunk=scanCandidates.slice(i,i+CONCURRENCY);
      const fetched=await Promise.all(chunk.map(async candidate=>({
        candidate,
        official:await fetchOfficialMannSpecs(candidate.row.canonical_source_code,{timeoutMs:12000}),
      })));

      for(const item of fetched){
        const {candidate,official}=item;
        const {row,offMatches}=candidate;
        report.scanned++;

        if(!official.ok){
          report.fetch_failed++;
          report.details.push({sku:row.sku,state:'OFFICIAL_FETCH_REJECTED',reason:official.reason,url:official.url});
          continue;
        }
        report.official_verified++;

        const classification=classifyOfficial(official.values);
        if(!classification.ok){
          report.rejected++;
          report.details.push({sku:row.sku,state:'GEOMETRY_REJECTED',reason:classification.reason,official_url:official.url});
          continue;
        }
        const physical=validateOfficialGeometry(official.values,classification.shape);
        if(!physical.valid){
          report.rejected++;
          report.details.push({sku:row.sku,state:'PHYSICAL_REJECTED',reasons:physical.reasons,official_url:official.url,values:official.values});
          continue;
        }

        const patch=buildPatch(official.values,classification.shape,official.url);
        if(!patchDiffers(row,patch)){
          report.already_consistent++;
          report.details.push({sku:row.sku,state:'ALREADY_CONSISTENT',source:row.canonical_source_code,official_url:official.url});
          continue;
        }

        verifiedReady.push({row,offMatches,official,classification,patch});
        if(verifiedReady.length>=LIMIT) break;
      }

      console.error(JSON.stringify({
        phase:'official-verification',
        scanned:report.scanned,
        ready:verifiedReady.length,
        official_verified:report.official_verified,
        rejected:report.rejected,
        fetch_failed:report.fetch_failed,
      }));
    }

    for(const item of verifiedReady.slice(0,LIMIT)){
      const {row,offMatches,official,classification,patch}=item;
      try{
        const result=await applyOne(db,row,official,classification.shape,patch);
        report.repaired++;
        report.details.push({
          sku:row.sku,
          state:EXECUTE?'REPAIRED':'DRY_RUN_VALIDATED',
          source:row.canonical_source_code,
          shape:classification.shape,
          overwritten_by:offMatches,
          official_url:official.url,
          official_sha256:official.sha256,
          official_values:official.values,
          transaction:result.transaction,
          gateway_scope:result.gateway.scope,
        });
        console.error(JSON.stringify({
          phase:'transaction',
          sku:row.sku,
          state:EXECUTE?'REPAIRED':'DRY_RUN_VALIDATED',
          repaired:report.repaired,
          target:LIMIT,
        }));
      }catch(error){
        report.rejected++;
        report.details.push({sku:row.sku,state:'WRITE_GUARD_REJECTED',reason:error.message,official_url:official.url});
      }
    }

    const output=JSON.stringify(report,null,2);
    if(OUT_FILE){
      fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});
      fs.writeFileSync(OUT_FILE,output+'\n','utf8');
    }
    console.log(output);
  }finally{
    await db.end();
  }
}

if(require.main===module){
  main().catch(error=>{console.error(error.stack||error);process.exit(1);});
}

module.exports={
  classifyOfficial,
  validateOfficialGeometry,
  buildPatch,
  patchDiffers,
};
