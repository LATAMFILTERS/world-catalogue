'use strict';

const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const EXECUTE = process.argv.includes('--execute');
const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g,'');
const appKey = (e={}) => [
  norm(e.make),
  norm(e.model || e.model_type || e.model_family),
  norm(e.engine || e.engine_code || e.engine_model),
  String(e.year || e.year_range || '')
].join('|');

function governancePayload(payload=[]){
  return (Array.isArray(payload)?payload:[]).map(e=>({
    ...e,
    model:e.model || e.model_type || e.model_family || e.equipment || e.vehicle || '',
    engine:e.engine || e.engine_code || e.engine_model || '',
    year:e.year || e.year_range || ''
  }));
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try{
    const product=await db.query(`
      SELECT sku,codigo_base,canonical_source_code,filter_type,duty,catalog_active,
             vehicle_applications,equipment_applications
      FROM public.elimfilters_catalog
      WHERE sku IN ('EL32001','EL80949')
      ORDER BY sku
      FOR UPDATE
    `);
    const bySku=new Map(product.rows.map(r=>[r.sku,r]));
    const src=bySku.get('EL32001');
    const tgt=bySku.get('EL80949');
    if(!src||!tgt) throw new Error('EL32001/EL80949 catalog rows missing');
    if(norm(tgt.codigo_base)!=='P550949'||tgt.filter_type!=='oil'||tgt.duty!=='HEAVY_DUTY'||!tgt.catalog_active){
      throw new Error('EL80949 identity mismatch');
    }

    const rows=await db.query(`
      SELECT id
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EL32001'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WP12001')
      ORDER BY id
      FOR UPDATE
    `);
    if(rows.rowCount!==56) throw new Error(`WP12001 row count ${rows.rowCount} != 56`);

    const otherSourceRows=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EL32001'
        AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part('WP12001')
    `);
    if(otherSourceRows.rows[0].n!==0) throw new Error('EL32001 has non-WP12001 relational applications');

    const collisions=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications s
      WHERE s.elimfilters_sku='EL32001'
        AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('WP12001')
        AND EXISTS (
          SELECT 1 FROM ld_catalog.ld_vehicle_applications t
          WHERE t.elimfilters_sku='EL80949'
            AND upper(coalesce(t.make,''))=upper(coalesce(s.make,''))
            AND upper(coalesce(t.model_family,''))=upper(coalesce(s.model_family,''))
            AND upper(coalesce(t.model_type,''))=upper(coalesce(s.model_type,''))
            AND coalesce(t.year,'')=coalesce(s.year,'')
            AND upper(coalesce(t.engine_code,''))=upper(coalesce(s.engine_code,''))
        )
    `);
    if(collisions.rows[0].n!==0) throw new Error(`target collisions ${collisions.rows[0].n}`);

    const sourcePayload=governancePayload(src.vehicle_applications||[]);
    const targetPayload=governancePayload(tgt.equipment_applications||[]);
    if(sourcePayload.length!==338) throw new Error(`source public payload ${sourcePayload.length} != 338`);
    if(targetPayload.length!==405) throw new Error(`target equipment payload ${targetPayload.length} != 405`);

    const targetKeys=new Set(targetPayload.map(appKey));
    const overlap=sourcePayload.filter(e=>targetKeys.has(appKey(e))).length;
    if(overlap!==0) throw new Error(`public payload overlap ${overlap}`);

    const existingParent=await db.query(`
      SELECT elimfilters_sku,source_sku
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku='EL80949'
         OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('P550949')
      ORDER BY elimfilters_sku
    `);
    const wrongParent=existingParent.rows.find(r=>r.elimfilters_sku!=='EL80949'||norm(r.source_sku)!=='P550949');
    if(wrongParent) throw new Error(`P550949 parent conflict ${JSON.stringify(wrongParent)}`);

    const existingCross=await db.query(`
      SELECT id,elimfilters_sku,competitor_brand,competitor_part_number
      FROM ld_catalog.ld_competitor_cross_references
      WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('WP12001')
    `);
    const wrongCross=existingCross.rows.find(r=>r.elimfilters_sku!=='EL80949');
    if(wrongCross) throw new Error(`WP12001 crossref conflict ${JSON.stringify(wrongCross)}`);

    const report={
      mode:EXECUTE?'execute':'dry-run',
      source:'EL32001',
      target:'EL80949',
      authority_code:'WP12001',
      canonical_target:'P550949',
      application_rows:rows.rowCount,
      exact_collisions:collisions.rows[0].n,
      source_public_applications:sourcePayload.length,
      target_existing_equipment_applications:targetPayload.length,
      public_overlap:overlap,
      merged_equipment_applications:targetPayload.length+sourcePayload.length,
      parent_exists:existingParent.rows.some(r=>r.elimfilters_sku==='EL80949'&&norm(r.source_sku)==='P550949'),
      crossref_exists:existingCross.rows.some(r=>r.elimfilters_sku==='EL80949'),
      mutations:{parent_inserted:0,crossref_inserted:0,application_rows_reowned:0,governed_public_writes:0}
    };

    if(EXECUTE){
      if(!report.parent_exists){
        const p=await db.query(`
          INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment)
          VALUES ('EL80949','P550949','Oil Filter')
          ON CONFLICT (elimfilters_sku) DO NOTHING
          RETURNING elimfilters_sku
        `);
        if(p.rowCount!==1) throw new Error('EL80949 parent insert failed');
        report.mutations.parent_inserted=1;
      }

      if(!report.crossref_exists){
        const x=await db.query(`
          INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
          VALUES ('EL80949','P550949','MANN-FILTER','WP12001')
          RETURNING id
        `);
        if(x.rowCount!==1) throw new Error('WP12001 crossref insert failed');
        report.mutations.crossref_inserted=1;
      }

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EL80949'
        WHERE id=ANY($1::int[])
          AND elimfilters_sku='EL32001'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WP12001')
      `,[rows.rows.map(r=>r.id)]);
      if(moved.rowCount!==56) throw new Error(`moved ${moved.rowCount} != 56`);
      report.mutations.application_rows_reowned=moved.rowCount;

      const evidence={
        authority:'MANN-FILTER + DONALDSON',
        source_url:'https://spareto.com/products/mann-filter-oil-filter/wp-12-001',
        metadata:{
          phase:'B.3.1',
          authority_code:'WP12001',
          cummins_oe:'2882673',
          donaldson:'P550949',
          source_sku:'EL32001',
          target_sku:'EL80949'
        }
      };

      await applyVerifiedApplications(db,{
        sku:'EL80949',
        equipment_applications:[...targetPayload,...sourcePayload],
        evidence
      });
      await applyVerifiedApplications(db,{
        sku:'EL32001',
        vehicle_applications:[],
        evidence:{
          ...evidence,
          metadata:{...evidence.metadata,action:'CLEAR_MISASSIGNED_WP12001_PUBLIC_PAYLOAD'}
        }
      });
      report.mutations.governed_public_writes=2;

      const post=await db.query(`
        SELECT
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
           WHERE elimfilters_sku='EL32001'
             AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WP12001')) AS source_remaining,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
           WHERE elimfilters_sku='EL80949'
             AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('WP12001')) AS target_rows
      `);
      report.post=post.rows[0];
      if(report.post.source_remaining!==0||report.post.target_rows!==56){
        throw new Error(`postcheck failed ${JSON.stringify(report.post)}`);
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
    try{await db.query('ROLLBACK')}catch{}
    throw error;
  }finally{
    await db.end();
  }
}

main().catch(error=>{console.error(error.stack||error.message);process.exit(1)});
