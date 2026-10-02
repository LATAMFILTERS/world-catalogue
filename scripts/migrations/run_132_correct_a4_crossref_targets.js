'use strict';

const { Client } = require('pg');

const EXECUTE = process.argv.includes('--execute');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  const report={
    mode:EXECUTE?'execute':'dry-run',
    fp2141:null,
    cf6001:null,
    ea10776_parent:null,
    crossrefs:null,
    mutations:{
      fp_rows_deduped:0,
      fp_rows_reowned:0,
      cf_rows_reowned:0,
      ld_parent_rows_inserted:0,
      wrong_crossrefs_deleted:0,
      correct_crossrefs_inserted:0,
      product_role_updates:0
    }
  };

  try{
    const identities=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,is_primary,sub_type,
             canonical_source_brand,canonical_source_code,canonical_source_status
      FROM public.elimfilters_catalog
      WHERE sku IN ('EC32141','EA10776','EC30554','EA32521')
      ORDER BY sku
    `);
    const bySku=new Map(identities.rows.map(r=>[r.sku,r]));

    const ec=bySku.get('EC32141');
    if(!ec || ec.filter_type!=='cabin' || ec.duty!=='LIGHT_DUTY'){
      throw new Error(`EC32141 target identity mismatch ${JSON.stringify(ec)}`);
    }

    const hd=bySku.get('EA10776');
    if(!hd
      || norm(hd.codigo_base)!=='P130776'
      || hd.filter_type!=='air'
      || hd.duty!=='HEAVY_DUTY'
      || norm(hd.canonical_source_code)!=='P130776'
      || String(hd.canonical_source_brand||'').toUpperCase()!=='DONALDSON'
      || String(hd.canonical_source_status||'').toUpperCase()!=='VERIFIED'){
      throw new Error(`EA10776 target identity mismatch ${JSON.stringify(hd)}`);
    }

    const fpRows=await db.query(`
      SELECT id,make,model_family,model_type,year,engine_code,source_sku
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EC30554'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('FP2141')
      ORDER BY id
    `);
    if(fpRows.rowCount!==168) throw new Error(`FP2141 source rows ${fpRows.rowCount} != 168`);

    const fpCollision=await db.query(`
      SELECT
        count(*) FILTER (WHERE target_id IS NOT NULL)::int AS key_collisions,
        count(*) FILTER (
          WHERE target_id IS NOT NULL
            AND upper(coalesce(target_engine,''))=upper(coalesce(source_engine,''))
        )::int AS exact_engine_collisions
      FROM (
        SELECT s.id AS source_id,s.engine_code AS source_engine,
               t.id AS target_id,t.engine_code AS target_engine
        FROM ld_catalog.ld_vehicle_applications s
        LEFT JOIN ld_catalog.ld_vehicle_applications t
          ON t.elimfilters_sku='EC32141'
         AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
         AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
         AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
         AND coalesce(t.year,'')=coalesce(s.year,'')
        WHERE s.elimfilters_sku='EC30554'
          AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('FP2141')
      ) x
    `);
    const fpStats=fpCollision.rows[0];
    if(fpStats.key_collisions!==155 || fpStats.exact_engine_collisions!==155){
      throw new Error(`FP2141 collision contract changed ${JSON.stringify(fpStats)}`);
    }
    report.fp2141={
      source:'EC30554',
      target:'EC32141',
      source_rows:fpRows.rowCount,
      target_key_collisions:fpStats.key_collisions,
      exact_engine_collisions:fpStats.exact_engine_collisions,
      rows_to_reown:fpRows.rowCount-fpStats.key_collisions
    };

    const cfRows=await db.query(`
      SELECT id,make,model_family,model_type,year,engine_code,source_sku
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EA32521'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CF6001')
      ORDER BY id
    `);
    if(cfRows.rowCount!==106) throw new Error(`CF6001 source rows ${cfRows.rowCount} != 106`);

    const cfCollision=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications s
      WHERE s.elimfilters_sku='EA32521'
        AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('CF6001')
        AND EXISTS (
          SELECT 1
          FROM ld_catalog.ld_vehicle_applications t
          WHERE t.elimfilters_sku='EA10776'
            AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
            AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
            AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
            AND coalesce(t.year,'')=coalesce(s.year,'')
        )
    `);
    if(cfCollision.rows[0].n!==0) throw new Error(`CF6001 target collision count ${cfCollision.rows[0].n} != 0`);
    report.cf6001={
      source:'EA32521',
      target:'EA10776',
      source_rows:cfRows.rowCount,
      target_key_collisions:0
    };

    const parent=await db.query(`
      SELECT elimfilters_sku,source_sku,segment
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku='EA10776'
    `);
    const duplicateParent=await db.query(`
      SELECT elimfilters_sku,source_sku
      FROM ld_catalog.ld_product_catalog
      WHERE ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('P130776')
        AND elimfilters_sku<>'EA10776'
    `);
    if(duplicateParent.rowCount){
      throw new Error(`P130776 parent already owned ${JSON.stringify(duplicateParent.rows)}`);
    }
    if(parent.rowCount && norm(parent.rows[0].source_sku)!=='P130776'){
      throw new Error(`EA10776 parent mismatch ${JSON.stringify(parent.rows)}`);
    }
    report.ea10776_parent={
      existing:parent.rows,
      planned_insert:parent.rowCount===0
    };

    const wrong=await db.query(`
      SELECT id,elimfilters_sku,source_sku,competitor_brand,competitor_part_number
      FROM ld_catalog.ld_competitor_cross_references
      WHERE
        (elimfilters_sku='EC30554'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('FP2141'))
        OR
        (elimfilters_sku='EA32521'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('CF6001'))
      ORDER BY id
    `);
    if(wrong.rowCount!==2) throw new Error(`wrong A4 crossref rows ${wrong.rowCount} != 2`);

    const good=await db.query(`
      SELECT elimfilters_sku,competitor_part_number
      FROM ld_catalog.ld_competitor_cross_references
      WHERE
        (elimfilters_sku='EC32141'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('FP2141'))
        OR
        (elimfilters_sku='EA10776'
          AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('CF6001'))
    `);
    report.crossrefs={
      wrong_rows:wrong.rows,
      correct_existing:good.rows
    };

    if(EXECUTE){
      if(parent.rowCount===0){
        const insParent=await db.query(`
          INSERT INTO ld_catalog.ld_product_catalog
            (elimfilters_sku,source_sku,segment)
          VALUES ('EA10776','P130776','Air Filter')
          ON CONFLICT (elimfilters_sku) DO NOTHING
          RETURNING elimfilters_sku
        `);
        if(insParent.rowCount!==1) throw new Error('EA10776 parent insert failed');
        report.mutations.ld_parent_rows_inserted+=insParent.rowCount;
      }

      const fpDedup=await db.query(`
        DELETE FROM ld_catalog.ld_vehicle_applications s
        WHERE s.elimfilters_sku='EC30554'
          AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('FP2141')
          AND EXISTS (
            SELECT 1
            FROM ld_catalog.ld_vehicle_applications t
            WHERE t.elimfilters_sku='EC32141'
              AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
              AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
              AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
              AND coalesce(t.year,'')=coalesce(s.year,'')
              AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
          )
      `);
      if(fpDedup.rowCount!==155) throw new Error(`FP2141 dedupe ${fpDedup.rowCount} != 155`);
      report.mutations.fp_rows_deduped+=fpDedup.rowCount;

      const fpMove=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EC32141'
        WHERE elimfilters_sku='EC30554'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('FP2141')
      `);
      if(fpMove.rowCount!==13) throw new Error(`FP2141 reown ${fpMove.rowCount} != 13`);
      report.mutations.fp_rows_reowned+=fpMove.rowCount;

      const cfMove=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EA10776'
        WHERE elimfilters_sku='EA32521'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CF6001')
      `);
      if(cfMove.rowCount!==106) throw new Error(`CF6001 reown ${cfMove.rowCount} != 106`);
      report.mutations.cf_rows_reowned+=cfMove.rowCount;

      const delWrong=await db.query(`
        DELETE FROM ld_catalog.ld_competitor_cross_references
        WHERE id=ANY($1::int[])
      `,[wrong.rows.map(r=>r.id)]);
      if(delWrong.rowCount!==2) throw new Error(`wrong crossref delete ${delWrong.rowCount} != 2`);
      report.mutations.wrong_crossrefs_deleted+=delWrong.rowCount;

      if(!good.rows.some(r=>r.elimfilters_sku==='EC32141')){
        const ins=await db.query(`
          INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
          VALUES ('EC32141','CU2141','MANN-FILTER','FP2141')
          RETURNING id
        `);
        report.mutations.correct_crossrefs_inserted+=ins.rowCount;
      }
      if(!good.rows.some(r=>r.elimfilters_sku==='EA10776')){
        const ins=await db.query(`
          INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
          VALUES ('EA10776','P130776','MANN-FILTER','CF600/1')
          RETURNING id
        `);
        report.mutations.correct_crossrefs_inserted+=ins.rowCount;
      }

      const role=await db.query(`
        UPDATE public.elimfilters_catalog
        SET is_primary=false,
            sub_type='Safety Air Filter',
            canonical_evidence=coalesce(canonical_evidence,'{}'::jsonb)
              || jsonb_build_object(
                'service_role','SAFETY_SECONDARY',
                'service_role_authority','DONALDSON',
                'service_role_source_code','P130776',
                'service_role_related_mann','CF600/1'
              )
        WHERE sku='EA10776'
          AND codigo_base='P130776'
          AND filter_type='air'
          AND duty='HEAVY_DUTY'
        RETURNING sku
      `);
      if(role.rowCount!==1) throw new Error('EA10776 role update failed');
      report.mutations.product_role_updates+=role.rowCount;

      const verify=await db.query(`
        SELECT
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EC30554'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('FP2141')) AS fp_wrong,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EC32141'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('FP2141')) AS fp_correct,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EA32521'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CF6001')) AS cf_wrong,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
            WHERE elimfilters_sku='EA10776'
              AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('CF6001')) AS cf_correct
      `);
      report.post_verify=verify.rows[0];
      if(report.post_verify.fp_wrong!==0
        || report.post_verify.fp_correct!==13
        || report.post_verify.cf_wrong!==0
        || report.post_verify.cf_correct!==106){
        throw new Error(`post-verify mismatch ${JSON.stringify(report.post_verify)}`);
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

main().catch(error=>{
  console.error(error.stack||error.message);
  process.exit(1);
});
