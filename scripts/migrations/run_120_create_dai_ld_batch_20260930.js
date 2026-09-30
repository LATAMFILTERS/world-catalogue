'use strict';

const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const MIGRATION = '120_CREATE_DAI_LD_BATCH_20260930';

const PRODUCTS = [
  {
    sku:'EL31955', base:'CH11955', sourceBrand:'FRAM', filter_type:'oil',
    sub_type:'Oil Filter, Cartridge', technology:'SYNTRAX™',
    source_url:'https://www.partsgeek.com/wsq4ncr-ford-f150-engine-oil-filter-kit.html',
    specs:{height_mm:137, outer_diameter_mm:49},
    oem:[
      ['FORD','FT4Z-6731-A'],['MOTORCRAFT','FL-2062'],['MOTORCRAFT','FL-2062A'],
      ['FORD','FT4E-6714-AA'],['FORD','KU2Z-6731-A'],['FORD','KR3Z-6731-A']
    ],
    competitors:[
      ['WIX','WL10050'],['PUROLATOR','L38154'],['BALDWIN','P40033'],
      ['STP','S11955'],['MOBIL 1','M1C-351A'],['NAPA','100050']
    ],
    applications:[
      {make:'FORD',model:'F-150',engine:'2.7L EcoBoost',year_from:'2015',year_to:'2025'},
      {make:'FORD',model:'EDGE',engine:'2.7L EcoBoost',year_from:'2015',year_to:'2024'},
      {make:'FORD',model:'EXPLORER',engine:'3.0L EcoBoost',year_from:'2020',year_to:'2025'},
      {make:'FORD',model:'BRONCO',engine:'2.7L / 3.0L',year_from:'2021',year_to:'2025'},
      {make:'FORD',model:'MUSTANG',engine:'5.2L',year_from:'2017',year_to:'2022'}
    ]
  },
  {
    sku:'EL32478', base:'CH12478', sourceBrand:'FRAM', filter_type:'oil',
    sub_type:'Oil Filter, Cartridge', technology:'SYNTRAX™',
    source_url:'https://br.ufi-aftermarket.com/wp-content/uploads/sites/10/2023/11/UFI_PC_Product_News_09_2022.pdf',
    specs:{height_mm:60, outer_diameter_mm:71, inner_diameter_mm:20},
    oem:[['HYUNDAI','26320-2U000'],['KIA','26320-2U000']],
    competitors:[
      ['BOSCH','F026407308'],['BOSCH','P7308'],['HENGST','E1157HD684'],
      ['MAHLE/KNECHT','OX1077'],['MAHLE/KNECHT','OX1077D'],['PURFLUX','L1145'],
      ['UFI','25.268.00'],['TECNOCAR','OP1085']
    ],
    applications:[
      {make:'HYUNDAI',model:'i30 (PD/PDE)',engine:'1.6 CRDi'},
      {make:'HYUNDAI',model:'i30 Fastback (PDE)',engine:'1.6 CRDi'},
      {make:'HYUNDAI',model:'i40 (VF)',engine:'1.6 CRDi'},
      {make:'HYUNDAI',model:'KONA',engine:'1.6 CRDi'},
      {make:'HYUNDAI',model:'TUCSON II / III',engine:'1.6 CRDi'},
      {make:'KIA',model:'CEED (CD)',engine:'1.6 CRDi'},
      {make:'KIA',model:'PROCEED (CD)',engine:'1.6 CRDi'},
      {make:'KIA',model:'SPORTAGE IV / V',engine:'1.6 CRDi'},
      {make:'KIA',model:'STONIC (YB)',engine:'1.6 CRDi'},
      {make:'KIA',model:'XCEED (CD)',engine:'1.6 CRDi'}
    ]
  },
  {
    sku:'EL31934', base:'CH11934', sourceBrand:'FRAM', filter_type:'oil',
    sub_type:'Oil Filter, Cartridge', technology:'SYNTRAX™',
    source_url:'https://www.fram.com/fram-extra-guard-oil-filter-cartridge-ch11934',
    specs:{height_mm:82.98, outer_diameter_mm:65.48, inner_diameter_mm:27.99, filter_media:'Cellulose/Synthetic Blend'},
    oem:[['HYUNDAI','26320-3CKB0'],['KIA','26320-3CKB0']],
    competitors:[
      ['WIX','WL10033'],['PUROLATOR','L18179'],['BALDWIN','P40143'],
      ['DENSO','150-3105'],['MAHLE/KNECHT','OX355D'],['LUBER-FINER','P1026'],
      ['MOBIL 1','M1C-156A'],['NAPA','100033'],['PREMIUM GUARD','PG99016']
    ],
    applications:[
      {make:'HYUNDAI',model:'GENESIS',engine:'3.8L',year_from:'2015',year_to:'2016'},
      {make:'GENESIS',model:'G80',engine:'3.8L',year_from:'2017',year_to:'2020'},
      {make:'KIA',model:'CADENZA',engine:'3.3L',year_from:'2017',year_to:'2020'},
      {make:'KIA',model:'SEDONA',engine:'3.3L',year_from:'2019',year_to:'2021'},
      {make:'KIA',model:'SORENTO',engine:'3.3L',year_from:'2019',year_to:'2020'},
      {make:'HYUNDAI',model:'PALISADE',engine:'3.8L',year_from:'2020',year_to:'2025'},
      {make:'KIA',model:'TELLURIDE',engine:'3.8L',year_from:'2020',year_to:'2025'}
    ]
  },
  {
    sku:'EL32824', base:'CH12824ECO', sourceBrand:'FRAM', filter_type:'oil',
    sub_type:'Oil Filter, Cartridge', technology:'SYNTRAX™',
    source_url:'https://www.kmotorshop.com/en/article-detail/view/399445',
    specs:{height_mm:143.5, outer_diameter_mm:55.2, inner_diameter_mm:25.5},
    oem:[
      ['HYUNDAI','26320-2R000'],['HYUNDAI','26320-2R001'],
      ['KIA','26320-2R000'],['KIA','26320-2R001'],['GENESIS','26320-2R001']
    ],
    competitors:[
      ['BOSCH','F026407360'],['WIX','WL7596'],['HENGST','E1178HD744'],
      ['MAHLE/KNECHT','OX1351D'],['PURFLUX','L1175'],['FILTRON','OE680/1'],
      ['UFI','25.291.00'],['BLUE PRINT','ADBP210103'],['AMC','FOF10002'],
      ['COOPERSFIAAM','FA6884ECO']
    ],
    applications:[
      {make:'HYUNDAI',model:'SANTA FE IV (TM/TMA)',engine:'2.2 CRDi D4HE/D4HH',year_from:'2020',year_to:'2023'},
      {make:'KIA',model:'SORENTO IV (MQ4/MQ4A)',engine:'2.2 CRDi D4HE',year_from:'2020',year_to:'2026'},
      {make:'KIA',model:'CARNIVAL IV (KA4)',engine:'2.2 CRDi D4HE',year_from:'2020',year_to:'2026'},
      {make:'GENESIS',model:'G80 (RG3)',engine:'2.2 CRDi D4HF',year_from:'2020',year_to:'2024'},
      {make:'GENESIS',model:'GV70 (JK1)',engine:'2.2 CRDi D4HF',year_from:'2021',year_to:'2024'},
      {make:'HYUNDAI',model:'TUCSON (NX4)',engine:'2.0 CRDi D4HD',year_from:'2020',year_to:'2025'},
      {make:'KIA',model:'SPORTAGE (NQ5)',engine:'2.0 CRDi D4HD',year_from:'2021',year_to:'2025'}
    ]
  },
  {
    sku:'EC39882', base:'CF9882', sourceBrand:'FRAM', filter_type:'cabin',
    sub_type:'Cabin Air Filter', technology:'MICROKAPPA™',
    source_url:'https://fram.co.za/wp-content/uploads/pdftemp/Part_CF9882_fe8c8b67338bd468fe1f52fa51e2be50.pdf',
    specs:{length_mm:220, width_mm:200, height_mm:30},
    oem:[
      ['NISSAN','27277-4M400'],['NISSAN','27891-BM400'],['NISSAN','27891-BM401'],
      ['NISSAN','27891-BM401-KE'],['NISSAN','27891-BM410'],['NISSAN','B727A-79925']
    ],
    competitors:[
      ['MANN-FILTER','CU22003'],['MANN-FILTER','CU2345'],['WIX','WP9294'],
      ['RYCO','RCA113P'],['MICRONAIR','MP063'],['BOSCH','1-987-431-075'],
      ['BOSCH','1-987-432-075']
    ],
    applications:[
      {make:'NISSAN',model:'ALMERA (N16)',year_from:'2000',year_to:'2006'},
      {make:'NISSAN',model:'ALMERA TINO',year_from:'2000',year_to:'2006'},
      {make:'NISSAN',model:'PRIMERA (P12)',year_from:'2002',year_to:'2008'},
      {make:'NISSAN',model:'X-TRAIL (T30)',year_from:'2001',year_to:'2007'}
    ]
  },
  {
    sku:'EA33603', base:'OK6B0-23-603', sourceBrand:'KIA', filter_type:'air',
    sub_type:'Engine Air Filter', technology:'MACROCORE™',
    source_url:'https://azfilter.jp/catalogue/498313',
    specs:{height_mm:245, height_secondary_mm:231, outer_diameter_mm:178, inner_diameter_mm:110},
    oem:[
      ['KIA','OK6B0-23-603'],['KIA','0K6B0-23603'],['KIA','OK6B023603Y'],
      ['HYUNDAI/KIA','0K6B0-23603AS']
    ],
    competitors:[
      ['FLEETGUARD','AF1947'],['BALDWIN','PA2549'],['SAKURA','A-2935'],
      ['JS ASAKASHI','A9615'],['BLUE PRINT','ADG022122'],['AMC','KA-1567'],
      ['MECAFILTER','EL9483']
    ],
    applications:[
      {make:'KIA',model:'BONGO',engine:'2.7L J2',year_from:'2004',year_to:'2012'},
      {make:'KIA',model:'K2700',engine:'2.7L J2',year_from:'1999',year_to:'2026'},
      {make:'KIA',model:'K3000S',engine:'3.0L JT',year_from:'2004',year_to:'2026'},
      {make:'KIA',model:'K3600',engine:'3.6L SH',year_from:'1999',year_to:'2004'}
    ],
    oemFallback:true,
    absence_evidence:[
      'FRAM catalogue/web search performed under HERMES workflow; no direct FRAM product publication was validated for KIA OK6B0-23-603.',
      'OEM identity and dimensions corroborated by AZUMI A13615 and KIA catalogue aggregations.'
    ]
  }
];

const jsonColumns = new Set([
  'oem_codes','competitor_codes','equipment_applications','vehicle_applications',
  'specs','brand_crossrefs','alternative_products','alternatives',
  'canonical_evidence','duty_evidence','enrichment_data'
]);

function sha(value){ return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function sslFor(url){
  const host=new URL(url).hostname.toLowerCase();
  return ['127.0.0.1','localhost','::1'].includes(host)?false:{rejectUnauthorized:false};
}
function norm(v){ return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,''); }
function codeRows(items, classification, sourceUrl){
  return items.map(([manufacturer,code])=>({manufacturer,code,classification,source_url:sourceUrl}));
}
function governance(p){
  if(p.oemFallback){
    return {
      policy_version:'2026-08-29-regional-v3.2',
      state:'CANONICAL_VERIFIED',
      governance_state:'CANONICAL_VERIFIED',
      origin_group:'NON_EUROPEAN',
      primary_manufacturer_verified:false,
      fram_absence_verified:true,
      fallback_manufacturer_verified:true,
      fallback_commercial_code_verified:true,
      approved_manufacturer:p.sourceBrand,
      approved_codigo_base:p.base,
      approved_source_column:'OEM_CODES',
      required_authority:'VERIFIED_OEM_FALLBACK_AFTER_FRAM_ABSENCE',
      verification_method:'HERMES_OEM_IDENTITY_PLUS_FRAM_ABSENCE_CHECK',
      evidence_url:p.source_url,
      evidence_note:(p.absence_evidence||[]).join(' ')
    };
  }
  return {
    policy_version:'2026-08-29-regional-v3.2',
    state:'CANONICAL_VERIFIED',
    governance_state:'CANONICAL_VERIFIED',
    origin_group:'NON_EUROPEAN',
    primary_manufacturer_verified:true,
    approved_manufacturer:'FRAM',
    approved_codigo_base:p.base,
    approved_source_column:'CANONICAL_POLICY',
    required_authority:'FRAM_REGIONAL_CANONICAL',
    evidence_url:p.source_url
  };
}
function buildRow(p){
  const oem=codeRows(p.oem,'OEM',p.source_url)
    .filter(x=>norm(x.code)!==norm(p.base));
  const competitors=codeRows(p.competitors,'AFTERMARKET',p.source_url)
    .filter(x=>norm(x.code)!==norm(p.base));
  const evidenceHash=sha({sku:p.sku,base:p.base,oem,competitors,specs:p.specs,applications:p.applications});
  const row={
    sku:p.sku,codigo_base:p.base,
    name:p.sub_type,
    description:`ELIMFILTERS® ${p.sku} ${p.sub_type}. Governed canonical base: ${p.sourceBrand} ${p.base}.`,
    filter_type:p.filter_type,sub_type:p.sub_type,technology:p.technology,
    height_mm:p.specs.height_mm||null,
    outer_diameter_mm:p.specs.outer_diameter_mm||null,
    filter_media:p.specs.filter_media||null,
    duty:'LIGHT_DUTY',
    oem_codes:oem,competitor_codes:competitors,
    equipment_applications:[],vehicle_applications:[],
    specs:p.specs,brand_crossrefs:{},alternative_products:[],alternatives:[],
    is_primary:true,
    canonical_source_brand:p.sourceBrand,
    canonical_source_code:p.base,
    canonical_source_url:p.source_url,
    canonical_source_status:'VERIFIED',
    canonical_verified_at:'2026-09-30T00:00:00.000Z',
    canonical_evidence:{migration:MIGRATION,evidence_hash:evidenceHash,source_url:p.source_url},
    duty_source_brand:'ELIMFILTERS_HERMES',
    duty_source_url:p.source_url,
    duty_validation_status:'VERIFIED',
    duty_verified_at:'2026-09-30T00:00:00.000Z',
    duty_evidence:{duty:'LIGHT_DUTY',origin_group:'NON_EUROPEAN',migration:MIGRATION},
    enrichment_data:{
      codigo_base_governance:governance(p),
      evidence_source:'HERMES_DAI_LD_BATCH_2026_09_30'
    }
  };
  return {row,evidenceHash,oem,competitors};
}

async function upsertProduct(client,p,report){
  const built=buildRow(p);
  const row=built.row;
  const validation=assertCanonicalWrite(row);
  const conflicts=await client.query(
    'SELECT sku,codigo_base,canonical_source_code FROM public.elimfilters_catalog WHERE sku=$1 OR upper(regexp_replace(coalesce(codigo_base,\'\'),\'[^A-Z0-9]\',\'\',\'g\'))=$2 OR upper(regexp_replace(coalesce(canonical_source_code,\'\'),\'[^A-Z0-9]\',\'\',\'g\'))=$2 FOR UPDATE',
    [p.sku,norm(p.base)]
  );
  const other=conflicts.rows.filter(r=>r.sku!==p.sku);
  if(other.length) throw new Error(`CANONICAL_SOURCE_ALREADY_OWNED ${p.sku} ${JSON.stringify(other)}`);

  const existing=conflicts.rows.find(r=>r.sku===p.sku);
  if(!existing){
    const cols=Object.keys(row);
    const values=cols.map(k=>jsonColumns.has(k)?JSON.stringify(row[k]):row[k]);
    const placeholders=cols.map((k,i)=>'$'+(i+1)+(jsonColumns.has(k)?'::jsonb':''));
    const sql='INSERT INTO public.elimfilters_catalog ('+cols.map(k=>'"'+k+'"').join(',')+') VALUES ('+placeholders.join(',')+')';
    await client.query(sql,values);
    report.inserted.push(p.sku);
  } else {
    const baseMatches=norm(existing.codigo_base)===norm(p.base) || norm(existing.canonical_source_code)===norm(p.base);
    if(!baseMatches){
      throw new Error('SKU_IDENTITY_CONFLICT '+p.sku+' existing='+JSON.stringify(existing)+' expected='+p.base);
    }
    report.existing.push(p.sku);
  }

  await client.query(
    `INSERT INTO catalog_codigo_base_evidence
      (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),$9::jsonb)
     ON CONFLICT DO NOTHING`,
    [
      p.sku,p.oemFallback?'OEM_FALLBACK':'CROSS_REFERENCE',
      p.oemFallback?'OEM_VERIFIED_AFTER_FRAM_ABSENCE':'FRAM_REGIONAL_CANONICAL',
      p.sourceBrand,p.base,norm(p.base),p.source_url,built.evidenceHash,
      JSON.stringify({migration:MIGRATION,sku:p.sku,origin_group:'NON_EUROPEAN'})
    ]
  );

  const appResult=await applyVerifiedApplications(client,{
    sku:p.sku,
    equipment_applications:[],
    vehicle_applications:p.applications,
    evidence:{
      authority:p.oemFallback?'OEM_APPLICATION_EVIDENCE':'FRAM_AND_CROSS_VALIDATED_APPLICATION_EVIDENCE',
      source_url:p.source_url,
      evidence_hash:sha(p.applications),
      metadata:{migration:MIGRATION,canonical_base:p.base}
    }
  });
  report.applications[p.sku]=appResult;
  await client.query('SELECT refresh_crossref_cache_sku($1)',[p.sku]);
  report.validations[p.sku]=validation;
}

async function applyDaiLdBatch20260930(){
  const databaseUrl=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const client=new Client({connectionString:databaseUrl,ssl:sslFor(databaseUrl)});
  const report={migration:MIGRATION,inserted:[],existing:[],applications:{},validations:{},products:PRODUCTS.map(p=>p.sku)};
  await client.connect();
  try{
    await client.query('BEGIN');
    const legacy=await client.query(
      "SELECT count(*)::int n FROM public.elimfilters_catalog WHERE left(upper(sku),3)=ANY($1::text[])",
      [['EA5','EC5','EF5','EL5']]
    );
    if(legacy.rows[0].n!==0) throw new Error('RETIRED_LD_PREFIX_ROWS_PRESENT');

    for(const p of PRODUCTS) await upsertProduct(client,p,report);

    const audit=await client.query(
      'SELECT sku,codigo_base,duty,filter_type,technology FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku',
      [PRODUCTS.map(p=>p.sku)]
    );
    if(audit.rowCount!==PRODUCTS.length) throw new Error(`DAI_BATCH_INCOMPLETE expected=${PRODUCTS.length} got=${audit.rowCount}`);
    report.audit=audit.rows;
    await client.query('COMMIT');
    report.transaction='COMMIT';
    return report;
  }catch(error){
    try{await client.query('ROLLBACK');}catch(_){}
    report.transaction='ROLLBACK';
    report.error=error.message;
    throw error;
  }finally{
    await client.end();
  }
}

if(require.main===module){
  applyDaiLdBatch20260930()
    .then(report=>console.log('[dai-ld-batch-20260930]',JSON.stringify(report,null,2)))
    .catch(error=>{console.error('[dai-ld-batch-20260930] failed',error.stack||error.message);process.exit(1);});
}

module.exports={MIGRATION,PRODUCTS,buildRow,applyDaiLdBatch20260930};
+(i+1)+(jsonColumns.has(k)?'::jsonb':''));
    const sql='INSERT INTO public.elimfilters_catalog ('+cols.map(k=>'"'+k+'"').join(',')+') VALUES ('+placeholders.join(',')+')';
    await client.query(sql,values);
    report.inserted.push(p.sku);
  } else {
    const baseMatches=norm(existing.codigo_base)===norm(p.base) || norm(existing.canonical_source_code)===norm(p.base);
    if(!baseMatches){
      throw new Error(`SKU_IDENTITY_CONFLICT ${p.sku} existing=${JSON.stringify(existing)} expected=${p.base}`);
    }
    report.existing.push(p.sku);
  }

  await client.query(
    `INSERT INTO catalog_codigo_base_evidence
      (sku,evidence_kind,authority,manufacturer,reference_code,normalized_reference,source_url,evidence_hash,verified_at,metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now(),$9::jsonb)
     ON CONFLICT DO NOTHING`,
    [
      p.sku,p.oemFallback?'OEM_FALLBACK':'CROSS_REFERENCE',
      p.oemFallback?'OEM_VERIFIED_AFTER_FRAM_ABSENCE':'FRAM_REGIONAL_CANONICAL',
      p.sourceBrand,p.base,norm(p.base),p.source_url,built.evidenceHash,
      JSON.stringify({migration:MIGRATION,sku:p.sku,origin_group:'NON_EUROPEAN'})
    ]
  );

  const appResult=await applyVerifiedApplications(client,{
    sku:p.sku,
    equipment_applications:[],
    vehicle_applications:p.applications,
    evidence:{
      authority:p.oemFallback?'OEM_APPLICATION_EVIDENCE':'FRAM_AND_CROSS_VALIDATED_APPLICATION_EVIDENCE',
      source_url:p.source_url,
      evidence_hash:sha(p.applications),
      metadata:{migration:MIGRATION,canonical_base:p.base}
    }
  });
  report.applications[p.sku]=appResult;
  await client.query('SELECT refresh_crossref_cache_sku($1)',[p.sku]);
  report.validations[p.sku]=validation;
}

async function applyDaiLdBatch20260930(){
  const databaseUrl=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;
  if(!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  const client=new Client({connectionString:databaseUrl,ssl:sslFor(databaseUrl)});
  const report={migration:MIGRATION,inserted:[],existing:[],applications:{},validations:{},products:PRODUCTS.map(p=>p.sku)};
  await client.connect();
  try{
    await client.query('BEGIN');
    const legacy=await client.query(
      "SELECT count(*)::int n FROM public.elimfilters_catalog WHERE left(upper(sku),3)=ANY($1::text[])",
      [['EA5','EC5','EF5','EL5']]
    );
    if(legacy.rows[0].n!==0) throw new Error('RETIRED_LD_PREFIX_ROWS_PRESENT');

    for(const p of PRODUCTS) await upsertProduct(client,p,report);

    const audit=await client.query(
      'SELECT sku,codigo_base,duty,filter_type,technology FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) ORDER BY sku',
      [PRODUCTS.map(p=>p.sku)]
    );
    if(audit.rowCount!==PRODUCTS.length) throw new Error(`DAI_BATCH_INCOMPLETE expected=${PRODUCTS.length} got=${audit.rowCount}`);
    report.audit=audit.rows;
    await client.query('COMMIT');
    report.transaction='COMMIT';
    return report;
  }catch(error){
    try{await client.query('ROLLBACK');}catch(_){}
    report.transaction='ROLLBACK';
    report.error=error.message;
    throw error;
  }finally{
    await client.end();
  }
}

if(require.main===module){
  applyDaiLdBatch20260930()
    .then(report=>console.log('[dai-ld-batch-20260930]',JSON.stringify(report,null,2)))
    .catch(error=>{console.error('[dai-ld-batch-20260930] failed',error.stack||error.message);process.exit(1);});
}

module.exports={MIGRATION,PRODUCTS,buildRow,applyDaiLdBatch20260930};
