'use strict';

const { Client } = require('pg');
const EXECUTE = process.argv.includes('--execute');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
  try{
    const target=await db.query(`
      SELECT sku,codigo_base,filter_type,duty,catalog_active
      FROM public.elimfilters_catalog
      WHERE sku='EL80965'
      FOR UPDATE
    `);
    if(target.rowCount!==1) throw new Error('EL80965 missing');
    const t=target.rows[0];
    if(t.codigo_base!=='P550965'||t.filter_type!=='oil'||t.duty!=='HEAVY_DUTY'||!t.catalog_active){
      throw new Error('EL80965 identity mismatch');
    }

    const rows=await db.query(`
      SELECT id
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku='EL32015'
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('W920/15')
      ORDER BY id
      FOR UPDATE
    `);
    if(rows.rowCount!==7) throw new Error(`W920/15 row count ${rows.rowCount} != 7`);

    const collisions=await db.query(`
      SELECT count(*)::int AS n
      FROM ld_catalog.ld_vehicle_applications s
      WHERE s.elimfilters_sku='EL32015'
        AND ld_catalog.norm_part(s.source_sku)=ld_catalog.norm_part('W920/15')
        AND EXISTS (
          SELECT 1 FROM ld_catalog.ld_vehicle_applications x
          WHERE x.elimfilters_sku='EL80965'
            AND upper(coalesce(x.make,''))=upper(coalesce(s.make,''))
            AND upper(coalesce(x.model_family,''))=upper(coalesce(s.model_family,''))
            AND upper(coalesce(x.model_type,''))=upper(coalesce(s.model_type,''))
            AND coalesce(x.year,'')=coalesce(s.year,'')
            AND upper(coalesce(x.engine_code,''))=upper(coalesce(s.engine_code,''))
        )
    `);
    if(collisions.rows[0].n!==0) throw new Error(`target collisions ${collisions.rows[0].n}`);

    const parent=await db.query(`
      SELECT elimfilters_sku,source_sku
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku='EL80965'
         OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('P550965')
    `);
    const parentConflict=parent.rows.find(r=>r.elimfilters_sku!=='EL80965'||r.source_sku!=='P550965');
    if(parentConflict) throw new Error(`P550965 parent conflict ${JSON.stringify(parentConflict)}`);

    const cross=await db.query(`
      SELECT id,elimfilters_sku
      FROM ld_catalog.ld_competitor_cross_references
      WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part('W920/15')
    `);
    const crossConflict=cross.rows.find(r=>r.elimfilters_sku!=='EL80965');
    if(crossConflict) throw new Error(`W920/15 crossref conflict ${JSON.stringify(crossConflict)}`);

    const report={
      mode:EXECUTE?'execute':'dry-run',
      source:'EL32015',target:'EL80965',authority_code:'W920/15',
      canonical_target:'P550965',
      application_rows:rows.rowCount,
      exact_collisions:collisions.rows[0].n,
      public_payload_mutations:0,
      mutations:{parent_inserted:0,crossref_inserted:0,application_rows_reowned:0}
    };

    if(EXECUTE){
      if(!parent.rows.some(r=>r.elimfilters_sku==='EL80965'&&r.source_sku==='P550965')){
        const p=await db.query(`
          INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment)
          VALUES ('EL80965','P550965','Oil Filter')
          ON CONFLICT (elimfilters_sku) DO NOTHING
          RETURNING elimfilters_sku
        `);
        if(p.rowCount!==1) throw new Error('parent insert failed');
        report.mutations.parent_inserted=1;
      }
      if(!cross.rows.some(r=>r.elimfilters_sku==='EL80965')){
        const x=await db.query(`
          INSERT INTO ld_catalog.ld_competitor_cross_references
            (elimfilters_sku,source_sku,competitor_brand,competitor_part_number)
          VALUES ('EL80965','P550965','MANN-FILTER','W920/15')
          RETURNING id
        `);
        if(x.rowCount!==1) throw new Error('crossref insert failed');
        report.mutations.crossref_inserted=1;
      }
      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku='EL80965'
        WHERE id=ANY($1::int[])
          AND elimfilters_sku='EL32015'
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('W920/15')
      `,[rows.rows.map(r=>r.id)]);
      if(moved.rowCount!==7) throw new Error(`moved ${moved.rowCount} != 7`);
      report.mutations.application_rows_reowned=7;

      const post=await db.query(`
        SELECT
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
           WHERE elimfilters_sku='EL32015'
             AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('W920/15')) AS source_remaining,
          (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications
           WHERE elimfilters_sku='EL80965'
             AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('W920/15')) AS target_rows
      `);
      report.post=post.rows[0];
      if(report.post.source_remaining!==0||report.post.target_rows!==7) throw new Error('postcheck failed');

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
main().catch(e=>{console.error(e.stack||e.message);process.exit(1)});
