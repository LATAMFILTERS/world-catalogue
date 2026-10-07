'use strict';

require('dotenv').config();
const { Client } = require('pg');

const APPLY=process.argv.includes('--execute');
const OLD='EA121575';
const NEW='EA15551';

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  try{
    await db.query('BEGIN');

    const cat=await db.query(
      'SELECT sku,codigo_base,canonical_source_brand,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
      [NEW]
    );
    if(cat.rowCount!==1 || cat.rows[0].codigo_base!=='AF25551'){
      throw new Error('CANONICAL_EA15551_NOT_VERIFIED '+JSON.stringify(cat.rows));
    }

    const rows=await db.query(
      'SELECT id,element_code,elimfilters_sku,compatibility_class FROM product_element WHERE element_code=ANY($1::text[]) OR elimfilters_sku=ANY($1::text[]) ORDER BY id FOR UPDATE',
      [[OLD,NEW]]
    );

    const oldRows=rows.rows.filter(r=>r.element_code===OLD);
    const targetRows=rows.rows.filter(r=>r.element_code===NEW);
    if(oldRows.length!==1) throw new Error('LEGACY_ELEMENT_ROW_COUNT '+oldRows.length);
    if(targetRows.length) throw new Error('TARGET_ELEMENT_CODE_ALREADY_EXISTS '+JSON.stringify(targetRows));

    const id=oldRows[0].id;
    const linksBefore=await db.query(
      'SELECT count(*)::int AS n FROM model_element_compatibility WHERE product_element_id=$1',
      [id]
    );

    let updated=null;
    if(APPLY){
      const u=await db.query(
        'UPDATE product_element SET element_code=$1,elimfilters_sku=$1 WHERE id=$2 RETURNING id,element_code,elimfilters_sku,compatibility_class',
        [NEW,id]
      );
      if(u.rowCount!==1) throw new Error('PRODUCT_ELEMENT_UPDATE_FAILED');
      updated=u.rows[0];
    }

    const linksAfter=await db.query(
      'SELECT count(*)::int AS n FROM model_element_compatibility WHERE product_element_id=$1',
      [id]
    );
    if(linksBefore.rows[0].n!==linksAfter.rows[0].n) throw new Error('COMPATIBILITY_LINK_COUNT_CHANGED');

    const report={
      mode:APPLY?'execute':'dry-run',
      canonical_catalog:cat.rows[0],
      product_element_before:oldRows[0],
      product_element_after:updated||{...oldRows[0],element_code:NEW,elimfilters_sku:NEW},
      compatibility_links:linksBefore.rows[0].n
    };

    if(APPLY){await db.query('COMMIT');report.transaction='COMMIT';}
    else {await db.query('ROLLBACK');report.transaction='ROLLBACK';}

    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK');}catch(_){}
    throw e;
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
