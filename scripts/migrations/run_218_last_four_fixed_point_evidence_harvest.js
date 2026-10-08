'use strict';

require('dotenv').config();
const { Client } = require('pg');
const {sslConfigFor}=require('../../lib/catalog-db-ssl');
const {
  normalizeCode,
  normalizeManufacturer,
  lastFourNumeric,
  governanceFrom,
} = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');

function prefixFor(sku=''){
  const s=String(sku).toUpperCase();
  for(const p of ['EA1','EA2','EF9','EL8','EH6']) if(s.startsWith(p)) return p;
  return null;
}
function expectedSku(row){
  const p=prefixFor(row.sku);
  const suffix=lastFourNumeric(row.codigo_base||row.canonical_source_code);
  return p&&suffix ? p+suffix : null;
}
async function tableExists(db,q){
  const r=await db.query('SELECT to_regclass($1) AS r',[q]);
  return Boolean(r.rows[0]?.r);
}
async function updateDerivedRefs(db,oldSku,newSku){
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
  for(const [table,col] of mappings){
    if(!(await tableExists(db,table))) continue;
    const [schema,name]=table.split('.');
    const c=await db.query(
      'SELECT 1 FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3',
      [schema,name,col]
    );
    if(!c.rowCount) continue;
    await db.query(`UPDATE ${table} SET ${col}=$1 WHERE ${col}=$2`,[newSku,oldSku]);
  }
}

async function loadRows(db,lock=false){
  return (await db.query(`
    SELECT *
    FROM public.elimfilters_catalog
    WHERE catalog_active=true
      AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
    ORDER BY sku
    ${lock?'FOR UPDATE':''}
  `)).rows;
}

function classify(rows){
  const bySku=new Map(rows.map(r=>[String(r.sku).toUpperCase(),r]));
  const malformed=rows.map(r=>({...r,expected_sku:expectedSku(r)}))
    .filter(r=>r.expected_sku && r.expected_sku!==String(r.sku).toUpperCase());
  const groups=new Map();
  for(const r of malformed){
    if(!groups.has(r.expected_sku)) groups.set(r.expected_sku,[]);
    groups.get(r.expected_sku).push(r);
  }
  const safe=[];
  const collisionRows=[];
  for(const [target,sources] of groups){
    const occ=bySku.get(target)||null;
    if(sources.length===1 && !occ) safe.push({source:sources[0],target});
    else for(const s of sources) collisionRows.push({source:s,target,occupied:occ,source_count:sources.length});
  }
  return {malformed,groups,safe,collisionRows};
}

function officialEvidenceKind(kind=''){
  const k=String(kind).toUpperCase();
  return k.includes('OFFICIAL') || k.includes('MANUFACTURER');
}
function refItems(v){
  if(!Array.isArray(v)) return [];
  return v.map(x=>({
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||''),
    source_url:x?.source_url||x?.url||null
  })).filter(x=>x.code);
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:sslConfigFor(url)});
  await db.connect();

  const report={
    mode:APPLY?'execute':'dry-run',
    fixed_point_rounds:[],
    renamed:[],
    evidence_matrix:[],
    summary:{}
  };

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    let round=0;
    while(true){
      const rows=await loadRows(db,APPLY);
      const state=classify(rows);
      report.fixed_point_rounds.push({
        round,
        malformed_rows:state.malformed.length,
        safe_candidates:state.safe.length,
        collision_rows:state.collisionRows.length,
        collision_targets:new Set(state.collisionRows.map(x=>x.target)).size
      });
      if(!APPLY || state.safe.length===0) break;

      for(const item of state.safe){
        await db.query('SAVEPOINT fp_one');
        try{
          const conflict=await db.query('SELECT sku FROM public.elimfilters_catalog WHERE sku=$1',[item.target]);
          if(conflict.rowCount) throw new Error('TARGET_BECAME_OCCUPIED');
          const u=await db.query(
            'UPDATE public.elimfilters_catalog SET sku=$1 WHERE sku=$2 RETURNING sku,codigo_base',
            [item.target,item.source.sku]
          );
          if(u.rowCount!==1) throw new Error('RENAME_COUNT_CHANGED');
          await updateDerivedRefs(db,item.source.sku,item.target);
          if(await tableExists(db,'public.crossref_resolved_cache')){
            await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[item.source.sku,item.target]]);
          }
          try{await db.query('SELECT public.refresh_crossref_cache_sku($1)',[item.target]);}catch(_){}
          await db.query('RELEASE SAVEPOINT fp_one');
          report.renamed.push({from:item.source.sku,to:item.target,codigo_base:item.source.codigo_base,status:'RESOLVED_COMMIT'});
        }catch(e){
          await db.query('ROLLBACK TO SAVEPOINT fp_one');
          await db.query('RELEASE SAVEPOINT fp_one');
          report.renamed.push({from:item.source.sku,to:item.target,status:'BLOCKED',error:e.message});
        }
      }
      round++;
      if(round>50) throw new Error('FIXED_POINT_ROUND_LIMIT');
    }

    const finalRows=await loadRows(db,false);
    const finalState=classify(finalRows);
    const evidenceExists=await tableExists(db,'public.catalog_codigo_base_evidence');
    let ledger=[];
    if(evidenceExists){
      ledger=(await db.query(`
        SELECT sku,evidence_kind,authority,manufacturer,reference_code,source_url,verified_at,metadata
        FROM public.catalog_codigo_base_evidence
        WHERE sku=ANY($1::text[])
        ORDER BY sku,verified_at DESC,id DESC
      `,[finalState.collisionRows.map(x=>x.source.sku)])).rows;
    }
    const ledgerBySku=new Map();
    for(const e of ledger){
      if(!ledgerBySku.has(e.sku)) ledgerBySku.set(e.sku,[]);
      ledgerBySku.get(e.sku).push(e);
    }

    const counts={};
    for(const item of finalState.collisionRows){
      const r=item.source;
      const duty=String(r.duty||'').toUpperCase();
      const gov=governanceFrom(r);
      const evidence=(ledgerBySku.get(r.sku)||[]).filter(e=>officialEvidenceKind(e.evidence_kind));
      const oem=refItems(r.oem_codes);
      const comp=refItems(r.competitor_codes);
      const evidenceCodes=new Set(evidence.map(e=>normalizeCode(e.reference_code)));

      const fleetguard=comp.filter(x=>x.manufacturer==='FLEETGUARD' && (x.source_url || evidenceCodes.has(normalizeCode(x.code))));
      const oemWithEvidence=oem.filter(x=>x.source_url || evidenceCodes.has(normalizeCode(x.code)));

      let className='RESEARCH_REQUIRED';
      let candidates=[];
      if(duty==='HEAVY_DUTY' && fleetguard.length){
        className='FLEETGUARD_EVIDENCE_CANDIDATE';
        candidates=fleetguard;
      }else if(duty==='HEAVY_DUTY' && oemWithEvidence.length){
        className='OEM_EVIDENCE_CANDIDATE';
        candidates=oemWithEvidence;
      }else if(duty==='LIGHT_DUTY' && oemWithEvidence.length){
        className='OEM_EVIDENCE_CANDIDATE';
        candidates=oemWithEvidence;
      }else if(evidence.length){
        className='OFFICIAL_EVIDENCE_PRESENT_NO_ELIGIBLE_FALLBACK';
      }

      counts[className]=(counts[className]||0)+1;
      report.evidence_matrix.push({
        source_sku:r.sku,
        source_base:r.codigo_base,
        natural_target:item.target,
        occupied_by:item.occupied?{sku:item.occupied.sku,codigo_base:item.occupied.codigo_base}:null,
        duty,
        governance_state:gov.state||gov.governance_state||null,
        evidence_class:className,
        candidate_count:candidates.length,
        candidates:candidates.slice(0,5),
        official_evidence_count:evidence.length
      });
    }

    report.summary={
      initial_malformed_rows:report.fixed_point_rounds[0]?.malformed_rows||0,
      fixed_point_renamed_count:report.renamed.filter(x=>x.status==='RESOLVED_COMMIT').length,
      fixed_point_blocked_count:report.renamed.filter(x=>x.status==='BLOCKED').length,
      remaining_malformed_rows:finalState.malformed.length,
      remaining_collision_rows:finalState.collisionRows.length,
      remaining_collision_targets:new Set(finalState.collisionRows.map(x=>x.target)).size,
      evidence_class_counts:counts
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
