#!/usr/bin/env node
import fs from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

function argsMap(){return Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.join('=')]}))}
async function fileOK(p){if(!p)return false;try{const s=await fs.stat(p);return s.isFile()&&s.size>0}catch{return false}}
function run(script,argv){const r=spawnSync(process.execPath,[script,...argv],{encoding:'utf8',env:process.env});if(r.status!==0)throw new Error((r.stderr||r.stdout||'').trim());return JSON.parse(r.stdout)}
function fail(reason,extra={}){console.log(JSON.stringify({ok:false,manifest_status:'FAIL',image_generation_enabled:false,reason,...extra},null,2));process.exit(2)}

const a=argsMap();
const code=String(a.code||'').toUpperCase();
const brand=String(a.brand||'').toUpperCase();
const phase=String(a.phase||'').toUpperCase();
if(!code||!brand||!phase)fail('STOP_REQUIRED_ARGUMENT_MISSING');

let sourceEvidence = null;
if(a['source-evidence']){
  if(!await fileOK(a['source-evidence']))fail('STOP_SOURCE_EVIDENCE_MISSING');
  try{sourceEvidence=JSON.parse(await fs.readFile(a['source-evidence'],'utf8'))}catch{fail('STOP_SOURCE_EVIDENCE_INVALID')}
  if(sourceEvidence.manufacturer!==brand||sourceEvidence.part_number!==code)fail('STOP_SOURCE_EVIDENCE_SKU_MISMATCH');
  if(sourceEvidence.verified_fresh_source!==true||sourceEvidence.cache_used===true||sourceEvidence.previous_master_used===true)fail('STOP_FRESH_SOURCE_POLICY_FAILED');
}

const sourceImage = a['source-image'] || sourceEvidence?.source_image_path;
const screenshot = a.screenshot || sourceEvidence?.screenshot_path || null;
if(!await fileOK(sourceImage))fail('STOP_SOURCE_IMAGE_MISSING');
if(!sourceEvidence && !await fileOK(screenshot))fail('STOP_SOURCE_PROVENANCE_MISSING');
if(!await fileOK('frontend/public/assets/logo-elimfilters.png'))fail('STOP_LOGO_ASSET_MISSING');

let db;try{db=run('product-identity/scripts/resolve-competitor-sku.mjs',[`--code=${code}`,`--brand=${brand}`,'--duty=HEAVY_DUTY'])}catch(e){fail('STOP_DATABASE_RESOLUTION_FAILED',{detail:e.message})}
if(db.status!=='RESOLVED')fail('STOP_DATABASE_RESOLUTION_FAILED',{db});

let tech;try{tech=run('product-identity/scripts/resolve-technology-asset.mjs',[`--filter-type=${db.filter_type||''}`,`--technology=${db.catalog_technology||''}`])}catch(e){fail('STOP_TECHNOLOGY_RESOLUTION_FAILED',{detail:e.message})}

if(phase==='PHASE_2'&&String(a['approval-state']||'').toUpperCase()!=='GEOMETRY_APPROVED')fail('STOP_PHASE_1_NOT_APPROVED');
if(phase==='PHASE_2'&&!await fileOK(a['geometry-master']))fail('STOP_GEOMETRY_MASTER_MISSING');
if(phase==='PHASE_3'&&String(a['approval-state']||'').toUpperCase()!=='PAINT_LITHO_APPROVED')fail('STOP_PHASE_2_NOT_APPROVED');

console.log(JSON.stringify({
  ok:true,
  manifest_status:'PASS',
  image_generation_enabled:true,
  phase,
  competitor_brand:brand,
  competitor_code:code,
  source_acquisition_mode:sourceEvidence?'AUTOMATED_OFFICIAL_SOURCE':'MANUAL_VERIFIED_SOURCE',
  source_evidence_path:a['source-evidence']||null,
  screenshot_path:screenshot,
  screenshot_required:false,
  source_image_path:sourceImage,
  resolved_sku:db.elimfilters_sku,
  filter_type:db.filter_type,
  technology:tech.technology,
  technology_asset_path:tech.technology_asset_path,
  logo_asset_path:'frontend/public/assets/logo-elimfilters.png',
  container_color_hex:'#414141',
  lithography_color_hex:'#CBCBCB',
  render_mode:'SOURCE_REFERENCED_TRANSFORMATION',
  geometry_master_path:a['geometry-master']||null,
  hard_gate_policy:'product-identity/pipelines/render-hard-gates.v1.json'
},null,2));
