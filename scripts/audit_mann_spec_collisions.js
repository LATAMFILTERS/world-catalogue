'use strict';

const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const PATCH_FILE=path.join(__dirname,'mann_specs_patch.jsonl');
const OUT_ARG=process.argv.find(a=>a.startsWith('--out='));
const OUT_FILE=OUT_ARG?OUT_ARG.slice('--out='.length):null;

function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function n(v){return v==null||v===''?null:Number(v);}
function eq(a,b){return a===b || (a==null&&b==null);}
function comparablePatch(row){
  return {
    installation_type:row.installation_type||null,
    thread_size:row.thread_size||null,
    outer_diameter_mm:n(row.outer_diameter_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm)
  };
}
function comparableLive(row){
  return {
    installation_type:row.installation_type||null,
    thread_size:row.thread_size||null,
    outer_diameter_mm:n(row.outer_diameter_mm),
    inner_diameter_mm:n(row.inner_diameter_mm),
    product_length_mm:n(row.product_length_mm),
    height_mm:n(row.height_mm),
    gasket_od_mm:n(row.gasket_od_mm),
    gasket_id_mm:n(row.gasket_id_mm)
  };
}
function parseMmSpec(v){
  const m=/^\s*([0-9]+(?:\.[0-9]+)?)\s*mm\b/i.exec(String(v||''));
  return m?Number(m[1]):null;
}
function semanticExpected(specRows){
  const out={};
  for(const s of specRows){
    const value=parseMmSpec(s.spec_value);
    if(value==null) continue;
    if(s.spec_key==='Height') out.height_mm=value;
    else if(s.spec_key==='Outer diameter') out.outer_diameter_mm=value;
    else if(s.spec_key==='Inner diameter') out.inner_diameter_mm=value;
    else if(s.spec_key==='Length') out.product_length_mm=value;
  }
  return out;
}
function diffs(live,patch){
  return Object.keys(patch).filter(k=>!eq(live[k],patch[k]));
}
function exactMatch(live,patch){
  return diffs(live,patch).length===0;
}

async function main(){
  if(!fs.existsSync(PATCH_FILE)) throw new Error('PATCH_FILE_MISSING');
  const patches=fs.readFileSync(PATCH_FILE,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
  const grouped=new Map();
  for(const row of patches){
    const sku=String(row.sku||'').trim().toUpperCase();
    if(!sku) continue;
    if(!grouped.has(sku)) grouped.set(sku,[]);
    grouped.get(sku).push(row);
  }
  const collisions=[...grouped.entries()].filter(([,rows])=>rows.length>1);
  const skus=collisions.map(([sku])=>sku);

  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  try{
    const liveRows=[];
    for(let i=0;i<skus.length;i+=400){
      const part=skus.slice(i,i+400);
      const q=await db.query(`
        SELECT sku,filter_type,duty,canonical_source_brand,canonical_source_code,
               installation_type,thread_size,outer_diameter_mm,inner_diameter_mm,product_length_mm,
               height_mm,gasket_od_mm,gasket_id_mm,canonical_source_status,catalog_active
        FROM public.elimfilters_catalog
        WHERE sku=ANY($1::text[])
      `,[part]);
      liveRows.push(...q.rows);
    }
    const liveMap=new Map(liveRows.map(r=>[r.sku,r]));

    const specRows=[];
    for(let i=0;i<skus.length;i+=400){
      const part=skus.slice(i,i+400);
      const q=await db.query(`
        SELECT elimfilters_sku,source_sku,spec_key,spec_value
        FROM ld_catalog.ld_product_specifications
        WHERE elimfilters_sku=ANY($1::text[])
      `,[part]);
      specRows.push(...q.rows);
    }
    const specsBySku=new Map();
    for(const row of specRows){
      if(!specsBySku.has(row.elimfilters_sku)) specsBySku.set(row.elimfilters_sku,[]);
      specsBySku.get(row.elimfilters_sku).push(row);
    }

    const findings=[];
    for(const [sku,rows] of collisions){
      const live=liveMap.get(sku)||null;
      if(!live){
        findings.push({sku,state:'LIVE_SKU_MISSING',patch_sources:rows.map(r=>r.mann_source)});
        continue;
      }
      if(live.canonical_source_brand!=='MANN-FILTER'||!live.canonical_source_code){
        findings.push({
          sku,state:'NON_MANN_OR_UNGOVERNED_LIVE',
          canonical_source_brand:live.canonical_source_brand,
          canonical_source_code:live.canonical_source_code,
          patch_sources:rows.map(r=>r.mann_source)
        });
        continue;
      }
      const liveComparable=comparableLive(live);
      const semanticRows=(specsBySku.get(sku)||[]).filter(
        s=>norm(s.source_sku)===norm(live.canonical_source_code)
      );
      const semantic=semanticExpected(semanticRows);
      if(Object.keys(semantic).length>=2){
        const semanticChanged=diffs(liveComparable,semantic);
        findings.push({
          sku,
          state:semanticChanged.length===0?'LIVE_MATCHES_SEMANTIC_CANONICAL':'LIVE_DIFFERS_SEMANTIC_CANONICAL',
          canonical_source_code:live.canonical_source_code,
          filter_type:live.filter_type,
          duty:live.duty,
          changed_fields:semanticChanged,
          semantic_expected:semantic,
          semantic_spec_rows:semanticRows,
          patch_sources:rows.map(r=>r.mann_source)
        });
        continue;
      }

      const canonicalRows=rows.filter(r=>norm(r.mann_source)===norm(live.canonical_source_code));
      if(canonicalRows.length!==1){
        findings.push({
          sku,
          state:canonicalRows.length===0?'NO_CANONICAL_PATCH_ROW':'MULTIPLE_CANONICAL_PATCH_ROWS',
          canonical_source_code:live.canonical_source_code,
          patch_sources:rows.map(r=>r.mann_source)
        });
        continue;
      }
      const canonicalPatch=comparablePatch(canonicalRows[0]);
      const changed=diffs(liveComparable,canonicalPatch);
      const offCanonical=rows.filter(r=>norm(r.mann_source)!==norm(live.canonical_source_code));
      const matchingOff=offCanonical.filter(r=>exactMatch(liveComparable,comparablePatch(r))).map(r=>r.mann_source);
      findings.push({
        sku,
        state:changed.length===0?'LIVE_MATCHES_CANONICAL':(matchingOff.length?'CONFIRMED_OFF_CANONICAL_OVERWRITE':'LIVE_DIFFERS_CANONICAL'),
        canonical_source_code:live.canonical_source_code,
        filter_type:live.filter_type,
        duty:live.duty,
        changed_fields:changed,
        matching_off_canonical_sources:matchingOff,
        live:liveComparable,
        canonical_patch:canonicalPatch,
        patch_sources:rows.map(r=>r.mann_source)
      });
    }

    const counts={};
    for(const f of findings) counts[f.state]=(counts[f.state]||0)+1;
    const actionable=findings.filter(f=>[
      'CONFIRMED_OFF_CANONICAL_OVERWRITE',
      'LIVE_DIFFERS_CANONICAL',
      'LIVE_DIFFERS_SEMANTIC_CANONICAL'
    ].includes(f.state));
    const report={
      generated_at:new Date().toISOString(),
      patch_rows:patches.length,
      colliding_skus:collisions.length,
      live_collision_skus:liveRows.length,
      state_counts:counts,
      actionable_count:actionable.length,
      actionable
    };
    const out=JSON.stringify(report,null,2);
    if(OUT_FILE){
      fs.mkdirSync(path.dirname(OUT_FILE),{recursive:true});
      fs.writeFileSync(OUT_FILE,out+'\n','utf8');
    }
    console.log(out);
  }finally{
    await db.end();
  }
}

main().catch(e=>{console.error(e.stack||e);process.exit(1);});
