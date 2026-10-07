'use strict';

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');

const TARGETS = {
  UC16183: { sku: 'EF90094', codigo_base: 'P550094', evidence_chain: ['JOHN_DEERE_UC16183','WIX_33011','DONALDSON_P550094'] },
  UC21217: { sku: 'EF90094', codigo_base: 'P550094', evidence_chain: ['JOHN_DEERE_UC21217','WIX_33001','DONALDSON_P550094'] },
  MIU13224: { sku: 'EF91760', codigo_base: 'P551760', evidence_chain: ['JOHN_DEERE_MIU13224','KOHLER_2405003S','DONALDSON_P551760'] },
};

function norm(v) { return String(v || '').replace(/[^A-Z0-9]/gi,'').toUpperCase(); }
function removeCode(arr, code) {
  const n=norm(code);
  return (Array.isArray(arr)?arr:[]).filter(x=>norm(x && x.code)!==n);
}
function ensureOem(arr, code) {
  const out=removeCode(arr, code);
  out.push({ manufacturer:'JOHN-DEERE', code, classification:'OEM' });
  return out;
}

async function main() {
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url) throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}});
  await db.connect();
  const report={mode:APPLY?'execute':'dry-run',updated:{},verified:{}};
  try{
    await db.query('BEGIN');
    for(const [code,target] of Object.entries(TARGETS)){
      const row=(await db.query(
        'SELECT sku,codigo_base,oem_codes,competitor_codes,enrichment_data FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE',
        [target.sku]
      )).rows[0];
      if(!row || norm(row.codigo_base)!==norm(target.codigo_base)) throw new Error(code+'_TARGET_IDENTITY_MISMATCH');

      // Remove this exact OEM from every non-canonical row so Part Search resolves uniquely.
      const dupes=(await db.query(
        "SELECT sku,oem_codes,competitor_codes FROM public.elimfilters_catalog WHERE sku<>$1 AND EXISTS (SELECT 1 FROM jsonb_array_elements(COALESCE(oem_codes,'[]'::jsonb)||COALESCE(competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))=$2) FOR UPDATE",
        [target.sku,norm(code)]
      )).rows;
      for(const d of dupes){
        await db.query(
          'UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb,competitor_codes=$2::jsonb WHERE sku=$3',
          [JSON.stringify(removeCode(d.oem_codes,code)),JSON.stringify(removeCode(d.competitor_codes,code)),d.sku]
        );
      }

      const nextOem=ensureOem(row.oem_codes,code);
      const nextComp=removeCode(row.competitor_codes,code);
      const enrichment={...(row.enrichment_data||{})};
      enrichment.john_deere_z900_resolution={
        ...(enrichment.john_deere_z900_resolution||{}),
        [code]:{status:'VERIFIED_EQUIVALENCE_CHAIN',evidence_chain:target.evidence_chain,verified_at:'2026-10-06'}
      };
      await db.query(
        'UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb,competitor_codes=$2::jsonb,enrichment_data=$3::jsonb WHERE sku=$4',
        [JSON.stringify(nextOem),JSON.stringify(nextComp),JSON.stringify(enrichment),target.sku]
      );
      report.updated[code]={sku:target.sku,codigo_base:target.codigo_base,duplicates_removed:dupes.length};
    }

    for(const [code,target] of Object.entries(TARGETS)){
      const rows=(await db.query(
        "SELECT DISTINCT c.sku,c.codigo_base FROM public.elimfilters_catalog c CROSS JOIN LATERAL jsonb_array_elements(COALESCE(c.oem_codes,'[]'::jsonb)||COALESCE(c.competitor_codes,'[]'::jsonb)) x WHERE upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g'))=$1 ORDER BY c.sku",
        [norm(code)]
      )).rows;
      report.verified[code]=rows;
      if(rows.length!==1 || rows[0].sku!==target.sku) throw new Error(code+'_NOT_UNIQUE');
    }

    if(APPLY){await db.query('COMMIT');report.transaction='COMMIT';}
    else {await db.query('ROLLBACK');report.transaction='ROLLBACK';}
    console.log(JSON.stringify(report,null,2));
  }catch(e){
    try{await db.query('ROLLBACK');}catch(_){}
    throw e;
  }finally{await db.end();}
}
main().catch(e=>{console.error(e.stack||e);process.exit(1);});
