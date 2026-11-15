'use strict';
/** HERMES #1313: only READ. Nothing here assigns a SKU or changes PostgreSQL. */
const {Client}=require('pg');
const norm=v=>String(v??'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const groups={
 original:['1000424916A'],related_oem:['1000424916','1000424916A-7290'],
 mann_verified:['PL420X'],wix_verified:['95102E'],sf_verified:['SK3359'],
 donaldson_candidate:['P550778','R010017'],fleetguard_candidate:['FS19769'],hifi_verified:['SN70207']
};
const wanted=[...new Set(Object.values(groups).flat().map(norm))];
const classify=v=>Object.entries(groups).filter(([,codes])=>codes.map(norm).includes(norm(v))).map(([key])=>key);
const refkeys=['code','reference','part_number','partNumber','partno','oem_code','oemCode','cross_reference','crossReference'];
function refs(row){
 const found=[];
 for(const field of ['codigo_base','canonical_source_code'])
  if(classify(row[field]).length)found.push({field,code:row[field],groups:classify(row[field])});
 for(const field of ['oem_codes','competitor_codes']){
  for(const entry of (Array.isArray(row[field])?row[field]:[])){
   const code=refkeys.map(k=>entry?.[k]).find(v=>typeof v==='string' && classify(v).length);
   if(code) found.push({field,code,manufacturer:entry.manufacturer||entry.brand||null,groups:classify(code)});
  }
 }
 return found;
}
function report(rows){
 const matched=rows.map(r=>({sku:r.sku,active:r.catalog_active,duty:r.duty,base:r.codigo_base,canonical_brand:r.canonical_source_brand,canonical_code:r.canonical_source_code,canonical_status:r.canonical_source_status,hits:refs(r)}));
 return {status:'NO_GO_READ_ONLY',target:'1000424916A',exact_owners:matched.filter(r=>r.hits.some(h=>h.groups.includes('original'))).map(r=>r.sku),reference_matches:matched,conclusion:'Never create a SKU, promote candidate canonical references, or mutate database without governed verification'};
}
async function main(){
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 const local=!url||/(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/i.test(url);
 const db=new Client(url?{connectionString:url,ssl:local?false:{rejectUnauthorized:false}}:{
  host:process.env.PGHOST||'127.0.0.1',port:Number(process.env.PGPORT||5432),
  database:process.env.PGDATABASE||'catalogo_elimfilters',user:process.env.PGUSER,password:process.env.PGPASSWORD,ssl:false
 });
 await db.connect();
 try{
  await db.query('BEGIN READ ONLY');
  await db.query("SET LOCAL statement_timeout='60000ms'");
  const info=await db.query("SELECT current_database() AS db, current_setting('transaction_read_only') AS ro");
  if(info.rows[0].db!=='catalogo_elimfilters'||info.rows[0].ro!=='on')throw Error('UNSAFE_DATABASE_TARGET');
  const result=await db.query(`SELECT sku,codigo_base,canonical_source_brand,canonical_source_code,canonical_source_status,catalog_active,duty,oem_codes,competitor_codes
   FROM public.elimfilters_catalog c WHERE
   regexp_replace(upper(coalesce(codigo_base,'')),'[^A-Z0-9]','','g')=ANY($1::text[])
   OR regexp_replace(upper(coalesce(canonical_source_code,'')),'[^A-Z0-9]','','g')=ANY($1::text[])
   OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) v
       WHERE regexp_replace(upper(coalesce(v->>'code',v->>'reference',v->>'part_number',v->>'partNumber',v->>'partno',v->>'oem_code',v->>'oemCode',v->>'cross_reference',v->>'crossReference','')),'[^A-Z0-9]','','g')=ANY($1::text[]))
   ORDER BY sku`,[wanted]);
  console.log(JSON.stringify({database:info.rows[0].db,...report(result.rows)},null,2));
  await db.query('ROLLBACK');
 }catch(e){await db.query('ROLLBACK').catch(()=>{});throw e;}
 finally{await db.end();}
}
if(require.main===module)main().catch(e=>{console.error('NO_GO',e.message);process.exitCode=1;});
module.exports={norm,classify,refs,report};
