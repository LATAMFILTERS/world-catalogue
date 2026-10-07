'use strict';

require('dotenv').config();
const { Client } = require('pg');

function digits(v){ return String(v||'').replace(/\D/g,''); }
function expectedSku(row){
  const sku=String(row.sku||'').toUpperCase();
  const codeDigits=digits(row.codigo_base||row.canonical_source_code);
  if(codeDigits.length<4) return null;
  const suffix=codeDigits.slice(-4);
  if(sku.startsWith('EA1')) return 'EA1'+suffix;
  if(sku.startsWith('EA2')) return 'EA2'+suffix;
  if(sku.startsWith('EF9')) return 'EF9'+suffix;
  if(sku.startsWith('EL8')) return 'EL8'+suffix;
  if(sku.startsWith('EH6')) return 'EH6'+suffix;
  return null;
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  try{
    const rows=(await db.query(`
      SELECT sku,codigo_base,canonical_source_code,filter_type,technology,catalog_active
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (
          sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR
          sku LIKE 'EL8%' OR sku LIKE 'EH6%'
        )
      ORDER BY sku
    `)).rows;
    const bad=[];
    for(const row of rows){
      const expected=expectedSku(row);
      if(expected && expected!==String(row.sku).toUpperCase()){
        bad.push({...row,expected_sku:expected});
      }
    }
    const z900Bad=bad.filter(r =>
      ['EA121575','EA181039','EA135396','EA1781098','EA101280','EA181102','EA282526','EA282527'].includes(r.sku)
      || r.technology==='INTEKCORE™'
    );
    console.log(JSON.stringify({active_rows:rows.length,malformed_count:bad.length,z900_related:z900Bad,all_malformed:bad},null,2));
  }finally{await db.end();}
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
