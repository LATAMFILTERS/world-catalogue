'use strict';
const fs=require('fs');
const path=require('path');
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const TARGET_ID=385632;
const SOURCE_EVIDENCE_ID=165983;
const SKU='EL34967';
const SOURCE='W68/3';
const EXPECTED_YEAR='2018';
const EXPECTED_CCM='1798';
const CSV=path.resolve(__dirname,'../../vehicle_applications_master.csv');
const RAW_FRAGMENT='EL50683,MANN,W68/3,TOYOTA (USA),2018,Prius (4 cyl. 1.8L F.I. DOHC 16V),2ZRFXE,1798,,,,Oil Filter';

function assertDatabase(url){
  const u=new URL(url);
  if(u.pathname.replace(/^\//,'')!=='catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DATABASE');
  const port=Number(u.port||5432);
  if(port===5432) throw new Error('REFUSE_PORT_5432');
  if(port!==5441) throw new Error('REFUSE_UNEXPECTED_PORT');
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DATABASE_URL_MISSING');
  assertDatabase(url);
  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try{
    const report={mode:EXECUTE?'execute':'dry-run',target_id:TARGET_ID,sku:SKU,source_sku:SOURCE,preconditions:{},database:{db:'catalogo_elimfilters',port:5441}};

    const target=await db.query(`SELECT id,elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,source_origin
      FROM ld_catalog.ld_vehicle_applications WHERE id=$1 FOR UPDATE`,[TARGET_ID]);
    if(target.rowCount!==1) throw new Error('TARGET_ROW_NOT_UNIQUE');
    const t=target.rows[0];
    const exact=t.elimfilters_sku===SKU&&t.source_sku===SOURCE&&t.make==='TOYOTA'&&t.model_family==='PRIUS'&&t.model_type==='PRIUS'&&t.year===null&&t.engine_code==='2ZRFXE'&&t.ccm===null&&t.source_origin==='run_126_prius_2zrfxe_normalization';
    if(!exact) throw new Error('TARGET_ROW_STATE_CHANGED');
    report.preconditions.TARGET_RUN126_ROW_EXACT='PASS';

    const ev=await db.query(`SELECT id,elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,source_origin
      FROM ld_catalog.ld_vehicle_applications WHERE id=$1`,[SOURCE_EVIDENCE_ID]);
    if(ev.rowCount!==1) throw new Error('SOURCE_EVIDENCE_ROW_NOT_UNIQUE');
    const e=ev.rows[0];
    if(!(e.elimfilters_sku===SKU&&e.source_sku===SOURCE&&e.make==='TOYOTA (USA)'&&e.model_family==='2018'&&e.model_type==='Prius (4 cyl. 1.8L F.I. DOHC 16V)'&&e.year===null&&e.engine_code==='2ZRFXE'&&e.source_origin==='master')) throw new Error('SOURCE_EVIDENCE_ROW_CHANGED');
    report.preconditions.DB_SOURCE_EVIDENCE_2018='PASS';
    const raw=fs.readFileSync(CSV,'utf8');
    const matches=raw.split(/\r?\n/).filter(line=>line===RAW_FRAGMENT);
    if(matches.length!==1) throw new Error('RAW_CSV_EVIDENCE_NOT_UNIQUE');
    report.preconditions.RAW_CSV_2018_1798_EXACT='PASS';

    const dup=await db.query(`SELECT id FROM ld_catalog.ld_vehicle_applications
      WHERE id<>$1 AND elimfilters_sku=$2 AND upper(coalesce(make,''))='TOYOTA' AND upper(coalesce(model_family,''))='PRIUS'
        AND upper(coalesce(model_type,''))='PRIUS' AND year=$3 AND upper(coalesce(engine_code,''))='2ZRFXE'`,[TARGET_ID,SKU,EXPECTED_YEAR]);
    if(dup.rowCount!==0) throw new Error('CORRECTED_ROW_WOULD_DUPLICATE_EXISTING_APPLICATION');
    report.preconditions.NO_DUPLICATE_CORRECTED_ROW='PASS';

    const beforeCount=Number((await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n);
    const upd=await db.query(`UPDATE ld_catalog.ld_vehicle_applications
      SET year=$1, ccm=$2
      WHERE id=$3 AND elimfilters_sku=$4 AND source_sku=$5 AND make='TOYOTA' AND model_family='PRIUS' AND model_type='PRIUS'
        AND year IS NULL AND engine_code='2ZRFXE' AND ccm IS NULL AND source_origin='run_126_prius_2zrfxe_normalization'
      RETURNING id,elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,ccm,source_origin`,
      [EXPECTED_YEAR,EXPECTED_CCM,TARGET_ID,SKU,SOURCE]);
    if(upd.rowCount!==1) throw new Error('EXACTLY_ONE_ROW_NOT_UPDATED');
    const afterCount=Number((await db.query('SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications')).rows[0].n);
    if(afterCount!==beforeCount) throw new Error('APPLICATION_COUNT_CHANGED');
    report.before=t;
    report.after=upd.rows[0];
    report.updated=1;
    report.application_count={before:beforeCount,after:afterCount};
    report.ch10358_rows=Number((await db.query(`SELECT count(*)::int n FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku='EL36006' AND source_sku='CH10358'`)).rows[0].n);
    if(report.ch10358_rows!==0) throw new Error('CH10358_UNEXPECTEDLY_CHANGED');

    if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
    else {await db.query('ROLLBACK');report.transaction='ROLLBACK';}
    console.log(JSON.stringify(report,null,2));
    console.log(report.transaction+(EXECUTE?'':' (dry-run)'));
  }catch(err){try{await db.query('ROLLBACK')}catch{};throw err}
  finally{await db.end()}
}

if(require.main===module) main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
module.exports={TARGET_ID,SOURCE_EVIDENCE_ID,SKU,SOURCE,EXPECTED_YEAR,EXPECTED_CCM,RAW_FRAGMENT,assertDatabase};
