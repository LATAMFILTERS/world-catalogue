'use strict';
/**
 * Assign the operator-provided R2 image to EL83771 only.
 * Dry-run by default. --execute writes after HTTP validation and DB checks.
 * Requires configured CATALOG_DATABASE_URL (or existing alternatives).
 */
require('dotenv').config();
const { Client } = require('pg');
const { imageUrlForSku } = require('../../lib/sku-image');
const fs = require('fs');

const SKU = 'EL83771';
const IMAGE_URL = 'https://cdn.elimfilters.com/EL8/EL83771.png';
const APPLY = process.argv.includes('--execute');
const idx = process.argv.indexOf('--snapshot');
const SNAPSHOT = idx >= 0 ? process.argv[idx + 1] : null;

async function verifyImage() {
  const response = await fetch(IMAGE_URL, { method: 'GET', signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw Error('IMAGE_HTTP_' + response.status);
  if (!String(response.headers.get('content-type') || '').toLowerCase().startsWith('image/png'))
    throw Error('IMAGE_CONTENT_TYPE_INVALID');
  const head = new Uint8Array(await response.arrayBuffer());
  if (head.length < 8 || ![137,80,78,71,13,10,26,10].every((v,i) => head[i] === v))
    throw Error('IMAGE_PNG_SIGNATURE_INVALID');
  return { status: response.status, bytes: head.byteLength };
}
async function main() {
  if (imageUrlForSku(IMAGE_URL, SKU) !== IMAGE_URL) throw Error('SKU_IMAGE_POLICY_BLOCKED');
  const image = await verifyImage(); // fail before touching the database
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw Error('CATALOG_DATABASE_URL_MISSING');
  const db = new Client({connectionString:url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : {rejectUnauthorized:false}});
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query("SET LOCAL lock_timeout='5s'");
    await db.query("SET LOCAL statement_timeout='45s'");
    const before = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!before) throw Error('SKU_NOT_FOUND');
    if (before.catalog_active !== true) throw Error('SKU_NOT_ACTIVE');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(before,null,2));
    const others = await db.query("SELECT md5(string_agg(md5(to_jsonb(c)::text),'|' ORDER BY sku)) AS hash FROM public.elimfilters_catalog c WHERE sku<>$1",[SKU]);
    if (before.image_url !== IMAGE_URL) {
      await db.query('UPDATE public.elimfilters_catalog SET image_url=$2 WHERE sku=$1', [SKU, IMAGE_URL]);
    }
    const after = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    const afterOthers = await db.query("SELECT md5(string_agg(md5(to_jsonb(c)::text),'|' ORDER BY sku)) AS hash FROM public.elimfilters_catalog c WHERE sku<>$1",[SKU]);
    if (JSON.stringify({...before,image_url:IMAGE_URL}) !== JSON.stringify(after)) throw Error('OTHER_FIELDS_CHANGED');
    if (others.rows[0].hash !== afterOthers.rows[0].hash) throw Error('OTHER_SKUS_CHANGED');
    if (after.image_url !== IMAGE_URL) throw Error('IMAGE_POSTCHECK_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({sku:SKU,mode:APPLY?'execute':'dry-run',transaction:APPLY?'COMMIT':'ROLLBACK',image_url:IMAGE_URL,image,previous_image_url:before.image_url,changed:before.image_url!==IMAGE_URL,other_fields_unchanged:true,other_skus_unchanged:true},null,2));
  } catch(error) { await db.query('ROLLBACK').catch(()=>{}); throw error; }
  finally {await db.end();}
}
if(require.main===module) main().catch(e=>{console.error('NO_GO:',e.message);process.exitCode=1;});
module.exports={SKU,IMAGE_URL};
