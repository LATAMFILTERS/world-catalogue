'use strict';

const { Client } = require('pg');
const APPLY = process.argv.includes('--apply');

const SKU='EL34967';
const CANONICAL='PH4967';
const SOURCE='W68/3';

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');

  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

  try{
    const report={mode:APPLY?'apply':'dry-run',sku:SKU};

    const identity=await db.query(
      "SELECT c.sku,c.codigo_base,p.source_sku,i.canonical_brand,i.canonical_part_number,i.status FROM public.elimfilters_catalog c JOIN ld_catalog.ld_product_catalog p ON p.elimfilters_sku=c.sku JOIN ld_catalog.ld_canonical_product_identity i ON i.elimfilters_sku=c.sku AND i.status='ACTIVE' WHERE c.sku=$1",
      [SKU]
    );
    if(identity.rowCount!==1) throw new Error('EL34967_CANONICAL_IDENTITY_NOT_UNIQUE');
    const row=identity.rows[0];
    if(row.codigo_base!==CANONICAL || row.source_sku!==SOURCE || row.canonical_brand!=='FRAM' || row.canonical_part_number!==CANONICAL){
      throw new Error('EL34967_CANONICAL_IDENTITY_MISMATCH');
    }
    report.identity=row;

    const evidence=await db.query(
      "SELECT id,make,model_family,model_type,year,engine_code,source_sku FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND upper(coalesce(make,''))='TOYOTA (USA)' AND upper(coalesce(engine_code,''))='2ZRFXE' AND coalesce(model_type,'') ILIKE 'Prius (%' AND coalesce(model_type,'') NOT ILIKE '%Prime%' ORDER BY id",
      [SKU]
    );
    if(evidence.rowCount<1) throw new Error('PRIUS_2ZRFXE_LEGACY_EVIDENCE_MISSING');
    report.legacy_evidence=evidence.rows;

    const before=await db.query(
      "SELECT id,source_sku,make,model_family,model_type,year,engine_code,source_origin FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND upper(coalesce(make,''))='TOYOTA' AND upper(coalesce(model_family,''))='PRIUS' AND upper(coalesce(model_type,''))='PRIUS' AND upper(coalesce(engine_code,''))='2ZRFXE' ORDER BY id",
      [SKU]
    );
    report.normalized_before=before.rows;

    if(APPLY){
      await db.query(
        "DELETE FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND upper(coalesce(make,''))='TOYOTA' AND upper(coalesce(model_family,''))='PRIUS' AND upper(coalesce(model_type,''))='PRIUS' AND upper(coalesce(engine_code,''))='2ZRFXE'",
        [SKU]
      );
      await db.query(
        "INSERT INTO ld_catalog.ld_vehicle_applications (elimfilters_sku,source_sku,make,model_family,model_type,year,engine_code,source_origin) VALUES ($1,$2,'TOYOTA','PRIUS','PRIUS',NULL,'2ZRFXE','run_126_prius_2zrfxe_normalization')",
        [SKU,SOURCE]
      );
    }

    const after=await db.query(
      "SELECT id,source_sku,make,model_family,model_type,year,engine_code,source_origin FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND upper(coalesce(make,''))='TOYOTA' AND upper(coalesce(model_family,''))='PRIUS' AND upper(coalesce(model_type,''))='PRIUS' AND upper(coalesce(engine_code,''))='2ZRFXE' ORDER BY id",
      [SKU]
    );
    report.normalized_after=after.rows;

    if(APPLY){
      if(after.rowCount!==1 || after.rows[0].source_sku!==SOURCE) throw new Error('PRIUS_2ZRFXE_NORMALIZATION_VERIFY_FAILED');
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

main().catch(error=>{
  console.error(error.stack||error.message);
  process.exit(1);
});
