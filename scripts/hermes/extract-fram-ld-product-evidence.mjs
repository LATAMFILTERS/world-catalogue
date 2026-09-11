#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';
import axios from 'axios';
import pg from 'pg';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  EVIDENCE_LAYERS,
  APPLICATION_STATUS,
  CROSS_STATUS,
  normalizeLdApplicationEvidence,
  validateLdApplicationEvidence
} = require('../../lib/knowledge-governance/hermes-evidence-layer-registry');

const { Client } = pg;
const args = process.argv.slice(2);
const getArg = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const has = (name) => args.includes(name);
const seedFile = path.resolve(getArg('--seed-file') || 'hermes/fram-ld-product-seeds.json');
const outDir = path.resolve(getArg('--out-dir') || 'elimfilters-vault/91-private-evidence/fram-ld-product-pages');
const limit = Number(getArg('--limit') || 0);
const reconcile = has('--reconcile') || String(process.env.HERMES_FRAM_LD_RECONCILE || '').toLowerCase() === 'true';
const timeoutMs = Number(process.env.HERMES_FRAM_LD_PRODUCT_TIMEOUT_MS || 30000);
const maxBytes = Number(process.env.HERMES_FRAM_LD_PRODUCT_MAX_BYTES || 8_000_000);

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const uniq = (values) => [...new Set(values.filter(Boolean).map(v => String(v).trim()).filter(Boolean))];
const normalizePart = (v='') => String(v).toUpperCase().replace(/[^A-Z0-9]/g,'');
const normalizeYear = (v) => { const m = String(v ?? '').match(/(?:19|20)\d{2}/); return m ? Number(m[0]) : null; };
const cleanText = (s='') => String(s)
  .replace(/<script[\s\S]*?<\/script>/gi,' ')
  .replace(/<style[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]+>/g,' ')
  .replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/g,"'")
  .replace(/\s+/g,' ').trim();

function readSeeds() {
  const direct = [];
  for (let i = 0; i < args.length; i++) if (args[i] === '--url' && args[i + 1]) direct.push(args[i + 1]);
  let fileSeeds = [];
  if (fs.existsSync(seedFile)) {
    const parsed = JSON.parse(fs.readFileSync(seedFile,'utf8'));
    fileSeeds = Array.isArray(parsed) ? parsed : (parsed.urls || parsed.seeds || []);
    fileSeeds = fileSeeds.map(v => typeof v === 'string' ? v : v.url).filter(Boolean);
  }
  const urls = uniq([...direct, ...fileSeeds]).filter(u => /^https:\/\/www\.fram\.com\//i.test(u));
  return limit > 0 ? urls.slice(0, limit) : urls;
}

function parseJsonScripts(html) {
  const found = [];
  for (const re of [
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi
  ]) {
    let m;
    while ((m = re.exec(html))) { try { found.push(JSON.parse(m[1])); } catch {} }
  }
  return found;
}

function walk(node, visit) {
  if (Array.isArray(node)) return node.forEach(v => walk(v, visit));
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const v of Object.values(node)) walk(v, visit);
}

function keyValue(obj, keys) {
  for (const [k,v] of Object.entries(obj)) {
    if (keys.includes(k.toLowerCase()) && ['string','number'].includes(typeof v)) return String(v).trim();
  }
  return null;
}

function extractStructured(jsons) {
  const applications = [], crosses = [], skus = [];
  const MAKE = ['make','brand','manufacturer','vehiclemake'];
  const MODEL = ['model','vehiclemodel'];
  const ENGINE = ['engine','enginedescription','engine_description','enginecode','engine_code'];
  const CONFIG = ['trim','configuration','body','bodytype','submodel','housing','notes','note'];
  const CROSS = ['crossreference','crossreferences','cross_reference','cross_refs','interchange','interchanges','oe','oem','oemnumber','oem_number','competitorpartnumber'];
  for (const root of jsons) walk(root, (obj) => {
    const make = keyValue(obj, MAKE), model = keyValue(obj, MODEL), engine = keyValue(obj, ENGINE), config = keyValue(obj, CONFIG);
    const year = keyValue(obj, ['year','modelyear','fromyear','toyear','yearfrom','yearto']);
    if (make && model && (year || engine || config)) {
      const yearStart = normalizeYear(obj.fromYear ?? obj.yearFrom ?? year);
      const yearEnd = normalizeYear(obj.toYear ?? obj.yearTo ?? year) || yearStart;
      applications.push({ year_start:yearStart, year_end:yearEnd, make, model, engine:engine || null, trim:null, configuration:config || null, housing:null, notes:null });
    }
    for (const [k,v] of Object.entries(obj)) {
      const lk = k.toLowerCase();
      if (CROSS.includes(lk)) {
        if (Array.isArray(v)) for (const x of v) crosses.push(typeof x === 'string' ? x : keyValue(x || {}, ['partnumber','part_number','sku','code','number']));
        else if (typeof v === 'string' || typeof v === 'number') crosses.push(String(v));
      }
      if (['sku','partnumber','part_number','productcode','product_code'].includes(lk) && ['string','number'].includes(typeof v)) skus.push(String(v));
    }
  });
  return { applications, crosses:uniq(crosses), skus:uniq(skus) };
}

function extractTextual(html) {
  const text = cleanText(html), crosses = [], applications = [];
  const crossMatch = text.match(/Cross References?\s*:?\s*(.{0,1000}?)(?:Special Notes|Features|Applications|Product Applications|Specifications|$)/i);
  if (crossMatch) {
    for (const token of crossMatch[1].split(/[;,|]/)) {
      crosses.push(...((token.match(/\b[A-Z0-9][A-Z0-9._/-]{3,24}\b/gi) || []).filter(x => /\d/.test(x))));
    }
  }
  const appSection = text.match(/(?:Applications?|Product Applications?)\s*:?\s*(.{0,2200}?)(?:Cross References?|Special Notes|Specifications|$)/i)?.[1] || '';
  const yearRe = /\b((?:19|20)\d{2})(?:\s*[-–]\s*((?:19|20)?\d{2}))?\b/g;
  let ym;
  while ((ym = yearRe.exec(appSection))) {
    let to = ym[2] || ym[1]; if (/^\d{2}$/.test(to)) to = ym[1].slice(0,2) + to;
    const tail = appSection.slice(ym.index + ym[0].length, ym.index + ym[0].length + 180).trim();
    const words = tail.split(/\s+/).filter(Boolean);
    if (words.length >= 2) applications.push({ year_start:Number(ym[1]), year_end:Number(to), make:words[0].replace(/[,;:]/g,''), model:words.slice(1,4).join(' ').replace(/[;:].*$/,''), engine:null, trim:null, configuration:tail || null, housing:null, notes:null });
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
  const skus = uniq([...(title.match(/\b[A-Z]{1,5}\d{3,8}[A-Z0-9]*\b/gi)||[]), ...(text.slice(0,1200).match(/\b[A-Z]{1,5}\d{3,8}[A-Z0-9]*\b/gi)||[])]);
  return { applications, crosses:uniq(crosses), skus };
}

function dedupeApps(apps) {
  const map = new Map();
  for (const a of apps) {
    if (!a.make || !a.model) continue;
    const key = [a.year_start||'',a.year_end||'',a.make,a.model,a.engine||'',a.configuration||'',a.housing||''].map(v => String(v).toLowerCase().trim()).join('|');
    if (!map.has(key)) map.set(key,a);
  }
  return [...map.values()];
}

async function fetchPage(url) {
  const r = await axios.get(url,{responseType:'arraybuffer',timeout:timeoutMs,maxContentLength:maxBytes,maxBodyLength:maxBytes,headers:{'user-agent':'ELIMFILTERS-HERMES/1.0 (+private technical evidence collector)','accept':'text/html,application/xhtml+xml'}});
  const raw = Buffer.from(r.data), contentType = String(r.headers['content-type'] || '');
  if (!/html|xhtml/i.test(contentType)) throw new Error(`Unsupported content-type ${contentType || 'unknown'}`);
  return { raw, html:raw.toString('utf8'), effectiveUrl:r.request?.res?.responseUrl || url };
}

function makeEvidenceRecords({ url, rawSha, retrievedAt, sourceSku, applications, crosses }) {
  const records = [];
  for (const app of applications) {
    const record = normalizeLdApplicationEvidence({
      source_url:url,
      source_snapshot_sha256:rawSha,
      source_retrieved_at:retrievedAt,
      source_market_scope:'source_catalog_scope_unverified',
      source_product_number:sourceSku,
      source_product_family:null,
      application:app,
      application_status:APPLICATION_STATUS.CANDIDATE,
      cross_reference:{ manufacturer:null, part_number:null, relation_type:null },
      cross_status:CROSS_STATUS.OBSERVED,
      independent_validation_sources:[]
    });
    const validation = validateLdApplicationEvidence(record);
    if (!validation.valid) throw new Error(validation.errors.join('; '));
    records.push(record);
  }
  for (const cross of crosses) {
    const record = normalizeLdApplicationEvidence({
      source_url:url,
      source_snapshot_sha256:rawSha,
      source_retrieved_at:retrievedAt,
      source_market_scope:'source_catalog_scope_unverified',
      source_product_number:sourceSku,
      source_product_family:null,
      application:{},
      application_status:APPLICATION_STATUS.OBSERVED,
      cross_reference:{ manufacturer:null, part_number:cross, relation_type:'source_listed_cross' },
      cross_status:CROSS_STATUS.CANDIDATE,
      independent_validation_sources:[]
    });
    const validation = validateLdApplicationEvidence(record);
    if (!validation.valid) throw new Error(validation.errors.join('; '));
    records.push(record);
  }
  if (!records.length) {
    const record = normalizeLdApplicationEvidence({ source_url:url, source_snapshot_sha256:rawSha, source_retrieved_at:retrievedAt, source_market_scope:'source_catalog_scope_unverified', source_product_number:sourceSku });
    const validation = validateLdApplicationEvidence(record);
    if (!validation.valid) throw new Error(validation.errors.join('; '));
    records.push(record);
  }
  return records;
}

async function connectDb() {
  const connectionString = process.env.DATABASE_URL || process.env.LEGACY_DB_URL;
  if (!connectionString) return null;
  const client = new Client({ connectionString, ssl:{ rejectUnauthorized:false } });
  await client.connect(); return client;
}

async function reconcileEvidence(client, sourceSku, crosses) {
  if (!client) return { status:'SKIPPED_NO_DATABASE_URL', database_write:false, source_sku_matches:[], cross_matches:[] };
  const find = async (part) => {
    const n = normalizePart(part); if (!n) return [];
    return (await client.query(`SELECT sku, codigo_base, filter_type, competitor_codes FROM elimfilters_catalog WHERE UPPER(REGEXP_REPLACE(COALESCE(competitor_codes::text,''),'[^A-Z0-9]','','g')) LIKE $1 LIMIT 50`, [`%${n}%`])).rows;
  };
  const sourceRows = await find(sourceSku), crossMatches = [];
  for (const cross of crosses.slice(0,100)) { const rows = await find(cross); if (rows.length) crossMatches.push({ observed_cross:cross, matches:rows }); }
  return { status:'READ_ONLY_RECONCILIATION', database_write:false, source_sku_matches:sourceRows, cross_matches:crossMatches };
}

fs.mkdirSync(outDir,{recursive:true});
const urls = readSeeds();
if (!urls.length) { console.error('No FRAM product URLs supplied. Use --url <url> or hermes/fram-ld-product-seeds.json'); process.exit(2); }
const db = reconcile ? await connectDb() : null;
const runId = `fram-ld-${new Date().toISOString().replace(/[:.]/g,'-')}`;
const runDir = path.join(outDir,runId); fs.mkdirSync(runDir,{recursive:true});
const results = [];

for (const [index,url] of urls.entries()) {
  const id = `fram_ld_product_${String(index+1).padStart(5,'0')}`;
  try {
    const page = await fetchPage(url), rawSha = sha256(page.raw), retrievedAt = new Date().toISOString();
    const structured = extractStructured(parseJsonScripts(page.html)), textual = extractTextual(page.html);
    const sourceSku = structured.skus[0] || textual.skus[0] || null;
    const applications = dedupeApps([...structured.applications,...textual.applications]);
    const crosses = uniq([...structured.crosses,...textual.crosses]).filter(x => normalizePart(x) !== normalizePart(sourceSku));
    const snapshotName = `${id}-${rawSha.slice(0,16)}.html`;
    fs.writeFileSync(path.join(runDir,snapshotName),page.raw);
    const evidenceRecords = makeEvidenceRecords({ url, rawSha, retrievedAt, sourceSku, applications, crosses });
    const reconciliation = await reconcileEvidence(db,sourceSku,crosses);
    const payload = {
      schema_version:'1.0.0', evidence_layer:EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE,
      knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN', industry:'Automotive', source_id:id,
      source_url:url, effective_url:page.effectiveUrl, source_product_number:sourceSku,
      source_snapshot_sha256:rawSha, source_snapshot_path:path.relative(process.cwd(),path.join(runDir,snapshotName)).replaceAll('\\','/'),
      applications_observed:applications.length, crosses_observed:crosses.length,
      catalog_auto_update:false, confirmed_cross_auto_write:false, confirmed_application_auto_write:false,
      records:evidenceRecords, reconciliation
    };
    const evidencePath = path.join(runDir,`${id}.json`); fs.writeFileSync(evidencePath,JSON.stringify(payload,null,2)+'\n');
    results.push({id,url,status:'OK',source_sku:sourceSku,applications:applications.length,cross_references:crosses.length,evidence_path:path.relative(process.cwd(),evidencePath).replaceAll('\\','/')});
    console.log(`[${index+1}/${urls.length}] OK ${sourceSku || '(sku unresolved)'} apps=${applications.length} cross=${crosses.length}`);
  } catch (error) {
    results.push({id,url,status:'ERROR',error:error.message}); console.error(`[${index+1}/${urls.length}] ERROR ${url}: ${error.message}`);
  }
}
if (db) await db.end();
const manifest = { schema_version:'1.0.0', run_id:runId, evidence_layer:EVIDENCE_LAYERS.LD_APPLICATION_CROSS_EVIDENCE, knowledge_domain:'LIGHT_DUTY_KNOWLEDGE_DOMAIN', industry:'Automotive', source_role:'private_evidence_only', catalog_auto_update:false, cross_auto_confirmation:false, application_auto_confirmation:false, database_write:false, reconciliation_mode:reconcile?'read_only':'disabled', started_from_urls:urls.length, ok:results.filter(r=>r.status==='OK').length, errors:results.filter(r=>r.status==='ERROR').length, results };
fs.writeFileSync(path.join(runDir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`[HERMES FRAM LD PRODUCT] run=${runId} ok=${manifest.ok} errors=${manifest.errors} database_write=false`);
if (manifest.errors) process.exitCode = 1;
