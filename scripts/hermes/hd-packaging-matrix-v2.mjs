#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createCataloguePool } from './hd-packaging-db.mjs';
import { loadManufacturerResolver } from './hd-packaging-manufacturer-resolver.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { requiredPackagingFields, isProtectedPackaging } = require('../lib/hd_packaging_policy.js');
const OUT = path.resolve('hermes/hd-packaging');

function norm(v){return String(v||'').trim().toLowerCase();}
function part(v){return String(v||'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');}
function safe(v){if(v==null)return null;if(typeof v==='object')return v;try{return JSON.parse(v);}catch{return v;}}
function family(r){const t=norm(r.filter_type).replace(/_/g,'-');const tech=String(r.technology||'').toUpperCase();if(t.includes('air-dryer')||tech.includes('DRYCORE'))return'air-dryer';if(t.includes('coolant')||t.includes('cooling')||tech.includes('THERMACORE'))return'cooling';if(t.includes('hydraulic')||tech.includes('NANOFORCE'))return'hydraulic';if(t.includes('separator')||tech.includes('HYDROCORE'))return'fuel-water-separator';if(t.includes('fuel'))return'fuel';if(t.includes('oil')||t.includes('lube')||tech.includes('SYNTRAX'))return'lube-oil';return'unknown';}
function spin(r){const h=[r.style,r.filter_style,r.product_style,r.form_factor,r.packaging_type,r.description,r.product_name].filter(Boolean).map(norm).join(' | ');if(/spin[- ]?on/.test(h))return true;const known=new Set(['oil','oil_filter','lube','lube_filter','fuel','fuel_filter','fuel_water_separator','separator','coolant','coolant_filter','hydraulic','hydraulic_filter','air_dryer']);const has=[r.thread_size,r.thread,r.thread_spec].some(v=>String(v||'').trim());return known.has(norm(r.filter_type))&&has;}
function refsFrom(v,source,out=[]){if(!v)return out;if(Array.isArray(v)){for(const x of v)refsFrom(x,source,out);return out;}if(typeof v!=='object')return out;const manufacturer=v.manufacturer||v.brand||v.make||v.oem||v.name||null;const code=v.code||v.part_number||v.partNumber||v.part||v.number||v.reference||v.ref||v.value||null;if(manufacturer&&code)out.push({manufacturer:String(manufacturer).trim(),part_number:String(code).trim(),source});for(const c of Object.values(v))if(c&&typeof c==='object')refsFrom(c,source,out);return out;}
function refs(r){const all=[...refsFrom(safe(r.oem_codes),'oem_codes'),...refsFrom(safe(r.competitor_codes),'competitor_codes'),...refsFrom(safe(r.brand_crossrefs),'brand_crossrefs')];const seen=new Set();return all.filter(x=>{const k=`${x.manufacturer.toUpperCase()}::${part(x.part_number)}`;if(!part(x.part_number)||seen.has(k))return false;seen.add(k);return true;});}
function csv(v){const s=v==null?'':String(v);return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}

async function main(){
  fs.mkdirSync(OUT,{recursive:true});
  const pool=createCataloguePool();
  const { resolveManufacturer }=loadManufacturerResolver();
  try{
    const c=await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'");
    const cols=new Set(c.rows.map(r=>r.column_name));
    const wanted=['sku','codigo_base','duty','filter_type','technology','style','filter_style','product_style','form_factor','description','product_name','thread_size','thread','thread_spec','oem_codes','competitor_codes','brand_crossrefs','unit_packaged_length_cm','unit_packaged_width_cm','unit_packaged_height_cm','unit_packaged_weight_kg','unit_packaged_volume_m3','units_per_case','packaging_type','packaging_source','packaging_source_url','packaging_validation_status'].filter(x=>cols.has(x));
    const q=await pool.query(`SELECT ${wanted.map(x=>`"${x}"`).join(', ')} FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' ORDER BY sku`);
    const rows=q.rows.filter(spin);
    const detail=[];const fam=new Map();const man=new Map();
    for(const r of rows){
      const rs=refs(r);const missing=requiredPackagingFields(r);const prot=isProtectedPackaging(r);let governed=0,ambiguous=0,unmapped=0;
      for(const ref of rs){const res=resolveManufacturer(ref.manufacturer);if(res.organization)governed++;else if(String(res.status).startsWith('AMBIGUOUS'))ambiguous++;else unmapped++;const key=res.organization?.id||res.normalized||ref.manufacturer.toUpperCase();if(!man.has(key))man.set(key,{manufacturer:ref.manufacturer,organization_id:res.organization?.id||null,official_domain:res.organization?.official_domain||null,resolution_status:res.status,skus:new Set(),refs:new Set()});const m=man.get(key);m.skus.add(r.sku);m.refs.add(part(ref.part_number));}
      const status=prot?'PROTECTED':missing.length===0?'READY_FOR_PACKAGING_CALC':rs.length===0?'NO_REFERENCE':governed>0?'RESEARCH_READY':ambiguous>0?'AMBIGUOUS_MANUFACTURER':'UNMAPPED_MANUFACTURER';
      const f=family(r);detail.push({sku:r.sku,codigo_base:r.codigo_base||null,family:f,status,missing_fields:missing,references_count:rs.length,governed_references_count:governed,ambiguous_references_count:ambiguous,unmapped_references_count:unmapped,references:rs});
      if(!fam.has(f))fam.set(f,{family:f,total:0,protected:0,ready_for_packaging_calc:0,research_ready:0,ambiguous_manufacturer:0,unmapped_manufacturer:0,no_reference:0,incomplete:0});const x=fam.get(f);x.total++;if(prot)x.protected++;if(missing.length)x.incomplete++;if(status==='READY_FOR_PACKAGING_CALC')x.ready_for_packaging_calc++;if(status==='RESEARCH_READY')x.research_ready++;if(status==='AMBIGUOUS_MANUFACTURER')x.ambiguous_manufacturer++;if(status==='UNMAPPED_MANUFACTURER')x.unmapped_manufacturer++;if(status==='NO_REFERENCE')x.no_reference++;
    }
    const manufacturer_matrix=[...man.values()].map(m=>({manufacturer:m.manufacturer,organization_id:m.organization_id,official_domain:m.official_domain,resolution_status:m.resolution_status,sku_count:m.skus.size,distinct_reference_count:m.refs.size})).sort((a,b)=>b.sku_count-a.sku_count||a.manufacturer.localeCompare(b.manufacturer));
    const family_matrix=[...fam.values()].sort((a,b)=>b.total-a.total);
    const summary={total_heavy_duty_rows:q.rowCount,spin_on_candidates:rows.length,protected:detail.filter(x=>x.status==='PROTECTED').length,ready_for_packaging_calc:detail.filter(x=>x.status==='READY_FOR_PACKAGING_CALC').length,research_ready:detail.filter(x=>x.status==='RESEARCH_READY').length,ambiguous_manufacturer:detail.filter(x=>x.status==='AMBIGUOUS_MANUFACTURER').length,unmapped_manufacturer:detail.filter(x=>x.status==='UNMAPPED_MANUFACTURER').length,no_reference:detail.filter(x=>x.status==='NO_REFERENCE').length};
    const report={generated_at:new Date().toISOString(),read_only:true,database_write:false,summary,family_matrix,manufacturer_matrix,rows:detail};
    fs.writeFileSync(path.join(OUT,'hd-packaging-matrix-v2.json'),JSON.stringify(report,null,2)+'\n');
    const headers=['sku','codigo_base','family','status','missing_fields','references_count','governed_references_count','ambiguous_references_count','unmapped_references_count'];const lines=[headers.join(',')];for(const r of detail)lines.push(headers.map(h=>csv(h==='missing_fields'?r.missing_fields.join('|'):r[h])).join(','));fs.writeFileSync(path.join(OUT,'hd-packaging-matrix-v2.csv'),lines.join('\n')+'\n');
    console.log(JSON.stringify({...summary,family_matrix,top_manufacturers:manufacturer_matrix.slice(0,25),output_json:'hermes\\hd-packaging\\hd-packaging-matrix-v2.json',output_csv:'hermes\\hd-packaging\\hd-packaging-matrix-v2.csv',database_write:false},null,2));
  }finally{await pool.end();}
}
main().catch(e=>{console.error(`[HERMES HD packaging matrix v2] ${e.stack||e.message}`);process.exit(1);});
