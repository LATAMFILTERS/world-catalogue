'use strict';

const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');
const SKU='EA31632';
const SOURCE='C1632';
const EXPECTED={height_mm:72,outer_diameter_mm:152,gasket_od_mm:88,gasket_id_mm:88};
const MANN_URL='https://www.mann-filter.com/en/catalog/search-results/product.html/c1632_mann-filter.html';

function num(v){ return v==null?null:Number(v); }
function same(a,b){ return num(a)===num(b); }

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',sku:SKU,source:SOURCE,pre:{},mutation:{},post:{}};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const pre=(await db.query(
      `SELECT sku,codigo_base,canonical_source_brand,canonical_source_code,
              installation_type,height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,
              canonical_source_url,canonical_source_status,catalog_active
         FROM public.elimfilters_catalog
        WHERE sku=$1
        FOR UPDATE`,
      [SKU]
    )).rows[0];

    if(!pre) throw new Error('TARGET_MISSING');
    if(pre.canonical_source_brand!=='MANN-FILTER'||pre.canonical_source_code!==SOURCE){
      throw new Error('CANONICAL_IDENTITY_CHANGED '+JSON.stringify(pre));
    }
    if(pre.catalog_active!==true) throw new Error('TARGET_INACTIVE');

    const resolver=await db.query(
      `SELECT sku FROM public.v_api_resolver_v7
        WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
        ORDER BY sku`,
      [SOURCE]
    );
    if(resolver.rowCount!==1||resolver.rows[0].sku!==SKU){
      throw new Error('RESOLVER_IDENTITY_CHANGED '+JSON.stringify(resolver.rows));
    }

    report.pre={
      row:pre,
      resolver:resolver.rows,
      official_source:MANN_URL
    };

    const updated=await db.query(
      `UPDATE public.elimfilters_catalog
          SET installation_type='Panel',
              height_mm=$2,
              outer_diameter_mm=$3,
              gasket_od_mm=$4,
              gasket_id_mm=$5,
              canonical_source_url=COALESCE(NULLIF(canonical_source_url,''),$6),
              canonical_source_status='VERIFIED',
              canonical_verified_at=now()
        WHERE sku=$1
          AND canonical_source_brand='MANN-FILTER'
          AND canonical_source_code=$7
      RETURNING sku,height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm`,
      [SKU,EXPECTED.height_mm,EXPECTED.outer_diameter_mm,EXPECTED.gasket_od_mm,EXPECTED.gasket_id_mm,MANN_URL,SOURCE]
    );
    if(updated.rowCount!==1) throw new Error('SPEC_REPAIR_FAILED');
    report.mutation=updated.rows[0];

    const post=(await db.query(
      `SELECT sku,canonical_source_brand,canonical_source_code,
              installation_type,height_mm,outer_diameter_mm,gasket_od_mm,gasket_id_mm,
              canonical_source_status,catalog_active
         FROM public.elimfilters_catalog
        WHERE sku=$1`,
      [SKU]
    )).rows[0];

    if(post.installation_type!=='Panel'||
       !same(post.height_mm,EXPECTED.height_mm)||
       !same(post.outer_diameter_mm,EXPECTED.outer_diameter_mm)||
       !same(post.gasket_od_mm,EXPECTED.gasket_od_mm)||
       !same(post.gasket_id_mm,EXPECTED.gasket_id_mm)||
       post.canonical_source_brand!=='MANN-FILTER'||
       post.canonical_source_code!==SOURCE||
       post.catalog_active!==true){
      throw new Error('POSTCHECK_FAILED '+JSON.stringify(post));
    }

    const postResolver=await db.query(
      `SELECT sku FROM public.v_api_resolver_v7
        WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
        ORDER BY sku`,
      [SOURCE]
    );
    if(postResolver.rowCount!==1||postResolver.rows[0].sku!==SKU){
      throw new Error('POST_RESOLVER_CHANGED '+JSON.stringify(postResolver.rows));
    }

    report.post={row:post,resolver:postResolver.rows};

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
