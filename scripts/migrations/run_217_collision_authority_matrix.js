'use strict';

require('dotenv').config();
const { Client } = require('pg');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
} = require('../../lib/catalog-codigo-base-policy');
const { validateCanonicalWrite } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');

function expectedPrefix(sku='') {
  const s=String(sku).toUpperCase();
  if(s.startsWith('EA1')) return 'EA1';
  if(s.startsWith('EA2')) return 'EA2';
  if(s.startsWith('EF9')) return 'EF9';
  if(s.startsWith('EL8')) return 'EL8';
  if(s.startsWith('EH6')) return 'EH6';
  return null;
}
function expectedSkuFromCode(sku, code) {
  const prefix=expectedPrefix(sku);
  const suffix=lastFourNumeric(code);
  return prefix&&suffix ? prefix+suffix : null;
}
function stripCode(items, code) {
  const wanted=normalizeCode(code);
  return Array.isArray(items) ? items.filter(x=>normalizeCode(x?.code||x?.reference||x)!==wanted) : [];
}
function clone(v){ return JSON.parse(JSON.stringify(v)); }

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
    const [schema,name]=table.split('.');
    const c=await db.query(
      'SELECT 1 FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 AND column_name=$3',
      [schema,name,col]
    );
    if(!c.rowCount) continue;
    const u=await db.query(`UPDATE ${table} SET ${col}=$1 WHERE ${col}=$2`,[newSku,oldSku]);
    if(u.rowCount) touched.push({table,column:col,rows:u.rowCount});
  }
  return touched;
}

function buildProposal(row, approvedCode, approvedManufacturer, approvedSource){
  const proposed=clone(row);
  proposed.sku=expectedSkuFromCode(row.sku, approvedCode);
  proposed.codigo_base=approvedCode;
  proposed.oem_codes=stripCode(row.oem_codes, approvedCode);
  proposed.competitor_codes=stripCode(row.competitor_codes, approvedCode);
  proposed.enrichment_data=clone(row.enrichment_data||{});
  proposed.enrichment_data.codigo_base_governance=clone(governanceFrom(row));
  proposed.enrichment_data.codigo_base_governance.current_codigo_base=approvedCode;
  proposed.enrichment_data.codigo_base_governance.approved_codigo_base=approvedCode;
  proposed.enrichment_data.codigo_base_governance.approved_manufacturer=approvedManufacturer;
  proposed.enrichment_data.codigo_base_governance.approved_source_column=approvedSource;
  return proposed;
}

function verifiedFallbackCandidate(row){
  const gov=governanceFrom(row);
  const approvedCode=gov.approved_codigo_base;
  const approvedManufacturer=normalizeManufacturer(gov.approved_manufacturer);
  const approvedSource=String(gov.approved_source_column||'').toUpperCase();
  if(!approvedCode || normalizeCode(approvedCode)===normalizeCode(row.codigo_base)) {
    return {status:'NONE',reason:'NO_DISTINCT_APPROVED_FALLBACK'};
  }

  const duty=String(row.duty||'').toUpperCase();
  if(duty==='HEAVY_DUTY'){
    const common = gov.primary_manufacturer_verified===true
      && gov.donaldson_sku_collision_verified===true
      && gov.fallback_manufacturer_verified===true
      && gov.fallback_commercial_code_verified===true;
    if(!common) return {status:'NONE',reason:'HD_COLLISION_FALLBACK_NOT_FULLY_VERIFIED'};
    if(approvedManufacturer==='FLEETGUARD' && approvedSource==='COMPETITOR_CODES'){
      return {status:'VERIFIED',authority:'FLEETGUARD',approvedCode,approvedManufacturer,approvedSource};
    }
    if(approvedSource==='OEM_CODES'
      && gov.fleetguard_sku_collision_verified===true
      && gov.oem_base_verified===true
      && approvedManufacturer
      && !['DONALDSON','FLEETGUARD'].includes(approvedManufacturer)){
      return {status:'VERIFIED',authority:'OEM',approvedCode,approvedManufacturer,approvedSource};
    }
    return {status:'NONE',reason:'HD_APPROVED_FALLBACK_AUTHORITY_INVALID'};
  }

  if(duty==='LIGHT_DUTY'){
    const origin=String(gov.origin_group||'').toUpperCase();
    if(origin==='EUROPEAN'
      && gov.primary_manufacturer_verified===true
      && gov.mann_code_collision_verified===true
      && gov.oem_base_verified===true
      && approvedSource==='OEM_CODES'
      && approvedManufacturer){
      return {status:'VERIFIED',authority:'OEM',approvedCode,approvedManufacturer,approvedSource};
    }
    return {status:'NONE',reason:'LD_COLLISION_FALLBACK_NOT_FULLY_VERIFIED'};
  }

  return {status:'NONE',reason:'UNSUPPORTED_DUTY'};
}

async function applyProposal(db, source, proposal){
  await db.query('SAVEPOINT collision_one');
  try{
    const before=await db.query(
      'SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
      [source.sku]
    );
    if(before.rowCount!==1 || normalizeCode(before.rows[0].codigo_base)!==normalizeCode(source.codigo_base)){
      throw new Error('SOURCE_CHANGED');
    }
    const conflict=await db.query(
      'SELECT sku,codigo_base FROM public.elimfilters_catalog WHERE sku=$1',
      [proposal.sku]
    );
    if(conflict.rowCount) throw new Error('TARGET_NO_LONGER_FREE '+JSON.stringify(conflict.rows));

    const u=await db.query(`
      UPDATE public.elimfilters_catalog
      SET sku=$1,
          codigo_base=$2,
          oem_codes=$3::jsonb,
          competitor_codes=$4::jsonb,
          enrichment_data=$5::jsonb
      WHERE sku=$6
      RETURNING sku,codigo_base
    `,[
      proposal.sku,proposal.codigo_base,
      JSON.stringify(proposal.oem_codes||[]),
      JSON.stringify(proposal.competitor_codes||[]),
      JSON.stringify(proposal.enrichment_data||{}),
      source.sku
    ]);
    if(u.rowCount!==1) throw new Error('CATALOG_UPDATE_COUNT_CHANGED');

    const derived=await updateDerivedRefs(db,source.sku,proposal.sku);
    if(await tableExists(db,'public.crossref_resolved_cache')){
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=ANY($1::text[])',[[source.sku,proposal.sku]]);
    }
    try{ await db.query('SELECT public.refresh_crossref_cache_sku($1)',[proposal.sku]); }catch(_){}

    await db.query('RELEASE SAVEPOINT collision_one');
    return {status:'RESOLVED_COMMIT',from:source.sku,to:proposal.sku,codigo_base:proposal.codigo_base,derived};
  }catch(e){
    await db.query('ROLLBACK TO SAVEPOINT collision_one');
    await db.query('RELEASE SAVEPOINT collision_one');
    return {status:'BLOCKED',from:source.sku,to:proposal.sku,error:e.message,code:e.code||null};
  }
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    mode:APPLY?'execute':'dry-run',
    policy:'COLLISION_AUTHORITY_MATRIX_V1',
    matrix:[],
    auto_ready:[],
    applied:[],
    blocked:[]
  };

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const rows=(await db.query(`
      SELECT *
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
      FOR UPDATE
    `)).rows;
    const bySku=new Map(rows.map(r=>[String(r.sku).toUpperCase(),r]));

    const malformed=rows.map(r=>({...r,expected_sku:expectedSkuFromCode(r.sku,r.codigo_base||r.canonical_source_code)}))
      .filter(r=>r.expected_sku && r.expected_sku!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.expected_sku)) groups.set(r.expected_sku,[]);
      groups.get(r.expected_sku).push(r);
    }

    const plannedTargets=new Map();

    for(const [naturalTarget,sources] of groups){
      const occupied=bySku.get(naturalTarget)||null;

      for(const source of sources){
        const fallback=verifiedFallbackCandidate(source);
        const entry={
          source_sku:source.sku,
          source_base:source.codigo_base,
          natural_target:naturalTarget,
          occupied_by:occupied?{sku:occupied.sku,codigo_base:occupied.codigo_base}:null,
          source_count_for_target:sources.length,
          duty:source.duty,
          canonical_source_brand:source.canonical_source_brand,
          canonical_source_code:source.canonical_source_code,
          selected_authority:null,
          selected_base:null,
          final_sku:null,
          action:'STOP_REVIEW',
          status:'STOP_REVIEW',
          reason:null,
          gateway_reasons:[]
        };

        if(!occupied && sources.length===1){
          entry.reason='NO_LONGER_COLLISION_AFTER_PRIOR_PASS';
          report.matrix.push(entry);
          continue;
        }

        if(fallback.status!=='VERIFIED'){
          entry.reason=fallback.reason;
          report.matrix.push(entry);
          continue;
        }

        const proposal=buildProposal(source,fallback.approvedCode,fallback.approvedManufacturer,fallback.approvedSource);
        if(!proposal.sku){
          entry.reason='APPROVED_FALLBACK_HAS_NO_LAST4';
          report.matrix.push(entry);
          continue;
        }
        const targetOcc=bySku.get(proposal.sku)||null;
        if(targetOcc){
          entry.selected_authority=fallback.authority;
          entry.selected_base=fallback.approvedCode;
          entry.final_sku=proposal.sku;
          entry.reason=normalizeCode(targetOcc.codigo_base)===normalizeCode(fallback.approvedCode)
            ? 'VERIFIED_FALLBACK_ALREADY_PUBLISHED_REQUIRES_CONSOLIDATION_REVIEW'
            : 'VERIFIED_FALLBACK_SKU_COLLISION';
          report.matrix.push(entry);
          continue;
        }

        const validation=validateCanonicalWrite(proposal,{validateApplications:false});
        entry.gateway_reasons=validation.reasons||[];
        entry.selected_authority=fallback.authority;
        entry.selected_base=fallback.approvedCode;
        entry.final_sku=proposal.sku;
        if(!validation.valid){
          entry.reason='GATEWAY_VALIDATION_FAILED';
          report.matrix.push(entry);
          continue;
        }

        const prior=plannedTargets.get(proposal.sku);
        if(prior){
          entry.reason='PLANNED_TARGET_COLLISION_WITH_'+prior;
          report.matrix.push(entry);
          continue;
        }
        plannedTargets.set(proposal.sku,source.sku);

        entry.action='AUTO_RENAME_WITH_VERIFIED_FALLBACK';
        entry.status='AUTO_READY';
        entry.reason='VERIFIED_AUTHORITY_AND_FREE_TARGET';
        report.matrix.push(entry);
        report.auto_ready.push({
          source_sku:source.sku,
          source_base:source.codigo_base,
          selected_authority:fallback.authority,
          selected_base:fallback.approvedCode,
          final_sku:proposal.sku
        });

        if(APPLY){
          const result=await applyProposal(db,source,proposal);
          if(result.status==='RESOLVED_COMMIT') report.applied.push(result);
          else report.blocked.push(result);
        }
      }
    }

    const counts={};
    for(const x of report.matrix) counts[x.status]=(counts[x.status]||0)+1;
    const reasonCounts={};
    for(const x of report.matrix) reasonCounts[x.reason]=(reasonCounts[x.reason]||0)+1;

    report.summary={
      remaining_malformed_rows:malformed.length,
      collision_target_count:groups.size,
      matrix_row_count:report.matrix.length,
      auto_ready_count:report.auto_ready.length,
      applied_count:report.applied.length,
      blocked_count:report.blocked.length,
      stop_review_count:counts.STOP_REVIEW||0,
      status_counts:counts,
      reason_counts:reasonCounts
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
