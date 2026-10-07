'use strict';

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

function digits(v){ return String(v||'').replace(/\D/g,''); }
function expectedSku(row){
  const sku=String(row.sku||'').toUpperCase();
  const d=digits(row.codigo_base||row.canonical_source_code);
  if(d.length<4) return null;
  const last4=d.slice(-4);
  if(sku.startsWith('EA1')) return 'EA1'+last4;
  if(sku.startsWith('EA2')) return 'EA2'+last4;
  if(sku.startsWith('EF9')) return 'EF9'+last4;
  if(sku.startsWith('EL8')) return 'EL8'+last4;
  if(sku.startsWith('EH6')) return 'EH6'+last4;
  return null;
}

async function tableExists(db, qualified){
  const r=await db.query('SELECT to_regclass($1) AS r',[qualified]);
  return Boolean(r.rows[0]&&r.rows[0].r);
}

async function updateDerivedRefs(db, oldSku, newSku){
  const mappings=[
    ['public.exact_part_reference','sku'],
    ['public.kit_components','filter_sku'],
    ['public.product_element','elimfilters_sku'],
    ['public.product_model','elimfilters_sku'],
    ['public.kg_product_equipment','product_sku'],
    ['public.kg_crossrefs','product_sku'],
    ['public.catalog_sku_certification','sku'],
    ['public.catalog_codigo_base_evidence','sku'],
    ['public.codigo_base_review_queue','sku'],
    ['public.hermes_catalogue_backlog','sku'],
    ['public.hermes_catalogue_dossier','sku'],
    ['public.hermes_catalogue_evidence','sku'],
    ['ld_catalog.ld_product_catalog','elimfilters_sku'],
    ['ld_catalog.ld_vehicle_applications','elimfilters_sku'],
    ['ld_catalog.ld_oem_cross_references','elimfilters_sku'],
    ['ld_catalog.ld_competitor_cross_references','elimfilters_sku'],
    ['ld_catalog.ld_product_specifications','elimfilters_sku'],
    ['ld_catalog.ld_production_readiness','elimfilters_sku']
  ];
  const touched=[];
  for(const [table,col] of mappings){
    if(!(await tableExists(db,table))) continue;
    const c=await db.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3`,
      [table.split('.')[0],table.split('.')[1],col]
    );
    if(!c.rowCount) continue;
    try{
      const u=await db.query(`UPDATE ${table} SET ${col}=$1 WHERE ${col}=$2`,[newSku,oldSku]);
      if(u.rowCount) touched.push({table,column:col,rows:u.rowCount});
    }catch(e){
      if(e.code==='23505'){
        throw Object.assign(new Error('DERIVED_UNIQUE_COLLISION '+table+'.'+col+' '+oldSku+' -> '+newSku),{code:e.code});
      }
      throw e;
    }
  }
  return touched;
}

async function renameOne(db, row, target){
  await db.query('SAVEPOINT one_sku');
  try{
    // Rename the canonical parent first. FK surfaces installed with ON UPDATE CASCADE
    // follow atomically. Updating FK children before the parent caused the previous
    // batch to fail every candidate with transient referential-integrity errors.
    const u=await db.query(
      'UPDATE public.elimfilters_catalog SET sku=$1 WHERE sku=$2 RETURNING sku,codigo_base,canonical_source_code,canonical_source_brand',
      [target,row.sku]
    );
    if(u.rowCount!==1) throw new Error('CATALOG_RENAME_COUNT_CHANGED '+row.sku);

    // Then repair denormalized/no-FK surfaces that do not cascade automatically.
    const derived=await updateDerivedRefs(db,row.sku,target);

    if(await tableExists(db,'public.crossref_resolved_cache')){
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[row.sku,target]]);
    }
    try{ await db.query('SELECT public.refresh_crossref_cache_sku($1)',[target]); }catch(_){}
    await db.query('RELEASE SAVEPOINT one_sku');
    return {from:row.sku,to:target,codigo_base:row.codigo_base,derived};
  }catch(e){
    await db.query('ROLLBACK TO SAVEPOINT one_sku');
    await db.query('RELEASE SAVEPOINT one_sku');
    return {from:row.sku,to:target,codigo_base:row.codigo_base,error:e.message,code:e.code||null};
  }
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:APPLY?'execute':'dry-run',safe_candidates:[],renamed:[],blocked:[],collisions:[],same_identity:[]};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const rows=(await db.query(`
      SELECT sku,codigo_base,canonical_source_code,canonical_source_brand,filter_type,technology,catalog_active
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
      FOR UPDATE
    `)).rows;

    const malformed=rows.map(r=>({...r,expected_sku:expectedSku(r)}))
      .filter(r=>r.expected_sku && r.expected_sku!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.expected_sku)) groups.set(r.expected_sku,[]);
      groups.get(r.expected_sku).push(r);
    }

    for(const [target,sources] of groups){
      const occ=rows.find(r=>String(r.sku).toUpperCase()===target)||null;

      if(sources.length>1){
        report.collisions.push({target,reason:'MULTIPLE_SOURCE_ROWS_MAP_TO_ONE_TARGET',sources:sources.map(s=>({sku:s.sku,codigo_base:s.codigo_base})),occupied:occ&&{sku:occ.sku,codigo_base:occ.codigo_base}});
        continue;
      }

      const src=sources[0];
      if(occ){
        const sameIdentity=String(occ.codigo_base||'').toUpperCase()===String(src.codigo_base||'').toUpperCase()
          || String(occ.canonical_source_code||'').toUpperCase()===String(src.canonical_source_code||'').toUpperCase();
        if(sameIdentity){
          report.same_identity.push({from:src.sku,to:target,codigo_base:src.codigo_base});
        }else{
          report.collisions.push({target,reason:'TARGET_OCCUPIED_DISTINCT_IDENTITY',sources:[{sku:src.sku,codigo_base:src.codigo_base}],occupied:{sku:occ.sku,codigo_base:occ.codigo_base}});
        }
        continue;
      }

      report.safe_candidates.push({from:src.sku,to:target,codigo_base:src.codigo_base,technology:src.technology});
      if(APPLY){
        const result=await renameOne(db,src,target);
        if(result.error) report.blocked.push(result); else report.renamed.push(result);
      }
    }

    report.summary={
      malformed_count:malformed.length,
      safe_candidate_count:report.safe_candidates.length,
      renamed_count:report.renamed.length,
      blocked_count:report.blocked.length,
      same_identity_count:report.same_identity.length,
      collision_count:report.collisions.length
    };

    if(APPLY){
      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }

    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK');}catch(_){}
    throw e;
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
