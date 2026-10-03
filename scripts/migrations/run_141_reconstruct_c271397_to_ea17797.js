'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA31397';
const TARGET='EA17797';
const MANN='C271397';
const DONALDSON='P117797';
const EXPECTED_ROWS=107;

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,donaldson:DONALDSON,pre:{},mutations:{product_inserted:0,parent_inserted:0,crossref_inserted:0,applications_reowned:0},post:{}};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const source=(await db.query(`
      SELECT sku,codigo_base,filter_type,duty,height_mm,outer_diameter_mm,canonical_source_status
      FROM public.elimfilters_catalog
      WHERE sku=$1
      FOR UPDATE
    `,[SOURCE])).rows[0];
    if(!source) throw new Error('SOURCE_MISSING');
    if(source.filter_type!=='air'||source.duty!=='LIGHT_DUTY') throw new Error('SOURCE_TYPE_CHANGED');
    if(Math.abs(Number(source.height_mm)-579.12)>0.5||Math.abs(Number(source.outer_diameter_mm)-266.70)>0.5) throw new Error('SOURCE_GEOMETRY_CHANGED');

    const existingTarget=await db.query(`
      SELECT sku,codigo_base,canonical_source_code
      FROM public.elimfilters_catalog
      WHERE sku=$1
         OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2)
         OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2)
    `,[TARGET,DONALDSON]);
    if(existingTarget.rowCount) throw new Error(`TARGET_OR_DONALDSON_ALREADY_EXISTS ${JSON.stringify(existingTarget.rows)}`);

    const parentConflict=await db.query(`
      SELECT elimfilters_sku,source_sku
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku=$1
         OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
    `,[TARGET,DONALDSON]);
    if(parentConflict.rowCount) throw new Error(`TARGET_PARENT_CONFLICT ${JSON.stringify(parentConflict.rows)}`);

    const rows=await db.query(`
      SELECT id
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      ORDER BY id
    `,[SOURCE,MANN]);
    if(rows.rowCount!==EXPECTED_ROWS) throw new Error(`C271397 rows ${rows.rowCount} != ${EXPECTED_ROWS}`);

    const otherSource=await db.query(`
      SELECT source_sku,count(*)::int n
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
        AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)
      GROUP BY source_sku
    `,[SOURCE,MANN]);

    const mannClaim=await db.query(`
      SELECT elimfilters_sku
      FROM ld_catalog.ld_competitor_cross_references
      WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)
    `,[MANN]);

    report.pre={
      source_rows:rows.rowCount,
      source_other_application_groups:otherSource.rowCount,
      existing_mann_claimants:mannClaim.rows.map(r=>r.elimfilters_sku),
      target_absent:true,
      donaldson_parent_absent:true
    };

    if(EXECUTE){
      const insProduct=await db.query(`
        INSERT INTO public.elimfilters_catalog(
          sku,codigo_base,filter_type,technology,height_mm,outer_diameter_mm,inner_diameter_mm,
          duty,sub_type,installation_type,canonical_source_brand,canonical_source_code,
          canonical_source_status,canonical_verified_at,duty_source_brand,duty_validation_status,
          duty_verified_at,description,catalog_active,enrichment_data
        ) VALUES(
          $1,$2,'air','MACROCORE™',579.4,263.5,153.2,
          'HEAVY_DUTY','Cellulose','Round','DONALDSON',$2,
          'VERIFIED',now(),'DONALDSON','VERIFIED',now(),
          'Engine Air Filter - Primary Round',true,
          jsonb_build_object(
            'codigo_base_governance',jsonb_build_object(
              'approved_manufacturer','DONALDSON',
              'approved_codigo_base',$2,
              'primary_manufacturer_verified',true,
              'governance_state','CANONICAL_VERIFIED',
              'evidence_note','B3.1 reconstruction: MANN C271397 cross-references Donaldson P117797; geometry aligns with source application family.'
            ),
            'dimensions_source',jsonb_build_object(
              'outer_diameter_in',10.375,
              'length_in',22.81,
              'inner_diameter_in',6.03
            )
          )
        )
        RETURNING sku
      `,[TARGET,DONALDSON]);
      if(insProduct.rowCount!==1) throw new Error('TARGET_PRODUCT_INSERT_FAILED');
      report.mutations.product_inserted=1;

      const insParent=await db.query(`
        INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at)
        VALUES($1,$2,'Air Filter',now(),now())
        RETURNING elimfilters_sku
      `,[TARGET,DONALDSON]);
      if(insParent.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
      report.mutations.parent_inserted=1;

      const xref=await db.query(`
        INSERT INTO ld_catalog.ld_competitor_cross_references(
          elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at
        ) VALUES($1,$2,'MANN-FILTER',$3,now())
        RETURNING id
      `,[TARGET,DONALDSON,MANN]);
      if(xref.rowCount!==1) throw new Error('MANN_CROSSREF_INSERT_FAILED');
      report.mutations.crossref_inserted=1;

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications
        SET elimfilters_sku=$1
        WHERE elimfilters_sku=$2
          AND id=ANY($3::bigint[])
          AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)
      `,[TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]);
      if(moved.rowCount!==EXPECTED_ROWS) throw new Error(`C271397 moved ${moved.rowCount} != ${EXPECTED_ROWS}`);
      report.mutations.applications_reowned=moved.rowCount;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1 AND codigo_base=$3 AND filter_type='air' AND duty='HEAVY_DUTY' AND canonical_source_brand='DONALDSON' AND canonical_source_status='VERIFIED') target_product,
        (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_parent,
        (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1 AND upper(regexp_replace(competitor_brand,'[^A-Z0-9]','','g'))='MANNFILTER' AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($4)) target_mann_xref,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
    `,[TARGET,SOURCE,DONALDSON,MANN]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.target_product!==1||report.post.target_parent!==1||report.post.target_mann_xref!==1||report.post.source_rows!==0||report.post.target_rows!==EXPECTED_ROWS){
        throw new Error(`POSTCHECK_FAILED ${JSON.stringify(report.post)}`);
      }
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }

    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{
    await db.end();
  }
}

if(require.main===module) main();
module.exports={SOURCE,TARGET,MANN,DONALDSON,EXPECTED_ROWS};
