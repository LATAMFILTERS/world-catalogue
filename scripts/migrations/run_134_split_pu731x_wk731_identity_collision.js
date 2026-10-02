'use strict';

const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const EXECUTE = process.argv.includes('--execute');
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

function governedVehiclePayload(rows=[]){
  return rows.map(row=>({
    make:row.make||'',
    model_family:row.model_family||'',
    model_type:row.model_type||'',
    model:[row.model_family,row.model_type].filter(Boolean).join(' '),
    year:row.year||'',
    year_range:row.year||'',
    engine:row.engine_code||'',
    engine_code:row.engine_code||'',
    ccm:row.ccm==null?'':String(row.ccm),
    kw:row.kw==null?'':String(row.kw),
    hp:row.hp==null?'':String(row.hp)
  }));
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const report={
    mode:EXECUTE?'execute':'dry-run',
    identities:{},
    source_rows:{},
    overlap:{},
    planned:{},
    mutations:{
      p553004_parent_inserted:0,
      wk731_rows_moved:0,
      wk8226_duplicate_rows_deleted:0,
      wk8226_unique_rows_reowned:0,
      wk8226_source_labels_corrected:0,
      pu731x_public_application_write:0,
      invalid_placeholder_public_application_clear:0,
      products_updated:0,
      crossrefs_inserted:0
    }
  };

  try{
    const products=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,catalog_active,
             height_mm,outer_diameter_mm,inner_diameter_mm,thread_size,
             canonical_source_brand,canonical_source_code,canonical_source_status,
             vehicle_applications,equipment_applications,enrichment_data
      FROM public.elimfilters_catalog
      WHERE sku IN ('EF30731','EF38226','EF9553004')
      ORDER BY sku
      FOR UPDATE
    `);
    if(products.rowCount!==3) throw new Error('B2 product identity rows missing');
    const bySku=new Map(products.rows.map(r=>[r.sku,r]));
    const pu=bySku.get('EF30731');
    const bad=bySku.get('EF38226');
    const don=bySku.get('EF9553004');

    if(pu.filter_type!=='fuel'||pu.duty!=='LIGHT_DUTY') throw new Error('EF30731 family mismatch');
    if(bad.filter_type!=='fuel'||bad.duty!=='LIGHT_DUTY') throw new Error('EF38226 family mismatch');
    if(norm(don.codigo_base)!=='P553004'
      ||don.filter_type!=='fuel'||don.duty!=='HEAVY_DUTY'
      ||String(don.canonical_source_brand||'').toUpperCase()!=='DONALDSON'
      ||norm(don.canonical_source_code)!=='P553004'
      ||String(don.canonical_source_status||'').toUpperCase()!=='VERIFIED'){
      throw new Error(`EF9553004 identity mismatch ${JSON.stringify(don)}`);
    }
    report.identities={
      EF30731:{codigo_base:pu.codigo_base,parent_expected:'PU731X'},
      EF38226:{codigo_base:bad.codigo_base,parent_expected:'WK8226',catalog_active:bad.catalog_active},
      EF9553004:{codigo_base:don.codigo_base,authority:'DONALDSON'}
    };

    const parents=await db.query(`
      SELECT elimfilters_sku,source_sku,segment
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku IN ('EF30731','EF38226','EF9553004')
      ORDER BY elimfilters_sku
    `);
    const parentBySku=new Map(parents.rows.map(r=>[r.elimfilters_sku,r]));
    if(norm(parentBySku.get('EF30731')?.source_sku)!=='PU731X') throw new Error('EF30731 parent contract changed');
    if(norm(parentBySku.get('EF38226')?.source_sku)!=='WK8226') throw new Error('EF38226 parent contract changed');
    if(parentBySku.has('EF9553004') && norm(parentBySku.get('EF9553004').source_sku)!=='P553004'){
      throw new Error('EF9553004 parent mismatch');
    }
    const duplicateP553004=await db.query(`
      SELECT elimfilters_sku,source_sku
      FROM ld_catalog.ld_product_catalog
      WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('P553004')
        AND elimfilters_sku<>'EF9553004'
    `);
    if(duplicateP553004.rowCount) throw new Error(`P553004 parent already owned ${JSON.stringify(duplicateP553004.rows)}`);

    const wk731=await db.query(`
      SELECT id,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EF30731'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK731')
      ORDER BY id
    `);
    const pu731=await db.query(`
      SELECT id,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EF30731'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('PU731X')
      ORDER BY id
    `);
    const wk8226=await db.query(`
      SELECT id,source_sku,make,model_family,model_type,year,engine_code,ccm,kw,hp,source_origin
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EF38226'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK8226')
      ORDER BY id
    `);
    if(wk731.rowCount!==1493) throw new Error(`WK731 rows ${wk731.rowCount} != 1493`);
    if(pu731.rowCount!==58) throw new Error(`PU731X rows ${pu731.rowCount} != 58`);
    if(wk8226.rowCount!==1877) throw new Error(`WK8226 rows ${wk8226.rowCount} != 1877`);
    report.source_rows={WK731:wk731.rowCount,PU731X:pu731.rowCount,WK8226:wk8226.rowCount};

    const overlap=await db.query(`
      SELECT
        count(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM ld_catalog.ld_vehicle_applications b
          WHERE b.elimfilters_sku='EF38226'
            AND ld_catalog.norm_part(b.source_sku)=ld_catalog.norm_part('WK8226')
            AND upper(coalesce(b.make,''))=upper(coalesce(a.make,''))
            AND upper(coalesce(b.model_family,''))=upper(coalesce(a.model_family,''))
            AND upper(coalesce(b.model_type,''))=upper(coalesce(a.model_type,''))
            AND coalesce(b.year,'')=coalesce(a.year,'')
            AND upper(coalesce(b.engine_code,''))=upper(coalesce(a.engine_code,''))
        ))::int AS exact_overlap
      FROM ld_catalog.ld_vehicle_applications a
      WHERE a.elimfilters_sku='EF30731'
        AND ld_catalog.norm_part(a.source_sku)=ld_catalog.norm_part('WK731')
    `);
    if(overlap.rows[0].exact_overlap!==1451) throw new Error(`WK731/WK8226 DB overlap ${overlap.rows[0].exact_overlap} != 1451`);
    report.overlap={wk731_vs_wk8226_exact:1451};

    const targetExisting=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EF9553004'
    `);
    if(targetExisting.rows[0].n!==0) throw new Error(`EF9553004 relational rows changed: ${targetExisting.rows[0].n}`);

    report.planned={
      ef9553004_parent_insert:!parentBySku.has('EF9553004'),
      ef30731_retain_pu731x_rows:58,
      ef30731_move_wk731_rows:1493,
      ef38226_dedupe_against_wk731:1451,
      ef38226_reown_unique_rows:426,
      ef38226_catalog_active:false,
      ef30731_identity:'PU731X',
      ef9553004_alias:'WK731'
    };

    if(EXECUTE){
      if(!parentBySku.has('EF9553004')){
        const parent=await db.query(`
          INSERT INTO ld_catalog.ld_product_catalog
            (elimfilters_sku,source_sku,segment)
          VALUES ('EF9553004','P553004','Fuel Filter')
          ON CONFLICT (elimfilters_sku) DO NOTHING
          RETURNING elimfilters_sku
        `);
        if(parent.rowCount!==1) throw new Error('EF9553004 parent insert failed');
        report.mutations.p553004_parent_inserted+=parent.rowCount;
      }

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EF9553004'
        WHERE elimfilters_sku='EF30731'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK731')
      `);
      if(moved.rowCount!==1493) throw new Error(`WK731 moved ${moved.rowCount} != 1493`);
      report.mutations.wk731_rows_moved+=moved.rowCount;

      const dedup=await db.query(`
        DELETE FROM ld_catalog.ld_vehicle_applications s
        WHERE s.elimfilters_sku='EF38226'
          AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('WK8226')
          AND EXISTS (
            SELECT 1 FROM ld_catalog.ld_vehicle_applications t
            WHERE t.elimfilters_sku='EF9553004'
              AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
              AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
              AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
              AND coalesce(t.year,'')=coalesce(s.year,'')
              AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
          )
      `);
      if(dedup.rowCount!==1451) throw new Error(`WK8226 dedupe ${dedup.rowCount} != 1451`);
      report.mutations.wk8226_duplicate_rows_deleted+=dedup.rowCount;

      const unique=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EF9553004',
            source_sku='WK731',
            source_origin='run_134_correct_wk8226_mislabel_to_wk731'
        WHERE elimfilters_sku='EF38226'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK8226')
      `);
      if(unique.rowCount!==426) throw new Error(`WK8226 unique reown ${unique.rowCount} != 426`);
      report.mutations.wk8226_unique_rows_reowned+=unique.rowCount;
      report.mutations.wk8226_source_labels_corrected+=unique.rowCount;

      const puPayload=governedVehiclePayload(pu731.rows);
      await applyVerifiedApplications(db,{
        sku:'EF30731',
        vehicle_applications:puPayload,
        evidence:{
          authority:'MANN-FILTER',
          source_url:'https://www.mann-filter.com/en/catalog/search-results/product.html/pu731x_mann-filter.html',
          metadata:{
            phase:'B2',
            source_code:'PU731X',
            action:'RESTORE_SEPARATE_PRODUCT_IDENTITY',
            historical_source_sku:'EF50731'
          }
        }
      });
      report.mutations.pu731x_public_application_write+=1;

      await applyVerifiedApplications(db,{
        sku:'EF38226',
        vehicle_applications:[],
        evidence:{
          authority:'ELIMFILTERS_B2_MASTER_RECONCILIATION_AUDIT',
          metadata:{
            phase:'B2',
            action:'CLEAR_INVALID_WK8226_PLACEHOLDER_APPLICATIONS',
            master_overlap_with_wk731_pct:98.27,
            db_exact_overlap_rows:1451
          }
        }
      });
      report.mutations.invalid_placeholder_public_application_clear+=1;

      const puUpdate=await db.query(`
        UPDATE public.elimfilters_catalog
        SET height_mm=93,
            outer_diameter_mm=65,
            inner_diameter_mm=19,
            thread_size=NULL,
            canonical_source_brand='MANN-FILTER',
            canonical_source_code='PU731X',
            canonical_source_status='VERIFIED',
            enrichment_data=coalesce(enrichment_data,'{}'::jsonb)
              || jsonb_build_object(
                'identity_repair',jsonb_build_object(
                  'phase','B2',
                  'authority','MANN-FILTER',
                  'source_code','PU731X',
                  'historical_source_sku','EF50731',
                  'separated_from','WK731'
                )
              )
        WHERE sku='EF30731'
        RETURNING sku
      `);
      if(puUpdate.rowCount!==1) throw new Error('EF30731 identity update failed');
      report.mutations.products_updated+=puUpdate.rowCount;

      const badUpdate=await db.query(`
        UPDATE public.elimfilters_catalog
        SET catalog_active=false,
            enrichment_data=coalesce(enrichment_data,'{}'::jsonb)
              || jsonb_build_object(
                'identity_repair',jsonb_build_object(
                  'phase','B2',
                  'disposition','INACTIVE_INVALID_PLACEHOLDER',
                  'invalid_source_code','WK8226',
                  'corrected_owner','EF9553004',
                  'corrected_reference','WK731'
                )
              )
        WHERE sku='EF38226'
        RETURNING sku
      `);
      if(badUpdate.rowCount!==1) throw new Error('EF38226 deactivate failed');
      report.mutations.products_updated+=badUpdate.rowCount;

      const existingAlias=await db.query(`
        SELECT count(*)::int AS n
        FROM ld_catalog.ld_competitor_cross_references
        WHERE elimfilters_sku='EF9553004'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('WK731')
      `);
      if(existingAlias.rows[0].n===0){
        const alias=await db.query(`
          INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
          VALUES ('EF9553004','P553004','MANN-FILTER','WK731')
          RETURNING id
        `);
        report.mutations.crossrefs_inserted+=alias.rowCount;
      }

      const verify=await db.query(`
        SELECT
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EF30731'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('PU731X')) AS pu_rows,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EF30731'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK731')) AS pu_wrong_wk_rows,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EF38226') AS placeholder_rows,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EF9553004'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WK731')) AS canonical_wk731_rows,
          (SELECT catalog_active FROM public.elimfilters_catalog WHERE sku='EF38226') AS placeholder_active
      `);
      report.post_verify=verify.rows[0];
      if(report.post_verify.pu_rows!==58
        ||report.post_verify.pu_wrong_wk_rows!==0
        ||report.post_verify.placeholder_rows!==0
        ||report.post_verify.canonical_wk731_rows!==1919
        ||report.post_verify.placeholder_active!==false){
        throw new Error(`B2 post verify failed ${JSON.stringify(report.post_verify)}`);
      }

      await db.query('COMMIT');
      console.log(JSON.stringify(report,null,2));
      console.log('COMMIT');
    }else{
      await db.query('ROLLBACK');
      console.log(JSON.stringify(report,null,2));
      console.log('ROLLBACK (dry-run)');
    }
  }catch(error){
    try{await db.query('ROLLBACK');}catch{}
    throw error;
  }finally{
    await db.end();
  }
}

main().catch(error=>{console.error(error.stack||error.message);process.exit(1);});
