'use strict';

const { Client } = require('pg');
const {
  loadCsv,
  key,
  classifyMatches,
  assertDatabase
} = require('../audits/audit_master_ccm_backfill_candidates');

const EXECUTE = process.argv.includes('--execute');
const EXPECTED = {
  MATCH_UNIQUE: 157599,
  AMBIGUOUS: 3110,
  NO_ENGINE_SIZE_IN_SOURCE: 103110,
  NO_SOURCE_MATCH: 0
};
const EXPECTED_MASTER_NULL_CCM = Object.values(EXPECTED).reduce((a,b)=>a+b,0);
const BATCH = 500;

const norm = v => String(v ?? '').trim().toUpperCase();

async function stageCandidates(db, candidates) {
  await db.query(`
    CREATE TEMP TABLE tmp_run136_ccm (
      id integer PRIMARY KEY,
      source_sku varchar(50),
      make varchar(100),
      model_family varchar(100),
      model_type varchar(100),
      year varchar(50),
      engine_code varchar(100),
      source_origin varchar(50),
      proposed_ccm varchar(50) NOT NULL,
      source_line integer NOT NULL
    ) ON COMMIT DROP
  `);

  for (let offset=0; offset<candidates.length; offset+=BATCH) {
    const batch=candidates.slice(offset,offset+BATCH);
    const values=[];
    const params=[];
    for (let i=0;i<batch.length;i++) {
      const r=batch[i];
      const base=i*10;
      values.push(`($${base+1},$${base+2},$${base+3},$${base+4},$${base+5},$${base+6},$${base+7},$${base+8},$${base+9},$${base+10})`);
      params.push(r.id,r.source_sku,r.make,r.model_family,r.model_type,r.year,r.engine_code,r.source_origin,r.proposed_ccm,r.source_line);
    }
    await db.query(`INSERT INTO tmp_run136_ccm VALUES ${values.join(',')}`,params);
  }
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DATABASE_URL_MISSING');
  assertDatabase(url);

  const {map,total:csvRows}=loadCsv();
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try {
    const target=(await db.query('SELECT current_database() db, inet_server_port() port')).rows[0];
    if(target.db!=='catalogo_elimfilters'||Number(target.port)!==5441) throw new Error('WRONG_TARGET_DATABASE');

    const rows=(await db.query(`
      SELECT id,elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE source_origin='master' AND ccm IS NULL
      ORDER BY id
    `)).rows;

    const counts={MATCH_UNIQUE:0,AMBIGUOUS:0,NO_ENGINE_SIZE_IN_SOURCE:0,NO_SOURCE_MATCH:0};
    const candidates=[];
    for(const r of rows){
      const matches=map.get(key(r))||[];
      const result=classifyMatches(matches);
      counts[result.cls]++;
      if(result.cls==='MATCH_UNIQUE'){
        if(matches.length!==1) throw new Error('MATCH_UNIQUE_WITHOUT_ONE_SOURCE_ROW');
        candidates.push({
          ...r,
          proposed_ccm:String(result.ccm),
          source_line:matches[0].line
        });
      }
    }

    if(rows.length!==EXPECTED_MASTER_NULL_CCM) throw new Error(`MASTER_NULL_CCM_COUNT_CHANGED:${rows.length}`);
    for(const [k,v] of Object.entries(EXPECTED)){
      if(counts[k]!==v) throw new Error(`AUDIT_CLASS_COUNT_CHANGED:${k}:${counts[k]}!=${v}`);
    }
    if(candidates.length!==EXPECTED.MATCH_UNIQUE) throw new Error('CANDIDATE_COUNT_CHANGED');
    if(candidates.some(r=>norm(r.source_sku)==='CH10358')) throw new Error('CH10358_MUST_NOT_BE_IN_RUN136');

    await stageCandidates(db,candidates);

    const staged=Number((await db.query('SELECT count(*)::int n FROM tmp_run136_ccm')).rows[0].n);
    if(staged!==EXPECTED.MATCH_UNIQUE) throw new Error('STAGING_COUNT_MISMATCH');
    const badLines=Number((await db.query('SELECT count(*)::int n FROM tmp_run136_ccm WHERE source_line<2')).rows[0].n);
    if(badLines!==0) throw new Error('SOURCE_LINE_EVIDENCE_INVALID');

    const beforeTotal=Number((await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n);
    const beforeNonNull=Number((await db.query("SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE source_origin='master' AND ccm IS NOT NULL")).rows[0].n);

    const updated=(await db.query(`
      WITH changed AS (
        UPDATE ld_catalog.ld_vehicle_applications v
        SET ccm=s.proposed_ccm
        FROM tmp_run136_ccm s
        WHERE v.id=s.id
          AND v.ccm IS NULL
          AND v.source_origin='master'
          AND v.source_sku IS NOT DISTINCT FROM s.source_sku
          AND v.make IS NOT DISTINCT FROM s.make
          AND v.model_family IS NOT DISTINCT FROM s.model_family
          AND v.model_type IS NOT DISTINCT FROM s.model_type
          AND v.year IS NOT DISTINCT FROM s.year
          AND v.engine_code IS NOT DISTINCT FROM s.engine_code
          AND v.source_origin IS NOT DISTINCT FROM s.source_origin
        RETURNING v.id
      )
      SELECT count(*)::int n FROM changed
    `)).rows[0].n;

    if(Number(updated)!==EXPECTED.MATCH_UNIQUE) throw new Error(`COMPARE_AND_SWAP_UPDATE_COUNT:${updated}`);

    const mismatched=Number((await db.query(`
      SELECT count(*)::int n
      FROM tmp_run136_ccm s
      JOIN ld_catalog.ld_vehicle_applications v USING(id)
      WHERE v.ccm IS DISTINCT FROM s.proposed_ccm
         OR v.source_sku IS DISTINCT FROM s.source_sku
         OR v.make IS DISTINCT FROM s.make
         OR v.model_family IS DISTINCT FROM s.model_family
         OR v.model_type IS DISTINCT FROM s.model_type
         OR v.year IS DISTINCT FROM s.year
         OR v.engine_code IS DISTINCT FROM s.engine_code
         OR v.source_origin IS DISTINCT FROM s.source_origin
    `)).rows[0].n);
    if(mismatched!==0) throw new Error('POST_UPDATE_STAGED_ROW_MISMATCH');

    const afterTotal=Number((await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n);
    const afterNonNull=Number((await db.query("SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE source_origin='master' AND ccm IS NOT NULL")).rows[0].n);
    if(afterTotal!==beforeTotal) throw new Error('APPLICATION_ROW_COUNT_CHANGED');
    if(afterNonNull-beforeNonNull!==EXPECTED.MATCH_UNIQUE) throw new Error('MASTER_CCM_NON_NULL_DELTA_MISMATCH');

    const remainingNull=Number((await db.query("SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE source_origin='master' AND ccm IS NULL")).rows[0].n);
    if(remainingNull!==EXPECTED.AMBIGUOUS+EXPECTED.NO_ENGINE_SIZE_IN_SOURCE+EXPECTED.NO_SOURCE_MATCH) throw new Error('REMAINING_NULL_CCM_COUNT_MISMATCH');

    const ch10358=Number((await db.query("SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku='EL36006' AND source_sku='CH10358'")).rows[0].n);
    if(ch10358!==0) throw new Error('CH10358_UNEXPECTEDLY_CHANGED');

    const report={
      mode:EXECUTE?'execute':'dry-run',
      database:target,
      csv_rows:csvRows,
      audit_counts:counts,
      staged_candidates:staged,
      source_line_evidence_rows:staged,
      updated_rows:Number(updated),
      application_count:{before:beforeTotal,after:afterTotal},
      master_ccm_nonnull:{before:beforeNonNull,after:afterNonNull},
      remaining_master_null_ccm:remainingNull,
      excluded:{
        ambiguous:counts.AMBIGUOUS,
        no_engine_size_in_source:counts.NO_ENGINE_SIZE_IN_SOURCE,
        no_source_match:counts.NO_SOURCE_MATCH
      },
      ch10358_el36006_rows:ch10358
    };

    if(EXECUTE){
      await db.query('COMMIT');
      report.transaction='COMMIT';
    } else {
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
    console.log(EXECUTE?'COMMIT':'ROLLBACK (dry-run)');
  } catch(error) {
    try{await db.query('ROLLBACK')}catch{}
    throw error;
  } finally {
    await db.end();
  }
}

if(require.main===module){
  main().catch(error=>{console.error(error.stack||error.message);process.exit(1);});
}

module.exports={EXPECTED,EXPECTED_MASTER_NULL_CCM,BATCH};
