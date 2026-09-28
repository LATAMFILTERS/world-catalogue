#!/usr/bin/env node
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('pg');
const {assertCanonicalWrite}=require('../../lib/catalog-write-gateway.js');
const apply=process.argv.includes('--apply');
const manifestIndex=process.argv.indexOf('--manifest');
const manifestPath=manifestIndex>=0?process.argv[manifestIndex+1]:null;
const now=()=>new Date().toISOString();
const defaultProducts=[
 {sku:'ED41466',base:'P781466',filter_type:'air-dryer',sub_type:'Air Dryer Cartridge',technology:'DRYCORE™',installation:'Spin-On',thread:'M39 x 1.5',od:140,height:165,god:109.7,gid:98.5,brand:'DONALDSON',url:'https://ecatalog.donaldson.com/view/477944744/84/',method:'DONALDSON_TRUCK_BUS_CATALOG__PARKER_BA5374_CROSS',description:'ELIMFILTERS® Air dryer cartridge. DRYCORE™ desiccant filtration for heavy-duty compressed-air systems.',meta:{baldwin_cross:'BA5374',donaldson_related:'P953571 = P781466 + 5g lubricant'}},
 {sku:'EF96095',base:'P506095',filter_type:'fuel',sub_type:'Fuel Filter - High Efficiency',technology:'SYNTAPORE™',installation:'Cartridge',thread:null,od:null,height:null,god:null,gid:null,brand:'DONALDSON',url:'https://www.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/australasia/industries-markets/f111672-eng/Japanese-Truck-Filter-Guide.pdf',method:'DONALDSON_JAPANESE_TRUCK_GUIDE_HIGH_EFFICIENCY_OPTION',description:'ELIMFILTERS® High-efficiency fuel filter option for Donaldson P506095 applications.',meta:{commercial_variant:'HIGH_EFFICIENCY_OPTION_OF_P502427'}},
 {sku:'EL80408',base:'P550408',filter_type:'lube',sub_type:'Lube Filter',technology:'SYNTRAX™',installation:'Spin-On',thread:'1 1/2-12',od:120,height:210,god:116.6,gid:98,brand:'DONALDSON',url:'https://western.donaldson.com/content/dam/donaldson/engine-hydraulics-bulk/literature/australasia/filter-kits/f111610/Fuel-and-Oil-Truck-Filter-Maintenance-Kits_Web.pdf',method:'DONALDSON_ISUZU_FUEL_OIL_KIT_GUIDE',description:'ELIMFILTERS® Heavy-duty lube spin-on combination filter for Isuzu diesel applications.',meta:{fleetguard_cross:'LF3850'}},
 {sku:'ES90128',base:'FS20128',filter_type:'fuel',sub_type:'Fuel Water Separator',technology:'HYDROCORE™',installation:'Cartridge',thread:null,od:67,height:104,god:null,gid:null,brand:'FLEETGUARD',url:'https://www.fleetguard.com/product/FS20128',method:'DONALDSON_ABSENCE_VERIFIED__FLEETGUARD_OFFICIAL_FS20128',description:'ELIMFILTERS® Fuel/water separator cartridge for heavy-duty Isuzu applications.',meta:{oem_reference:'ISUZU 8981653750',style:'FUEL_WATER_SEPARATOR'}}
];
const products=manifestPath?JSON.parse(fs.readFileSync(manifestPath,'utf8')).products:defaultProducts;
function gov(p){
 if(p.brand==='DONALDSON')return{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED',required_authority:'DONALDSON_PRIMARY',approved_manufacturer:'DONALDSON',approved_codigo_base:p.base,current_codigo_base:p.base,approved_source_column:'CODIGO_BASE',primary_manufacturer_verified:true,verification_method:p.method,verified_at:now(),evidence_authority:'DONALDSON_OFFICIAL_CATALOG',evidence_url:p.url};
 if(p.brand==='ISUZU')return{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED_FALLBACK',required_authority:'DONALDSON_THEN_FALLBACK',approved_manufacturer:'ISUZU',approved_codigo_base:p.base,current_codigo_base:p.base,approved_source_column:'OEM_CODES',primary_manufacturer_verified:false,donaldson_absence_verified:p.donaldson_absence_verified===true,fallback_manufacturer_verified:true,fallback_commercial_code_verified:true,verification_method:p.method,verified_at:now(),evidence_authority:'ISUZU_GENUINE_PARTS',evidence_url:p.url};
 return{policy_version:'2026-08-19-v3.1',state:'CANONICAL_VERIFIED_FALLBACK',required_authority:'DONALDSON_THEN_FALLBACK',approved_manufacturer:'FLEETGUARD',approved_codigo_base:p.base,current_codigo_base:p.base,approved_source_column:'COMPETITOR_CODES',primary_manufacturer_verified:false,donaldson_absence_verified:true,fallback_manufacturer_verified:true,fallback_commercial_code_verified:true,verification_method:p.method,verified_at:now(),evidence_authority:'FLEETGUARD_OFFICIAL',evidence_url:p.url};
}
function candidate(p){return{sku:p.sku,codigo_base:p.base,filter_type:p.filter_type,sub_type:p.sub_type,technology:p.technology,duty:'HEAVY_DUTY',description:p.description,name:p.description.replace(/^ELIMFILTERS®\s*/,'ELIMFILTERS® '),installation_type:p.installation,thread_size:p.thread,outer_diameter_mm:p.od,height_mm:p.height,gasket_od_mm:p.god,gasket_id_mm:p.gid,oem_codes:[],competitor_codes:[],equipment_applications:[],vehicle_applications:[],enrichment_data:{codigo_base_governance:gov(p),isuzu_v151_materialization:{source_url:p.url,verification_method:p.method,metadata:p.meta,materialized_at:now()}},canonical_source_brand:p.brand,canonical_source_code:p.base,canonical_source_url:p.url,canonical_source_status:'VERIFIED',canonical_verified_at:now()};}
const cs=process.env.CATALOG_DATABASE_URL||process.env.DATABASE_URL;if(!cs)throw new Error('DB URL required');
const local=/@(127\.0\.0\.1|localhost):/.test(cs);const pool=new Pool({connectionString:cs,ssl:local?false:{rejectUnauthorized:false},max:1});
const db=await pool.connect();const report={phase:'ISUZU_V151_PRODUCT_MATERIALIZATION',apply,rows:[],database_write:false};
try{
 await db.query('BEGIN');
 for(const p of products){
  const bySku=await db.query('select sku,codigo_base,duty,technology from elimfilters_catalog where sku=$1 for update',[p.sku]);
  const byBase=await db.query("select sku,codigo_base from elimfilters_catalog where upper(regexp_replace(coalesce(codigo_base,''),'[^A-Z0-9]','','g'))=upper(regexp_replace($1,'[^A-Z0-9]','','g')) for update",[p.base]);
  if(bySku.rowCount){const r=bySku.rows[0];if(r.codigo_base!==p.base||r.duty!=='HEAVY_DUTY')throw new Error(`${p.sku}: existing SKU conflicts with v151 definition`);report.rows.push({sku:p.sku,status:'ALREADY_PRESENT',codigo_base:r.codigo_base});continue;}
  if(byBase.rowCount)throw new Error(`${p.sku}: codigo_base ${p.base} already owned by ${byBase.rows.map(x=>x.sku).join(',')}`);
  const v=candidate(p);assertCanonicalWrite(v);
  if(apply)await db.query(`insert into elimfilters_catalog(sku,codigo_base,filter_type,sub_type,technology,duty,description,name,installation_type,thread_size,outer_diameter_mm,height_mm,gasket_od_mm,gasket_id_mm,oem_codes,competitor_codes,equipment_applications,vehicle_applications,enrichment_data,canonical_source_brand,canonical_source_code,canonical_source_url,canonical_source_status,canonical_verified_at,created_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,$15::jsonb,$16,$17,$18,$19,$20,now())`,[v.sku,v.codigo_base,v.filter_type,v.sub_type,v.technology,v.duty,v.description,v.name,v.installation_type,v.thread_size,v.outer_diameter_mm,v.height_mm,v.gasket_od_mm,v.gasket_id_mm,JSON.stringify(v.enrichment_data),v.canonical_source_brand,v.canonical_source_code,v.canonical_source_url,v.canonical_source_status,v.canonical_verified_at]);
  report.rows.push({sku:p.sku,status:apply?'INSERTED':'READY_TO_INSERT',codigo_base:p.base,technology:p.technology});
 }
 if(apply){await db.query('COMMIT');report.database_write=true;}else await db.query('ROLLBACK');
} catch(e){try{await db.query('ROLLBACK')}catch{}report.error=e.message;throw e} finally{db.release();await pool.end()}
report.summary={total:report.rows.length,ready:report.rows.filter(x=>['READY_TO_INSERT','INSERTED','ALREADY_PRESENT'].includes(x.status)).length,inserted:report.rows.filter(x=>x.status==='INSERTED').length,database_write:report.database_write};
fs.mkdirSync('hermes/reports',{recursive:true});const fn=`hermes/reports/isuzu-v151-materialize-${apply?'apply':'dry-run'}-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;fs.writeFileSync(fn,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.summary,null,2));console.log(fn);
