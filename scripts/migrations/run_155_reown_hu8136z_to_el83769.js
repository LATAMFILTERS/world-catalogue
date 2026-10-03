'use strict';
const {Client}=require('pg');
const EXECUTE=process.argv.includes('--execute');
const SOURCE='EL38136';
const TARGET='EL83769';
const MANN='HU8136Z';
const FLEETGUARD='LF3769';
const EXPECTED_ROWS=172;
const OEMS=['51055040105','51055006073','6061800009','6061800109','6021800009'];
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const last4=v=>norm(v).replace(/\D/g,'').slice(-4).padStart(4,'0');

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('CATALOG_DATABASE_URL/DATABASE_URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const derived='EL8'+last4(FLEETGUARD);
  if(derived!==TARGET) throw new Error(`SKU_RULE_MISMATCH ${derived} != ${TARGET}`);
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,fleetguard:FLEETGUARD,pre:{},mutations:{product_inserted:0,parent_inserted:0,crossref_inserted:0,applications_reowned:0},post:{}};
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const source=(await db.query(`
      SELECT sku,codigo_base,filter_type,duty,canonical_source_brand,canonical_source_code,canonical_source_status
      FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE
    `,[SOURCE])).rows[0];
    if(!source) throw new Error('SOURCE_MISSING');
    if(source.filter_type!=='oil'||source.duty!=='LIGHT_DUTY'||norm(source.codigo_base)!=='8136') throw new Error('SOURCE_IDENTITY_CHANGED');

    const existing=await db.query(`
      SELECT sku,codigo_base,canonical_source_code
      FROM public.elimfilters_catalog
      WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($2)
    `,[TARGET,FLEETGUARD]);
    if(existing.rowCount) throw new Error('TARGET_OR_LF3769_ALREADY_EXISTS '+JSON.stringify(existing.rows));

    const parentConflict=await db.query(`
      SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog
      WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
    `,[TARGET,FLEETGUARD]);
    if(parentConflict.rowCount) throw new Error('TARGET_PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));

    const sourceRows=await db.query(`
      SELECT id FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)
      ORDER BY id
    `,[SOURCE,MANN]);
    if(sourceRows.rowCount!==EXPECTED_ROWS) throw new Error(`HU8136Z rows ${sourceRows.rowCount} != ${EXPECTED_ROWS}`);

    const other=await db.query(`
      SELECT source_sku,count(*)::int n FROM ld_catalog.ld_vehicle_applications
      WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)<>ld_catalog.norm_part($2)
      GROUP BY source_sku
    `,[SOURCE,MANN]);
    if(other.rowCount!==0) throw new Error('SOURCE_HAS_OTHER_APPLICATIONS '+JSON.stringify(other.rows));

    const claim=await db.query(`
      SELECT elimfilters_sku FROM ld_catalog.ld_competitor_cross_references
      WHERE ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($1)
    `,[MANN]);
    if(claim.rowCount!==0) throw new Error('HU8136Z_ALREADY_CLAIMED '+JSON.stringify(claim.rows));

    const donaldson=await db.query(`
      WITH q(code) AS (SELECT unnest($1::text[]))
      SELECT DISTINCT c.sku,c.codigo_base
      FROM q
      JOIN public.elimfilters_catalog c ON c.duty='HEAVY_DUTY' AND upper(coalesce(c.canonical_source_brand,''))='DONALDSON'
      CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes)='array' THEN c.oem_codes ELSE '[]'::jsonb END) e
      WHERE ld_catalog.norm_part(e->>'code')=ld_catalog.norm_part(q.code)
    `,[OEMS]);
    if(donaldson.rowCount!==0) throw new Error('DONALDSON_OEM_MATCH_NOW_EXISTS '+JSON.stringify(donaldson.rows));

    report.pre={source_rows:sourceRows.rowCount,source_other_application_groups:other.rowCount,existing_claimants:claim.rowCount,donaldson_oem_matches:donaldson.rowCount,target_absent:true,derived_target:derived};

    if(EXECUTE){
      const gov={
        policy_version:'2026-08-19-v3.1',
        state:'CANONICAL_VERIFIED_FALLBACK',
        governance_state:'CANONICAL_VERIFIED_FALLBACK',
        required_authority:'DONALDSON_THEN_FALLBACK',
        approved_manufacturer:'FLEETGUARD',
        approved_codigo_base:FLEETGUARD,
        current_codigo_base:FLEETGUARD,
        approved_source_column:'COMPETITOR_CODES',
        primary_manufacturer_verified:false,
        donaldson_absence_verified:true,
        fallback_manufacturer_verified:true,
        fallback_commercial_code_verified:true,
        verification_method:'DONALDSON_REPO_OEM_ABSENCE__FLEETGUARD_LF3769_APPLICATION_AND_GEOMETRY_MATCH',
        evidence_authority:'FLEETGUARD_APPLICATION_GEOMETRY_MATCH',
        verified_at:new Date().toISOString(),
        evidence_note:'run_155: HU8136Z is HD by MAN/Fendt/Unimog applications. Governed Donaldson catalog has no HD match for representative MAN/Mercedes OEMs. Fleetguard LF3769 matches MAN D0836 applications and 83.5x175 mm geometry vs MANN 83x173 mm.'
      };
      const product=await db.query(`
        INSERT INTO public.elimfilters_catalog(
          sku,codigo_base,filter_type,technology,height_mm,outer_diameter_mm,inner_diameter_mm,
          duty,sub_type,installation_type,canonical_source_brand,canonical_source_code,
          canonical_source_status,canonical_verified_at,duty_source_brand,duty_validation_status,
          duty_verified_at,description,catalog_active,enrichment_data
        ) VALUES(
          $1::text,$2::text,'oil','SYNTRAX™',175,83.5,35.5,
          'HEAVY_DUTY','Fleetguard','Cartridge','FLEETGUARD',$2::text,
          'VERIFIED',now(),'FLEETGUARD','VERIFIED',now(),
          'ELIMFILTERS® EL83769 heavy-duty cartridge oil filter. SYNTRAX™ media protects bearings and engine surfaces from wear contaminants.',true,
          jsonb_build_object('codigo_base_governance',$3::jsonb)
        ) RETURNING sku
      `,[TARGET,FLEETGUARD,JSON.stringify(gov)]);
      if(product.rowCount!==1) throw new Error('TARGET_PRODUCT_INSERT_FAILED');
      report.mutations.product_inserted=1;

      const parent=await db.query(`
        INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at)
        VALUES($1::varchar,$2::varchar,'Oil Filter',now(),now()) RETURNING elimfilters_sku
      `,[TARGET,FLEETGUARD]);
      if(parent.rowCount!==1) throw new Error('TARGET_PARENT_INSERT_FAILED');
      report.mutations.parent_inserted=1;

      const xref=await db.query(`
        INSERT INTO ld_catalog.ld_competitor_cross_references(elimfilters_sku,source_sku,competitor_brand,competitor_part_number,created_at)
        VALUES($1::varchar,$2::varchar,'MANN-FILTER',$3::varchar,now()) RETURNING id
      `,[TARGET,FLEETGUARD,MANN]);
      if(xref.rowCount!==1) throw new Error('HU8136Z_XREF_INSERT_FAILED');
      report.mutations.crossref_inserted=1;

      const moved=await db.query(`
        UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1
        WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)
      `,[TARGET,SOURCE,sourceRows.rows.map(r=>r.id),MANN]);
      if(moved.rowCount!==EXPECTED_ROWS) throw new Error(`HU8136Z moved ${moved.rowCount} != ${EXPECTED_ROWS}`);
      report.mutations.applications_reowned=moved.rowCount;
    }

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM public.elimfilters_catalog WHERE sku=$1 AND codigo_base=$3 AND filter_type='oil' AND duty='HEAVY_DUTY' AND canonical_source_brand='FLEETGUARD' AND canonical_source_status='VERIFIED') target_product,
        (SELECT count(*)::int FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_parent,
        (SELECT count(*)::int FROM ld_catalog.ld_competitor_cross_references WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(competitor_part_number)=ld_catalog.norm_part($4)) target_xref,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) source_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)) target_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications) global_total
    `,[TARGET,SOURCE,FLEETGUARD,MANN]);
    report.post=post.rows[0];

    if(EXECUTE){
      if(report.post.target_product!==1||report.post.target_parent!==1||report.post.target_xref!==1||report.post.source_rows!==0||report.post.target_rows!==EXPECTED_ROWS) throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
      await db.query('COMMIT'); report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK'); report.transaction='ROLLBACK';
    }
    console.log(JSON.stringify(report,null,2));
  }catch(e){try{await db.query('ROLLBACK')}catch{};console.error(e.stack||e);process.exitCode=1}
  finally{await db.end()}
}
if(require.main===module) main();
