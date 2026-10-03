'use strict';

const {Client}=require('pg');

const EXECUTE=process.argv.includes('--execute');

const TARGETS=[
  {
    sku:'EA36005',source:'C16005',
    height_mm:188,outer_diameter_mm:154,inner_diameter_mm:30,
    source_url:'https://www.mann-filter.com/es/catalogo/resultados-de-busqueda/producto.html/c16005_mann-filter.html',
    specs:[
      ['Outer diameter','154 mm'],['Inner diameter','30 mm'],['Inner diameter 1','90 mm'],['Height','188 mm']
    ]
  },
  {
    sku:'EA31151',source:'C1151',
    height_mm:239,outer_diameter_mm:114,inner_diameter_mm:76,
    source_url:'https://www.mann-filter.com/es-es/catalogo/resultados-de-la-busqueda/producto.html/c1151_mann-filter.html',
    specs:[
      ['Outer diameter','114 mm'],['Inner diameter','76 mm'],['Inner diameter 1','76 mm'],['Height','239 mm']
    ]
  },
  {
    sku:'EA39004',source:'C9004',
    height_mm:70,outer_diameter_mm:85,inner_diameter_mm:25,
    source_url:'https://www.mann-filter.com/en/catalog/search-results/product.html/c9004_mann-filter.html',
    specs:[
      ['Outer diameter','85 mm'],['Inner diameter','25 mm'],['Height','70 mm']
    ]
  }
];

function num(v){return v==null?null:Number(v);}
function same(a,b){return num(a)===num(b);}

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
        `SELECT sku,codigo_base,filter_type,duty,canonical_source_brand,canonical_source_code,
                height_mm,outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
                canonical_source_status,catalog_active
           FROM public.elimfilters_catalog
          WHERE sku=$1
          FOR UPDATE`,
        [t.sku]
      )).rows[0];

      if(!pre) throw new Error('TARGET_MISSING '+t.sku);
      if(pre.filter_type!=='air'||pre.duty!=='LIGHT_DUTY'||pre.catalog_active!==true){
        throw new Error('TARGET_SCOPE_CHANGED '+JSON.stringify(pre));
      }
      if(pre.canonical_source_brand!=='MANN-FILTER'||pre.canonical_source_code!==t.source){
        throw new Error('CANONICAL_IDENTITY_CHANGED '+JSON.stringify(pre));
      }

      const resolver=await db.query(
        `SELECT sku FROM public.v_api_resolver_v7
          WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)
          ORDER BY sku`,
        [t.source]
      );
      if(resolver.rowCount!==1||resolver.rows[0].sku!==t.sku){
        throw new Error('RESOLVER_IDENTITY_CHANGED '+t.source+' '+JSON.stringify(resolver.rows));
      }

      const updated=await db.query(
        `UPDATE public.elimfilters_catalog
            SET height_mm=$2,
                outer_diameter_mm=$3,
                inner_diameter_mm=$4,
                gasket_od_mm=NULL,
                gasket_id_mm=NULL,
                canonical_source_url=$5,
                canonical_source_status='VERIFIED',
                canonical_verified_at=now()
          WHERE sku=$1
            AND canonical_source_brand='MANN-FILTER'
            AND canonical_source_code=$6
        RETURNING sku,height_mm,outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm`,
        [t.sku,t.height_mm,t.outer_diameter_mm,t.inner_diameter_mm,t.source_url,t.source]
      );
      if(updated.rowCount!==1) throw new Error('CATALOG_UPDATE_FAILED '+t.sku);

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

      const post=(await db.query(
        `SELECT sku,canonical_source_brand,canonical_source_code,
                height_mm,outer_diameter_mm,inner_diameter_mm,gasket_od_mm,gasket_id_mm,
                canonical_source_status,catalog_active
           FROM public.elimfilters_catalog
          WHERE sku=$1`,
        [t.sku]
      )).rows[0];

      if(post.canonical_source_brand!=='MANN-FILTER'||post.canonical_source_code!==t.source||
         !same(post.height_mm,t.height_mm)||!same(post.outer_diameter_mm,t.outer_diameter_mm)||
         !same(post.inner_diameter_mm,t.inner_diameter_mm)||post.gasket_od_mm!==null||post.gasket_id_mm!==null||
         post.canonical_source_status!=='VERIFIED'||post.catalog_active!==true){
        throw new Error('POSTCHECK_FAILED '+t.sku+' '+JSON.stringify(post));
      }

      const specRows=await db.query(
        `SELECT source_sku,spec_key,spec_value
           FROM ld_catalog.ld_product_specifications
          WHERE elimfilters_sku=$1
            AND spec_key=ANY($2::text[])
          ORDER BY spec_key`,
        [t.sku,t.specs.map(([k])=>k)]
      );
      if(specRows.rowCount!==t.specs.length||
         specRows.rows.some(r=>r.source_sku!==t.source)){
        throw new Error('SPEC_POSTCHECK_FAILED '+t.sku+' '+JSON.stringify(specRows.rows));
      }

      report.targets.push({
        sku:t.sku,source:t.source,
        pre:{height_mm:pre.height_mm,outer_diameter_mm:pre.outer_diameter_mm,inner_diameter_mm:pre.inner_diameter_mm,gasket_od_mm:pre.gasket_od_mm,gasket_id_mm:pre.gasket_id_mm},
        post,
        semantic_specs:specRows.rows
      });
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
