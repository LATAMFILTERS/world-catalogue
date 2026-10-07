'use strict';
require('dotenv').config();
const {Client}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway');
const APPLY=process.argv.includes('--execute');
const SKU='EH65409', BASE='1365409';
const JD='https://shop.deere.com/us/product/MIA881446%3A-Transmission-Oil-Filter-with-Packing/p/MIA881446';
const TT='https://outdoorpowerdirect.com/products/tuff-torq-1a637026450-transmission-filter';
const row={
  sku:SKU,codigo_base:BASE,name:'Transmission Oil Filter',
  description:'ELIMFILTERS® EH65409 hydrostatic transmission oil filter. John Deere MIA881446 / AM131102; verified OEM equivalent Toro 1365409.',
  filter_type:'hydraulic',sub_type:'Transmission Oil Filter',technology:'NANOFORCE™',
  installation_type:'Cartridge',duty:'HEAVY_DUTY',
  oem_codes:[
    {manufacturer:'JOHN-DEERE',code:'MIA881446',classification:'OEM',source_url:JD},
    {manufacturer:'JOHN-DEERE',code:'AM131102',classification:'OEM',source_url:JD},
    {manufacturer:'TUFF-TORQ',code:'1A637026450',classification:'OEM',source_url:TT},
    {manufacturer:'SNAPPER',code:'1720806',classification:'OEM',source_url:TT},
    {manufacturer:'SIMPLICITY',code:'1687472YP',classification:'OEM',source_url:TT}
  ],
  competitor_codes:[
    {manufacturer:'HIFI',code:'SH70118',classification:'AFTERMARKET'},
    {manufacturer:'SF',code:'HY80029',classification:'AFTERMARKET'}
  ],
  equipment_applications:[],vehicle_applications:[],specs:{},
  brand_crossrefs:{},alternative_products:[],alternatives:[],is_primary:true,
  canonical_source_brand:'TORO',canonical_source_code:BASE,
  canonical_source_url:'https://www.tractorsupply.com/tsc/product/hero-hydraulic-filter-replaces-john-deere-mia881446-crosses-toro-1365409-tuff-torq-1a637026450',canonical_source_status:'VERIFIED',
  enrichment_data:{codigo_base_governance:{
    policy_version:'2026-10-06-v4.2',state:'CANONICAL_VERIFIED',
    primary_manufacturer_verified:false,donaldson_absence_verified:true,
    fleetguard_absence_verified:true,fallback_manufacturer_verified:true,
    fallback_commercial_code_verified:true,approved_manufacturer:'TORO',
    approved_codigo_base:BASE,approved_source_column:'OEM_CODES',
    verification_method:'JOHN_DEERE_DIRECT_SUPERSESSION_PLUS_VERIFIED_TORO_1365409_EQUIVALENCE'
  }}
};
function norm(v){return String(v||'').replace(/[^A-Z0-9]/gi,'').toUpperCase()}
function clean(a){return (Array.isArray(a)?a:[]).filter(x=>!['MIA881446','AM131102'].includes(norm(x&&x.code)))}
(async()=>{
 const url=process.env.CATALOG_DATABASE_URL||process.env.ELIMFILTERS_DATABASE_URL||process.env.DATABASE_URL;
 const db=new Client({connectionString:url,ssl:{rejectUnauthorized:false}}); await db.connect();
 try{
  await db.query('BEGIN');
  const occ=await db.query('select sku,codigo_base from public.elimfilters_catalog where sku=$1 or codigo_base=$2',[SKU,BASE]);
  if(occ.rowCount) throw new Error('TARGET_OCCUPIED '+JSON.stringify(occ.rows));
  assertCanonicalWrite(row,{validateApplications:false});
  const dup=await db.query("select sku,oem_codes,competitor_codes from public.elimfilters_catalog where exists(select 1 from jsonb_array_elements(coalesce(oem_codes,'[]'::jsonb)||coalesce(competitor_codes,'[]'::jsonb)) x where upper(regexp_replace(coalesce(x->>'code',''),'[^A-Z0-9]','','g')) in ('MIA881446','AM131102')) for update");
  for(const r of dup.rows) await db.query('update public.elimfilters_catalog set oem_codes=$1::jsonb,competitor_codes=$2::jsonb where sku=$3',[JSON.stringify(clean(r.oem_codes)),JSON.stringify(clean(r.competitor_codes)),r.sku]);
  const cols=Object.keys(row), j=new Set(['oem_codes','competitor_codes','equipment_applications','vehicle_applications','specs','brand_crossrefs','alternative_products','alternatives','enrichment_data']);
  const vals=cols.map(k=>j.has(k)?JSON.stringify(row[k]):row[k]), ph=cols.map((k,i)=>'$'+(i+1)+(j.has(k)?'::jsonb':''));
  if(APPLY) await db.query('insert into public.elimfilters_catalog ('+cols.map(k=>'"'+k+'"').join(',')+') values ('+ph.join(',')+')',vals);
  if(APPLY){await db.query('COMMIT');console.log(JSON.stringify({mode:'execute',sku:SKU,codigo_base:BASE,duplicates_removed:dup.rowCount,transaction:'COMMIT'},null,2))}
  else {await db.query('ROLLBACK');console.log(JSON.stringify({mode:'dry-run',sku:SKU,codigo_base:BASE,duplicates_removed:dup.rowCount,transaction:'ROLLBACK'},null,2))}
 }catch(e){try{await db.query('ROLLBACK')}catch(_){} throw e}finally{await db.end()}
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
