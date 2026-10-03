'use strict';
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');
const SOURCE='EA31632';
const TARGET='EA31512';
const MANN='C2163/2';
const OEM='4191512';
const OEM_BRAND='DEUTZ';
const EXPECTED_ROWS=5;
const MANN_URL='https://www.mann-filter.com/us-en/catalog/search-results/product.html/c2163/2_mann-filter.html';
const OEM_EVIDENCE_URL='https://aerobasegroup.com/part-number/4191512_01-624-5924';

function patchPolicyFunction(def){
  if(def.includes('mann_code_collision_verified')) return def;
  const marker="        IF coalesce((gov->>'primary_manufacturer_verified')::boolean, false) IS NOT TRUE THEN";
  const at=def.lastIndexOf(marker);
  if(at<0) throw new Error('POLICY_PATCH_MARKER_NOT_FOUND');
  const block=[
"        IF coalesce((gov->>'mann_code_collision_verified')::boolean, false) IS TRUE THEN",
"          IF coalesce((gov->>'oem_base_verified')::boolean, false) IS NOT TRUE THEN",
"            RAISE EXCEPTION 'CATALOG_POLICY_V41: LD collision OEM base requires verified OEM evidence';",
"          END IF;",
"          IF upper(regexp_replace(coalesce(NEW.canonical_source_brand,''), '[^A-Z0-9]', '', 'g')) <> expected_ld_brand THEN",
"            RAISE EXCEPTION 'CATALOG_POLICY_V41: LD collision exception must retain canonical source manufacturer %', expected_ld_brand;",
"          END IF;",
"          IF upper(regexp_replace(coalesce(NEW.canonical_source_code,''), '[^A-Z0-9]', '', 'g'))",
"             <> upper(regexp_replace(coalesce(gov->>'collision_canonical_code',''), '[^A-Z0-9]', '', 'g')) THEN",
"            RAISE EXCEPTION 'CATALOG_POLICY_V41: LD collision exception canonical code mismatch';",
"          END IF;",
"          IF approved_source <> 'OEM_CODES' OR approved_code_norm = '' OR approved_code_norm <> base_norm OR approved_manufacturer = '' THEN",
"            RAISE EXCEPTION 'CATALOG_POLICY_V41: LD collision exception requires verified OEM codigo_base';",
"          END IF;",
"          code_digits := regexp_replace(approved_code, '[^0-9]', '', 'g');",
"          sku_digits := regexp_replace(coalesce(NEW.sku,''), '[^0-9]', '', 'g');",
"          IF length(code_digits) < 4 OR right(sku_digits,4) <> right(code_digits,4) THEN",
"            RAISE EXCEPTION 'CATALOG_POLICY_V41: LD collision SKU suffix must follow OEM codigo_base';",
"          END IF;",
"          RETURN NEW;",
"        END IF;",
""
  ].join('\n');
  return def.slice(0,at)+block+def.slice(at);
}
async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.port!=='5441'||u.pathname!=='/catalogo_elimfilters') throw new Error('REFUSE_NON_CANONICAL_DB');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={
    mode:EXECUTE?'execute':'dry-run',source:SOURCE,target:TARGET,mann:MANN,oem:OEM,
    pre:{},mutations:{product_inserted:0,parent_inserted:0,identity_inserted:0,oem_xref_inserted:0,applications_reowned:0},post:{}
  };
  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const fn=(await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy()'::regprocedure) def")).rows[0]?.def;
    if(!fn) throw new Error('CATALOG_POLICY_FUNCTION_MISSING');
    await db.query(patchPolicyFunction(fn));

    const source=(await db.query(
      'SELECT sku,codigo_base,filter_type,duty,technology FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
      [SOURCE]
    )).rows[0];
    if(!source||source.filter_type!=='air'||source.duty!=='LIGHT_DUTY'||source.technology!=='MACROCORE™') throw new Error('SOURCE_IDENTITY_CHANGED');

    const occupied=await db.query(
      "SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku",
      [['EA31632','EA32163']]
    );
    const occ=new Map(occupied.rows.map(r=>[r.sku,r]));
    if(occ.get('EA31632')?.canonical_source_code!=='C1632'||occ.get('EA32163')?.canonical_source_code!=='C2163'){
      throw new Error('MANN_COLLISION_WINDOWS_CHANGED '+JSON.stringify(occupied.rows));
    }

    const conflicts=await db.query(
      "SELECT sku FROM public.elimfilters_catalog WHERE sku=$1 OR ld_catalog.norm_part(codigo_base)=ld_catalog.norm_part($2) OR ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($3)",
      [TARGET,OEM,MANN]
    );
    if(conflicts.rowCount) throw new Error('TARGET_OR_IDENTITY_CONFLICT '+JSON.stringify(conflicts.rows));

    const parentConflict=await db.query(
      "SELECT elimfilters_sku,source_sku FROM ld_catalog.ld_product_catalog WHERE elimfilters_sku=$1 OR ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2)",
      [TARGET,MANN]
    );
    if(parentConflict.rowCount) throw new Error('TARGET_PARENT_CONFLICT '+JSON.stringify(parentConflict.rows));
    const rows=await db.query(
      "SELECT id FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($2) ORDER BY id",
      [SOURCE,MANN]
    );
    if(rows.rowCount!==EXPECTED_ROWS) throw new Error(`C2163/2 rows ${rows.rowCount} != ${EXPECTED_ROWS}`);

    const oemClaim=await db.query(
      "SELECT elimfilters_sku FROM ld_catalog.ld_oem_cross_references WHERE ld_catalog.norm_part(oem_part_number)=ld_catalog.norm_part($1)",
      [OEM]
    );
    if(oemClaim.rowCount) throw new Error('OEM_ALREADY_CLAIMED '+JSON.stringify(oemClaim.rows));

    const gov={
      policy_version:'2026-10-03-v4.1',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'EUROPEAN',
      required_authority:'MANN_FILTER_WITH_VERIFIED_OEM_COLLISION_BASE',
      primary_manufacturer_verified:true,
      collision_canonical_code:MANN,
      mann_code_collision_verified:true,
      oem_base_verified:true,
      approved_manufacturer:OEM_BRAND,
      approved_codigo_base:OEM,
      current_codigo_base:OEM,
      approved_source_column:'OEM_CODES',
      collision_windows:[
        {sku:'EA31632',canonical_code:'C1632',suffix:'1632'},
        {sku:'EA32163',canonical_code:'C2163',suffix:'2163'}
      ],
      verification_method:'MANN_CANONICAL_IDENTITY_PLUS_VERIFIED_OEM_COLLISION_BASE',
      canonical_evidence_url:MANN_URL,
      oem_evidence_url:OEM_EVIDENCE_URL,
      evidence_note:'C2163/2 is a distinct MANN air filter (215 x 115 x 57 mm). Both normal 4-digit windows collide with verified C1632 and C2163 identities. DEUTZ 4191512 matches the exact 215 x 115 x 57 mm air-filter geometry and is used as the governed OEM codigo_base.'
    };

    const candidate={
      sku:TARGET,codigo_base:OEM,duty:'LIGHT_DUTY',filter_type:'air',technology:'MACROCORE™',
      canonical_source_brand:'MANN-FILTER',canonical_source_code:MANN,
      oem_codes:[],competitor_codes:[],
      enrichment_data:{codigo_base_governance:gov}
    };
    report.pre.gateway=assertCanonicalWrite(candidate);
    report.pre.source_rows=rows.rowCount;
    report.pre.collision_windows=occupied.rows;
    report.pre.oem_claimants=oemClaim.rowCount;

    const product=await db.query(`
      INSERT INTO public.elimfilters_catalog(
        sku,codigo_base,name,description,duty,filter_type,technology,installation_type,
        height_mm,outer_diameter_mm,gasket_od_mm,
        canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,
        duty_source_brand,duty_validation_status,duty_verified_at,
        oem_codes,competitor_codes,vehicle_applications,equipment_applications,
        catalog_active,enrichment_data
      ) VALUES(
        $1,$2,'ELIMFILTERS Air Filter C2163/2',
        'ELIMFILTERS® light-duty air filter for MANN-FILTER C2163/2 applications. MACROCORE™.',
        'LIGHT_DUTY','air','MACROCORE™','Panel',
        57,215,115,
        'MANN-FILTER',$3,$4,'VERIFIED',now(),
        'MANN-FILTER','VERIFIED',now(),
        '[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,
        true,$5::jsonb
      ) RETURNING sku
    `,[TARGET,OEM,MANN,MANN_URL,JSON.stringify({codigo_base_governance:gov})]);
    if(product.rowCount!==1) throw new Error('PRODUCT_INSERT_FAILED');
    report.mutations.product_inserted=1;

    const parent=await db.query(
      "INSERT INTO ld_catalog.ld_product_catalog(elimfilters_sku,source_sku,segment,created_at,updated_at) VALUES($1,$2,'Air Filter',now(),now()) RETURNING elimfilters_sku",
      [TARGET,MANN]
    );
    if(parent.rowCount!==1) throw new Error('PARENT_INSERT_FAILED');
    report.mutations.parent_inserted=1;

    const identity=await db.query(
      "INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku,origin_group,canonical_brand,canonical_part_number,filter_type,status,evidence_source,created_at,updated_at) VALUES($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MIGRATION_158_C21632_OEM_COLLISION_BASE',now(),now()) RETURNING elimfilters_sku",
      [TARGET,MANN]
    );
    if(identity.rowCount!==1) throw new Error('IDENTITY_INSERT_FAILED');
    report.mutations.identity_inserted=1;

    const ox=await db.query(
      "INSERT INTO ld_catalog.ld_oem_cross_references(elimfilters_sku,source_sku,oem_brand,oem_part_number,created_at) VALUES($1,$2,$3,$4,now()) RETURNING id",
      [TARGET,MANN,OEM_BRAND,OEM]
    );
    if(ox.rowCount!==1) throw new Error('OEM_XREF_INSERT_FAILED');
    report.mutations.oem_xref_inserted=1;

    const moved=await db.query(
      "UPDATE ld_catalog.ld_vehicle_applications SET elimfilters_sku=$1 WHERE elimfilters_sku=$2 AND id=ANY($3::bigint[]) AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($4)",
      [TARGET,SOURCE,rows.rows.map(r=>r.id),MANN]
    );
    if(moved.rowCount!==EXPECTED_ROWS) throw new Error(`C2163/2 moved ${moved.rowCount} != ${EXPECTED_ROWS}`);
    report.mutations.applications_reowned=moved.rowCount;

    const post=await db.query(`
      SELECT
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) source_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$1 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part($3)) target_rows,
        (SELECT count(*)::int FROM ld_catalog.ld_vehicle_applications WHERE elimfilters_sku=$2 AND ld_catalog.norm_part(source_sku)=ld_catalog.norm_part('C38163/2')) untouched_c381632,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($3) AND sku=$1) mann_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($4) AND sku=$1) oem_resolves_target,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('C1632') AND sku='EA31632') c1632_intact,
        (SELECT count(*)::int FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('C2163') AND sku='EA32163') c2163_intact
    `,[TARGET,SOURCE,MANN,OEM]);
    report.post=post.rows[0];

    if(report.post.source_rows!==0||report.post.target_rows!==EXPECTED_ROWS||report.post.untouched_c381632!==7||
       report.post.mann_resolves_target!==1||report.post.oem_resolves_target!==1||
       report.post.c1632_intact!==1||report.post.c2163_intact!==1){
      throw new Error('POSTCHECK_FAILED '+JSON.stringify(report.post));
    }
    if(EXECUTE){
      await db.query('COMMIT');
      report.transaction='COMMIT';
    }else{
      await db.query('ROLLBACK');
      report.transaction='ROLLBACK';
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
