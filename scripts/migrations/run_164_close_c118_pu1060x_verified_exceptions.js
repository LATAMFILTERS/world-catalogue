'use strict';

const {Client}=require('pg');
const {assertGovernedCatalogPatch}=require('../../lib/catalog-write-gateway');

const EXECUTE=process.argv.includes('--execute');

const TARGETS=[
  {
    sku:'EA30118',filter_type:'air',source:'C118',
    url:'https://www.mann-filter.com/en/catalog/search-results/product.html/c118_mann-filter.html',
    patch:{height_mm:71,product_length_mm:110,outer_diameter_mm:null,inner_diameter_mm:19,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Product type','Ventilator'],['Length','110 mm'],['Width','47 mm'],['Inner diameter','19 mm'],['Height','71 mm']]
  },
  {
    sku:'EF31060',filter_type:'fuel',source:'PU1060X',
    url:'https://www.mann-filter.com/cn-zh/catalog/search-results/product.html/pu1060x_mann-filter.html',
    patch:{height_mm:226,product_length_mm:null,outer_diameter_mm:79,inner_diameter_mm:null,gasket_od_mm:null,gasket_id_mm:null,thread_size:null},
    specs:[['Outer diameter','79 mm'],['Outer diameter 1','79 mm'],['Height','226 mm']]
  }
];

function n(v){return v==null?null:Number(v);}
function sameNum(a,b){return a==null&&b==null?true:n(a)===n(b);}
function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}

async function resolverCheck(db,source,sku){
  const q=await db.query(
    `SELECT sku FROM public.v_api_resolver_v7
      WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
      ORDER BY sku`,[source]
  );
  if(q.rowCount!==1||q.rows[0].sku!==sku){
    throw new Error('RESOLVER_IDENTITY_CHANGED '+source+' '+JSON.stringify(q.rows));
  }
}

async function main(){
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const u=new URL(url);
  if(u.hostname!=='127.0.0.1'||u.port!=='5441'||u.pathname!=='/catalogo_elimfilters'){
    throw new Error('REFUSE_NON_CANONICAL_DB');
  }

  const db=new Client({connectionString:url,ssl:false});
  await db.connect();
  const report={mode:EXECUTE?'execute':'dry-run',targets:[],transaction:null};

  try{
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    for(const t of TARGETS){
      const pre=(await db.query(
        `SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE`,[t.sku]
      )).rows[0];
      if(!pre) throw new Error('TARGET_MISSING '+t.sku);
      if(pre.catalog_active!==true||pre.duty!=='LIGHT_DUTY'||pre.filter_type!==t.filter_type){
        throw new Error('TARGET_SCOPE_CHANGED '+t.sku);
      }
      if(pre.canonical_source_brand!=='MANN-FILTER'||norm(pre.canonical_source_code)!==norm(t.source)){
        throw new Error('CANONICAL_IDENTITY_CHANGED '+t.sku);
      }

      await resolverCheck(db,t.source,t.sku);

      const governedPatch={
        ...t.patch,
        canonical_source_url:t.url,
        canonical_source_status:'VERIFIED',
        canonical_verified_at:new Date(),
      };
      const gateway=assertGovernedCatalogPatch(pre,governedPatch);

      const q=await db.query(
        `UPDATE public.elimfilters_catalog
            SET height_mm=$2,
                product_length_mm=$3,
                outer_diameter_mm=$4,
                inner_diameter_mm=$5,
                gasket_od_mm=$6,
                gasket_id_mm=$7,
                thread_size=$8,
                canonical_source_url=$9,
                canonical_source_status='VERIFIED',
                canonical_verified_at=now()
          WHERE sku=$1
            AND canonical_source_brand='MANN-FILTER'
            AND ld_catalog.norm_part(canonical_source_code)=ld_catalog.norm_part($10)
        RETURNING sku,filter_type,canonical_source_code,height_mm,product_length_mm,
                  outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
                  thread_size,canonical_source_status,catalog_active`,
        [t.sku,t.patch.height_mm,t.patch.product_length_mm,t.patch.outer_diameter_mm,
         t.patch.inner_diameter_mm,t.patch.gasket_od_mm,t.patch.gasket_id_mm,
         t.patch.thread_size,t.url,t.source]
      );
      if(q.rowCount!==1) throw new Error('UPDATE_CARDINALITY_INVALID '+t.sku);

      for(const [key,value] of t.specs){
        await db.query(
          `INSERT INTO ld_catalog.ld_product_specifications(
             elimfilters_sku,source_sku,spec_key,spec_value,spec_unit,created_at
           ) VALUES($1,$2,$3,$4,'',now())
           ON CONFLICT(elimfilters_sku,spec_key)
           DO UPDATE SET source_sku=EXCLUDED.source_sku,
                         spec_value=EXCLUDED.spec_value,
                         spec_unit=EXCLUDED.spec_unit`,
          [t.sku,t.source,key,value]
        );
      }

      const post=q.rows[0];
      for(const key of ['height_mm','product_length_mm','outer_diameter_mm','inner_diameter_mm','gasket_od_mm','gasket_id_mm']){
        if(!sameNum(post[key],t.patch[key])) throw new Error('POSTCHECK_'+key+'_FAILED '+t.sku);
      }
      if(norm(post.canonical_source_code)!==norm(t.source)||post.canonical_source_status!=='VERIFIED'||post.catalog_active!==true){
        throw new Error('POSTCHECK_IDENTITY_FAILED '+t.sku);
      }
      await resolverCheck(db,t.source,t.sku);

      report.targets.push({sku:t.sku,source:t.source,gateway_scope:gateway.scope,pre:{
        height_mm:pre.height_mm,product_length_mm:pre.product_length_mm,outer_diameter_mm:pre.outer_diameter_mm,
        inner_diameter_mm:pre.inner_diameter_mm,gasket_od_mm:pre.gasket_od_mm,gasket_id_mm:pre.gasket_id_mm
      },post});
    }

    if(EXECUTE){await db.query('COMMIT');report.transaction='COMMIT';}
    else{await db.query('ROLLBACK');report.transaction='ROLLBACK';}
    console.log(JSON.stringify(report,null,2));
  }catch(error){
    try{await db.query('ROLLBACK')}catch{}
    console.error(error.stack||error);
    process.exitCode=1;
  }finally{
    await db.end();
  }
}

if(require.main===module) main();
