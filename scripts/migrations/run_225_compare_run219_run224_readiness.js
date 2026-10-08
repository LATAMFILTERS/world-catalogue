'use strict';

require('dotenv').config();
const {Client}=require('pg');
const {sslConfigFor}=require('../../lib/catalog-db-ssl');
const {
  normalizeCode,
  normalizeManufacturer,
  governanceFrom,
  lastFourNumeric,
}=require('../../lib/catalog-codigo-base-policy');

function prefixFor(sku=''){
  const s=String(sku).toUpperCase();
  for(const p of ['EA1','EA2','EF9','EL8','EH6']) if(s.startsWith(p)) return p;
  return null;
}
function expectedSkuFromCode(sku,code){
  const p=prefixFor(sku),s=lastFourNumeric(code);
  return p&&s?p+s:null;
}
function refs(v){
  if(!Array.isArray(v))return [];
  return v.map(x=>({
    code:String(x?.code||x?.reference||x||'').trim(),
    manufacturer:normalizeManufacturer(x?.manufacturer||x?.brand||x?.oem||'')
  })).filter(x=>x.code);
}
function evidenceKey(e){return normalizeManufacturer(e.manufacturer)+'|'+normalizeCode(e.reference_code);}
function officialKind(v=''){
  const s=String(v).toUpperCase();
  return s.includes('OFFICIAL')||s.includes('MANUFACTURER');
}

(async()=>{
  const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
  if(!url)throw new Error('DB URL missing');
  const db=new Client({connectionString:url,ssl:sslConfigFor(url)});
  await db.connect();

  try{
    const rows=(await db.query(`
      SELECT *
      FROM public.elimfilters_catalog
      WHERE catalog_active=true
        AND (sku LIKE 'EA1%' OR sku LIKE 'EA2%' OR sku LIKE 'EF9%' OR sku LIKE 'EL8%' OR sku LIKE 'EH6%')
      ORDER BY sku
    `)).rows;

    const bySku=new Map(rows.map(r=>[String(r.sku).toUpperCase(),r]));
    const malformed=rows.map(r=>({...r,natural_target:expectedSkuFromCode(r.sku,r.codigo_base||r.canonical_source_code)}))
      .filter(r=>r.natural_target&&r.natural_target!==String(r.sku).toUpperCase());

    const groups=new Map();
    for(const r of malformed){
      if(!groups.has(r.natural_target))groups.set(r.natural_target,[]);
      groups.get(r.natural_target).push(r);
    }

    const collisionRows=[];
    for(const [target,sources] of groups){
      const occupied=bySku.get(target)||null;
      if(sources.length>1||occupied){
        for(const source of sources)collisionRows.push({source,target,occupied,source_count:sources.length});
      }
    }

    const skuList=collisionRows.map(x=>x.source.sku);
    const ledger=skuList.length?(await db.query(`
      SELECT sku,evidence_kind,authority,manufacturer,reference_code,source_url,verified_at,metadata
      FROM public.catalog_codigo_base_evidence
      WHERE sku=ANY($1::text[])
      ORDER BY sku,verified_at DESC,id DESC
    `,[skuList])).rows:[];

    const ledgerBySku=new Map();
    for(const e of ledger){
      if(!ledgerBySku.has(e.sku))ledgerBySku.set(e.sku,[]);
      ledgerBySku.get(e.sku).push(e);
    }

    const rowsOut=[];

    for(const item of collisionRows){
      const r=item.source;
      if(String(r.duty||'').toUpperCase()!=='HEAVY_DUTY')continue;

      const gov=governanceFrom(r);
      const donaldsonPrimary=gov.primary_manufacturer_verified===true
        && normalizeManufacturer(r.canonical_source_brand)==='DONALDSON'
        && normalizeCode(r.canonical_source_code);
      if(!donaldsonPrimary)continue;

      const evidence=(ledgerBySku.get(r.sku)||[]).filter(e=>officialKind(e.evidence_kind));
      const evidenceSet=new Set(evidence.map(evidenceKey));

      const fg219=refs(r.competitor_codes)
        .filter(x=>x.manufacturer==='FLEETGUARD'&&evidenceSet.has('FLEETGUARD|'+normalizeCode(x.code)));

      const fg224=[...new Map(
        refs(r.competitor_codes)
          .filter(x=>x.manufacturer==='FLEETGUARD'&&evidenceSet.has('FLEETGUARD|'+normalizeCode(x.code)))
          .map(x=>[normalizeCode(x.code),x])
      ).values()];

      const collision219=Boolean(
        item.occupied &&
        normalizeCode(item.occupied.codigo_base)!==normalizeCode(r.codigo_base) &&
        normalizeCode(item.occupied.canonical_source_code)!==normalizeCode(r.canonical_source_code)
      );

      const run219Ready=Boolean(
        collision219 &&
        fg219.length===1 &&
        expectedSkuFromCode(r.sku,fg219[0].code) &&
        !bySku.get(expectedSkuFromCode(r.sku,fg219[0].code))
      );

      const collision224=Boolean(
        item.occupied &&
        normalizeCode(item.occupied.codigo_base)!==normalizeCode(r.codigo_base) &&
        normalizeCode(item.occupied.canonical_source_code)!==normalizeCode(r.canonical_source_code)
      );

      const run224Ready=Boolean(
        item.occupied &&
        collision224 &&
        fg224.length===1 &&
        expectedSkuFromCode(r.sku,fg224[0].code) &&
        !bySku.get(expectedSkuFromCode(r.sku,fg224[0].code))
      );

      if(run219Ready||run224Ready){
        rowsOut.push({
          sku:r.sku,
          codigo_base:r.codigo_base,
          natural_target:item.target,
          occupied:item.occupied?{sku:item.occupied.sku,codigo_base:item.occupied.codigo_base,canonical_source_code:item.occupied.canonical_source_code}:null,
          source_count:item.source_count,
          fg219_codes:fg219.map(x=>x.code),
          fg224_codes:fg224.map(x=>x.code),
          final_target_219:fg219.length===1?expectedSkuFromCode(r.sku,fg219[0].code):null,
          final_target_224:fg224.length===1?expectedSkuFromCode(r.sku,fg224[0].code):null,
          run219_ready:run219Ready,
          run224_ready:run224Ready
        });
      }
    }

    const only219=rowsOut.filter(x=>x.run219_ready&&!x.run224_ready);
    const only224=rowsOut.filter(x=>!x.run219_ready&&x.run224_ready);
    const both=rowsOut.filter(x=>x.run219_ready&&x.run224_ready);

    console.log(JSON.stringify({
      migration:'225_COMPARE_RUN219_RUN224_READINESS',
      transaction:'READ_ONLY',
      summary:{
        run219_ready:rowsOut.filter(x=>x.run219_ready).length,
        run224_ready:rowsOut.filter(x=>x.run224_ready).length,
        both_ready:both.length,
        only_run219:only219.length,
        only_run224:only224.length,
        only_run219_rows:only219,
        only_run224_rows:only224
      }
    },null,2));
  }finally{
    await db.end();
  }
})().catch(e=>{console.error(e.stack||e);process.exit(1);});
