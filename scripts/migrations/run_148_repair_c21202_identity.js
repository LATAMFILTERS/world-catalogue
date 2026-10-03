'use strict';
const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const SKU='EA31202';
const MANN='C2120/2';
const OLD_PARENT='C15120/2';
const EXPECTED_APPS=35;
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',sku:SKU,mann:MANN,pre:{},mutations:{public_identity_updated:0,parent_updated:0,canonical_identity_inserted:0},post:{}};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const row=(await db.query(`
      SELECT sku,codigo_base,filter_type,duty,height_mm,outer_diameter_mm,
             canonical_source_brand,canonical_source_code,canonical_source_status,
             enrichment_data
      FROM public.elimfilters_catalog
      WHERE sku=$1
      FOR UPDATE
    `,[SKU])).rows[0];
    if(!row) throw new Error('SKU_MISSING');
    if(row.filter_type!=='air'||row.duty!=='LIGHT_DUTY'||norm(row.codigo_base)!=='1202') throw new Error('PUBLIC_BASELINE_CHANGED');
    if(Math.abs(Number(row.height_mm)-50)>0.5||Math.abs(Number(row.outer_diameter_mm)-203)>0.5) throw new Error('MANN_GEOMETRY_CHANGED');

    const parent=(await db.query(`
      SELECT elimfilters_sku,source_sku,segment
      FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku=$1
      FOR UPDATE
    `,[SKU])).rows;
    if(parent.length!==1||norm(parent[0].source_sku)!==norm(OLD_PARENT)) throw new Error(`PARENT_BASELINE_CHANGED ${JSON.stringify(parent)}`);

    const apps=await db.query(`
      SELECT id
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
        AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      ORDER BY id
    `,[SKU,MANN]);
    if(apps.rowCount!==EXPECTED_APPS) throw new Error(`C2120/2 apps ${apps.rowCount} != ${EXPECTED_APPS}`);

    const otherApps=await db.query(`
      SELECT source_sku,count(*)::int n
      FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1
        AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)
      GROUP BY source_sku
    `,[SKU,MANN]);
    if(otherApps.rowCount!==0) throw new Error(`UNEXPECTED_OTHER_APPLICATIONS ${JSON.stringify(otherApps.rows)}`);

    const conflicts=await db.query(`
      SELECT 'public' layer,sku id
      FROM public.elimfilters_catalog
      WHERE sku<>$1 AND (ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2))
      UNION ALL
      SELECT 'parent',elimfilters_sku FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku<>$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      UNION ALL
      SELECT 'identity',elimfilters_sku FROM ld_catalog.ld_canonical_product_identity
      WHERE elimfilters_sku<>$1 AND status='ACTIVE' AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($2)
    `,[SKU,MANN]);
    if(conflicts.rowCount!==0) throw new Error(`C21202_CONFLICTS ${JSON.stringify(conflicts.rows)}`);

    const existingIdentity=await db.query(`
      SELECT * FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1
    `,[SKU]);
    if(existingIdentity.rowCount!==0) throw new Error('SKU_ALREADY_HAS_CANONICAL_IDENTITY');

    report.pre={
      applications:apps.rowCount,
      old_parent:parent[0].source_sku,
      geometry:{height_mm:Number(row.height_mm),outer_diameter_mm:Number(row.outer_diameter_mm)},
      conflicts:conflicts.rowCount,
      existing_identity:existingIdentity.rowCount
    };

    if(EXECUTE){
      const updated=await db.query(`
        UPDATE public.elimfilters_catalog
        SET codigo_base=$2::text,
            canonical_source_brand='MANN-FILTER',
            canonical_source_code=$2::text,
            canonical_source_status='VERIFIED',
            canonical_verified_at=now(),
            duty_source_brand='MANN-FILTER',
            duty_validation_status='VERIFIED',
            duty_verified_at=now(),
            enrichment_data=jsonb_set(
              coalesce(enrichment_data,'{}'::jsonb),
              '{codigo_base_governance}',
              coalesce(enrichment_data->'codigo_base_governance','{}'::jsonb)
                || jsonb_build_object(
                  'origin_group','EUROPEAN',
                  'approved_manufacturer','MANN-FILTER',
                  'approved_codigo_base',$2::text,
                  'approved_source_column','CANONICAL_POLICY',
                  'primary_manufacturer_verified',true,
                  'governance_state','CANONICAL_VERIFIED',
                  'state','CANONICAL_VERIFIED',
                  'current_codigo_base',$2::text,
                  'required_authority','MANN_FILTER_REGIONAL_CANONICAL',
                  'policy_version','2026-08-29-v3.2-regional',
                  'evidence_note','run_148: LD SKU rule 21202 -> 1202; MANN C2120/2 geometry 203 x 50 mm matches EA31202 and 35 source applications.'
                ),
              true
            )
        WHERE sku=$1
        RETURNING sku
      `,[SKU,MANN]);
      if(updated.rowCount!==1) throw new Error('PUBLIC_IDENTITY_UPDATE_FAILED');
      report.mutations.public_identity_updated=1;

      const parentUpdate=await db.query(`
        UPDATE ld_catalog.ld_product_catalog
        SET source_sku=$2::text,updated_at=now()
        WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)
        RETURNING elimfilters_sku
      `,[SKU,MANN,OLD_PARENT]);
      if(parentUpdate.rowCount!==1) throw new Error('PARENT_UPDATE_FAILED');
      report.mutations.parent_updated=1;

      const identity=await db.query(`
        INSERT INTO ld_catalog.ld_canonical_product_identity(
          elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at
        ) VALUES($1::text,'EUROPEAN','MANN-FILTER',$2::text,'air','ACTIVE','MIGRATION_148_C21202_IDENTITY_REPAIR',now(),now())
        RETURNING elimfilters_sku
      `,[SKU,MANN]);
      if(identity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
      report.mutations.canonical_identity_inserted=1;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1 AND ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) AND canonical_source_brand='MANN-FILTER' AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2) AND canonical_source_status='VERIFIED') public_ok,
        (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) parent_ok,
        (SELECT count(*)::int FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=$1 AND origin_group='EUROPEAN' AND canonical_brand='MANN-FILTER' AND ld_catalog.norm_part(canonical_part_number)=ld_catalog.norm_part($2) AND status='ACTIVE') identity_ok,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)) app_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
    `,[SKU,MANN]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.public_ok!==1||report.post.parent_ok!==1||report.post.identity_ok!==1||report.post.app_rows!==EXPECTED_APPS) throw new Error(`POSTCHECK_FAILED ${JSON.stringify(report.post)}`);
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK')}catch{}
    console.error(e.stack||e);
    process.exitCode=1;
  }finally{await db.end();}
}

if(require.main===module) main();
module.exports={SKU,MANN,OLD_PARENT,EXPECTED_APPS};
