'use strict';

const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const EXECUTE = process.argv.includes('--execute');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const MOVES = [
  { source:'EA32141', target:'EC30554', code:'FP2141', expected:168, json:'KEEP' },
  { source:'EC36001', target:'EA32521', code:'CF6001', expected:106, json:'KEEP' },
  {
    source:'EA37125', target:'EA30994', code:'C27125', expected:25,
    json:'TRANSFER', expectedJson:50, targetKind:'VEHICLE',
    evidenceAuthority:'MANN-FILTER',
    evidenceUrl:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/c27125_mann-filter.html'
  },
  {
    source:'EC32862', target:'EC38644', code:'CUK2862', expected:125,
    json:'CLEAR_SOURCE_JUNK', expectedJson:2, targetKind:'VEHICLE',
    evidenceAuthority:'ELIMFILTERS_A4_DUPLICATE_CONTAMINATION_AUDIT',
    evidenceUrl:null
  },
  {
    source:'EL30922', target:'EL36657', code:'WP922', expected:7,
    json:'TRANSFER', expectedJson:16, targetKind:'VEHICLE',
    evidenceAuthority:'MANN-FILTER',
    evidenceUrl:'https://www.mann-filter.com/us-en/catalog/search-results/product.html/wp922_mann-filter.html'
  },
  {
    source:'EL39409', target:'EW72096', code:'WA940/9', expected:151,
    json:'TRANSFER', expectedJson:150, targetKind:'EQUIPMENT',
    evidenceAuthority:'MANN-FILTER + DONALDSON',
    evidenceUrl:'https://www.mann-filter.com/en/catalog/search-results/product.html/wa940/9_mann-filter.html'
  }
];

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const report={
    mode:EXECUTE?'execute':'dry-run',
    planned_moves:[],
    blank_application_delete:null,
    wa9409_crossref:null,
    mutations:{
      application_rows_reowned:0,
      blank_application_rows_deleted:0,
      source_json_cleared:0,
      target_json_populated:0,
      ld_crossrefs_deleted:0,
      ld_crossrefs_inserted:0
    }
  };

  try {
    for(const move of MOVES){
      const rows=await db.query(
        `SELECT id,make,model_family,model_type,year,engine_code
           FROM ld_catalog.ld_vehicle_applications
          WHERE elimfilters_sku=$1
            AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
          ORDER BY id`,
        [move.source,move.code]
      );
      if(rows.rowCount!==move.expected){
        throw new Error(`${move.source} ${move.code} row count ${rows.rowCount} != ${move.expected}`);
      }

      const collisions=await db.query(
        `SELECT count(*)::int AS n
           FROM ld_catalog.ld_vehicle_applications s
          WHERE s.elimfilters_sku=$1
            AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part($2)
            AND EXISTS (
              SELECT 1
                FROM ld_catalog.ld_vehicle_applications t
               WHERE t.elimfilters_sku=$3
                 AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
                 AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
                 AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
                 AND coalesce(t.year,'')=coalesce(s.year,'')
            )`,
        [move.source,move.code,move.target]
      );
      if(collisions.rows[0].n!==0){
        throw new Error(`${move.source}->${move.target} has ${collisions.rows[0].n} target key collisions`);
      }

      let jsonCount=null;
      if(move.json!=='KEEP'){
        const meta=await db.query(
          `SELECT
             CASE WHEN jsonb_typeof(coalesce(vehicle_applications,'[]'::jsonb))='array'
                  THEN jsonb_array_length(coalesce(vehicle_applications,'[]'::jsonb)) ELSE 0 END AS source_json_count,
             (SELECT CASE
                       WHEN $3='EQUIPMENT'
                         THEN CASE WHEN jsonb_typeof(coalesce(t.equipment_applications,'[]'::jsonb))='array'
                                   THEN jsonb_array_length(coalesce(t.equipment_applications,'[]'::jsonb)) ELSE 0 END
                       ELSE CASE WHEN jsonb_typeof(coalesce(t.vehicle_applications,'[]'::jsonb))='array'
                                  THEN jsonb_array_length(coalesce(t.vehicle_applications,'[]'::jsonb)) ELSE 0 END
                     END
                FROM public.elimfilters_catalog t WHERE t.sku=$2) AS target_json_count,
             vehicle_applications AS source_json,
             vehicle_applications::text AS source_json_text
           FROM public.elimfilters_catalog
          WHERE sku=$1`,
          [move.source,move.target,move.targetKind || 'VEHICLE']
        );
        if(meta.rowCount!==1) throw new Error(`missing source catalog row ${move.source}`);
        jsonCount=Number(meta.rows[0].source_json_count||0);
        const targetJsonCount=Number(meta.rows[0].target_json_count||0);
        if(jsonCount!==move.expectedJson){
          throw new Error(`${move.source} JSON count ${jsonCount} != ${move.expectedJson}`);
        }
        if(targetJsonCount!==0){
          throw new Error(`${move.target} target JSON not empty: ${targetJsonCount}`);
        }
        if(move.json==='CLEAR_SOURCE_JUNK' && !String(meta.rows[0].source_json_text||'').includes('3880cc 237 CID')){
          throw new Error('EC32862 junk JSON signature not found');
        }
      }

      report.planned_moves.push({...move,rows:rows.rowCount,jsonCount});

      if(EXECUTE){
        const updated=await db.query(
          `UPDATE ld_catalog.ld_vehicle_applications
              SET elimfilters_sku=$1
            WHERE id=ANY($2::int[])
              AND elimfilters_sku=$3
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)`,
          [move.target,rows.rows.map(r=>r.id),move.source,move.code]
        );
        if(updated.rowCount!==move.expected){
          throw new Error(`${move.source} updated ${updated.rowCount} != ${move.expected}`);
        }
        report.mutations.application_rows_reowned+=updated.rowCount;

        if(move.json==='TRANSFER'){
          const sourcePayloadResult=await db.query(
            `SELECT vehicle_applications
               FROM public.elimfilters_catalog
              WHERE sku=$1
              FOR UPDATE`,
            [move.source]
          );
          const payload=sourcePayloadResult.rows[0]?.vehicle_applications || [];
          const evidence={
            authority:move.evidenceAuthority,
            source_url:move.evidenceUrl,
            metadata:{
              phase:'A4',
              authority_code:move.code,
              source_sku:move.source,
              target_sku:move.target
            }
          };
          if(move.targetKind==='EQUIPMENT'){
            await applyVerifiedApplications(db,{
              sku:move.target,
              equipment_applications:payload,
              evidence
            });
          }else{
            await applyVerifiedApplications(db,{
              sku:move.target,
              vehicle_applications:payload,
              evidence
            });
          }
          await applyVerifiedApplications(db,{
            sku:move.source,
            vehicle_applications:[],
            evidence:{
              ...evidence,
              metadata:{...evidence.metadata,action:'CLEAR_CONTAMINATED_SOURCE_PAYLOAD'}
            }
          });
          report.mutations.source_json_cleared+=1;
          report.mutations.target_json_populated+=1;
          report.mutations.governed_application_writes=
            (report.mutations.governed_application_writes||0)+2;
        } else if(move.json==='CLEAR_SOURCE_JUNK'){
          await applyVerifiedApplications(db,{
            sku:move.source,
            vehicle_applications:[],
            evidence:{
              authority:move.evidenceAuthority,
              source_url:move.evidenceUrl,
              metadata:{
                phase:'A4',
                action:'CLEAR_DUPLICATED_BUICK_CONTAMINATION',
                duplicate_signature:'3880cc 237 CID',
                duplicate_catalog_skus_observed:420
              }
            }
          });
          report.mutations.source_json_cleared+=1;
          report.mutations.governed_application_writes=
            (report.mutations.governed_application_writes||0)+1;
        }
      }
    }

    const blank=await db.query(
      `SELECT id
         FROM ld_catalog.ld_vehicle_applications
        WHERE elimfilters_sku='EA30901'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('C901')
          AND nullif(trim(coalesce(make,'')),'') IS NULL
          AND nullif(trim(coalesce(model_family,'')),'') IS NULL
          AND nullif(trim(coalesce(model_type,'')),'') IS NULL
          AND nullif(trim(coalesce(year,'')),'') IS NULL
          AND nullif(trim(coalesce(engine_code,'')),'') IS NULL`
    );
    if(blank.rowCount!==1) throw new Error(`C901 blank row count ${blank.rowCount} != 1`);
    report.blank_application_delete={sku:'EA30901',code:'C901',rows:blank.rowCount};

    const wrongXref=await db.query(
      `SELECT id
         FROM ld_catalog.ld_competitor_cross_references
        WHERE elimfilters_sku='EA31104'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('WA940/9')`
    );
    if(wrongXref.rowCount!==1) throw new Error(`EA31104 WA940/9 xref count ${wrongXref.rowCount} != 1`);
    const goodXref=await db.query(
      `SELECT count(*)::int AS n
         FROM ld_catalog.ld_competitor_cross_references
        WHERE elimfilters_sku='EW72096'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('WA940/9')`
    );
    report.wa9409_crossref={
      wrong_target:'EA31104',
      correct_target:'EW72096',
      current_wrong_rows:wrongXref.rowCount,
      current_correct_rows:goodXref.rows[0].n
    };

    if(EXECUTE){
      const delBlank=await db.query(
        `DELETE FROM ld_catalog.ld_vehicle_applications WHERE id=$1`,
        [blank.rows[0].id]
      );
      report.mutations.blank_application_rows_deleted+=delBlank.rowCount;

      const delX=await db.query(
        `DELETE FROM ld_catalog.ld_competitor_cross_references
          WHERE id=$1`,
        [wrongXref.rows[0].id]
      );
      report.mutations.ld_crossrefs_deleted+=delX.rowCount;

      if(goodXref.rows[0].n===0){
        const ins=await db.query(
          `INSERT INTO ld_catalog.ld_competitor_cross_references
             (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
           VALUES ('EW72096','P552096','MANN-FILTER','WA940/9')
           RETURNING id`
        );
        report.mutations.ld_crossrefs_inserted+=ins.rowCount;
      }

      const remaining=await db.query(
        `SELECT count(*)::int AS n
           FROM ld_catalog.ld_vehicle_applications v
           JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=v.elimfilters_sku
          WHERE nullif(ld_catalog.norm_part(v.source_sku),'') IS NOT NULL
            AND nullif(ld_catalog.norm_part(p.source_sku),'') IS NOT NULL
            AND ld_catalog.norm_part(v.source_sku)<>ld_catalog.norm_part(p.source_sku)
            AND v.elimfilters_sku IN ('EA30901','EA32141','EC36001','EA37125','EC32862','EL30922','EL39409')`
      );
      report.remaining_source_identity_rows=remaining.rows[0].n;

      await db.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    } else {
      await db.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  } catch(error){
    try{await db.query('ROLLBACK');}catch{}
    throw error;
  } finally {
    await db.end();
  }
}

main().catch(error=>{
  console.error(error.stack||error.message);
  process.exit(1);
});
