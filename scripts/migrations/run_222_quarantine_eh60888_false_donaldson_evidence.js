'use strict';

require('dotenv').config();
const {Client}=require('pg');
const {normalizeCode}=require('../../lib/catalog-codigo-base-policy');

const EXECUTE=process.argv.includes('--execute');

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();

  const report={
    migration:'222_QUARANTINE_EH60888_FALSE_DONALDSON_EVIDENCE',
    mode:EXECUTE?'execute':'dry-run',
    sku:'EH60888',
    evidence_code:'P169435',
    catalog_guard:null,
    matching_evidence:0,
    deleted_evidence:0,
    queue_updated:0,
    transaction:null
  };

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const row=(await db.query(
      'SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
      ['EH60888']
    )).rows[0];

    if(!row) throw new Error('EH60888_MISSING');

    const guard={
      codigo_base:row.codigo_base,
      canonical_source_brand:row.canonical_source_brand,
      canonical_source_code:row.canonical_source_code,
      canonical_source_status:row.canonical_source_status
    };
    report.catalog_guard=guard;

    if(normalizeCode(row.codigo_base)!=='HF8088') throw new Error('EH60888_BASELINE_CODIGO_BASE_CHANGED');
    if(normalizeCode(row.canonical_source_code)!=='HF8088') throw new Error('EH60888_BASELINE_CANONICAL_CODE_CHANGED');
    if(String(row.canonical_source_status||'').toUpperCase()!=='UNVERIFIED') throw new Error('EH60888_BASELINE_STATUS_CHANGED');
    if(row.canonical_source_brand!=null && String(row.canonical_source_brand).trim()!=='') throw new Error('EH60888_BASELINE_BRAND_CHANGED');

    const evidence=(await db.query(`
      SELECT id,sku,reference_code,normalized_reference,source_url,evidence_kind,authority,manufacturer,metadata
      FROM public.catalog_codigo_base_evidence
      WHERE sku='EH60888'
        AND authority='OFFICIAL_DONALDSON'
        AND manufacturer='DONALDSON'
        AND normalized_reference=$1
        AND COALESCE(metadata->>'migration','')='220_BULK_OFFICIAL_COLLISION_RESEARCH'
      FOR UPDATE
    `,[normalizeCode('P169435')])).rows;

    report.matching_evidence=evidence.length;

    if(evidence.length<1) throw new Error('RUN220_FALSE_EVIDENCE_NOT_FOUND');

    for(const e of evidence){
      if(normalizeCode(e.reference_code)!=='P169435') throw new Error('EVIDENCE_CODE_CHANGED');
      if(!/shop\.donaldson\.com/i.test(String(e.source_url||''))) throw new Error('EVIDENCE_SOURCE_CHANGED');
    }

    if(EXECUTE){
      const del=await db.query(`
        DELETE FROM public.catalog_codigo_base_evidence
        WHERE sku='EH60888'
          AND authority='OFFICIAL_DONALDSON'
          AND manufacturer='DONALDSON'
          AND normalized_reference=$1
          AND COALESCE(metadata->>'migration','')='220_BULK_OFFICIAL_COLLISION_RESEARCH'
      `,[normalizeCode('P169435')]);
      report.deleted_evidence=del.rowCount;

      const hasQueue=(await db.query("SELECT to_regclass('public.catalog_codigo_base_sanitation_queue') AS r")).rows[0]?.r;
      if(hasQueue){
        const q=await db.query(`
          UPDATE public.catalog_codigo_base_sanitation_queue
          SET attempts=attempts+1,
              last_attempt_at=now(),
              last_error='RUN_222_INVALID_DONALDSON_EVIDENCE_QUARANTINED',
              updated_at=now()
          WHERE sku='EH60888'
        `);
        report.queue_updated=q.rowCount;
      }

      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }

    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK');}catch{}
    throw e;
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e);process.exit(1);});
