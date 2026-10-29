#!/usr/bin/env node
'use strict';
// Read-only production contract verification. Requires an independent read-only DB login.
// No writes, no guessed fallback endpoints, no automatic PASS from missing data.
const { Client } = require('pg');
const { governApplicationPresentation } = require('../../lib/application-presentation-guard');
const fs = require('node:fs');
const path = require('node:path');
const db = process.env.DATABASE_URL_READONLY;
const base = process.env.CATALOG_PUBLIC_SEARCH_BASE;
const reportPath = process.env.CATALOG_GOVERNANCE_REPORT || path.resolve('out/live-catalog-governance.json');
const checks = [];
function record(id, status, detail) { checks.push({ id, status, detail }); }
function count(v) { return Array.isArray(v) ? v.length : 0; }
function normalize(v) { return JSON.stringify(v == null ? [] : v); }
function productRows(body) {
  const out = [];
  const seen = new Set();
  const visit = (v) => {
    if (!v || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) { v.forEach(visit); return; }
    if (typeof (v.sku || v.elimfilters_sku) === 'string') out.push(v);
    for (const key of ['results','products','matches','candidates','product','alternatives','related']) visit(v[key]);
  };
  visit(body);
  return out;
}
async function main() {
  if (!db || !base || !/^https:\/\//i.test(base)) {
    record('prerequisites','BLOCKED','DATABASE_URL_READONLY and HTTPS CATALOG_PUBLIC_SEARCH_BASE required (e.g. https://part-search.elimfilters.com)');
    return;
  }
  const client = new Client({ connectionString: db, application_name: 'catalog-live-governance-read-only' });
  try {
    await client.connect();
    await client.query('BEGIN TRANSACTION READ ONLY');
    await client.query("SET LOCAL statement_timeout = '12000ms'");
    const setting = await client.query('SHOW transaction_read_only');
    if (setting.rows[0]?.transaction_read_only !== 'on') throw Error('transaction is not read-only');
    // Selection uses the same evidence source and exact JSON payload hashing as the existing guard.
    // Verified is defined by the guard itself rather than inferring it from a cross-reference.
    const sql = `
      SELECT c.sku, c.duty, c.vehicle_applications, c.equipment_applications,
             c.oem_codes, c.competitor_codes
      FROM public.elimfilters_catalog c
      WHERE c.catalog_active IS TRUE AND c.duty = $1
        AND jsonb_array_length(COALESCE(
          CASE WHEN $1='LIGHT_DUTY' THEN c.vehicle_applications ELSE c.equipment_applications END,
          '[]'::jsonb)) > 0
      ORDER BY c.sku LIMIT 120
    `;
    const candidates = [];
    for (const duty of ['LIGHT_DUTY','HEAVY_DUTY']) {
      const rows = (await client.query(sql,[duty])).rows;
      for (const row of rows) {
        const input = {results:[{sku:row.sku,vehicle_applications:row.vehicle_applications || [],
          equipment_applications:row.equipment_applications || [],oem_codes:row.oem_codes || [],
          competitor_codes:row.competitor_codes || []}]};
        const result = await governApplicationPresentation(input,client);
        const p = result.results[0];
        const field = duty==='LIGHT_DUTY'?'vehicle_applications':'equipment_applications';
        candidates.push({row,field,validated:p.application_validation[field].state});
      }
    }
    const ld = candidates.find(c=>c.row.duty==='LIGHT_DUTY'&&c.validated==='EVIDENCE_REQUIRED');
    const hd = candidates.find(c=>c.row.duty==='HEAVY_DUTY'&&c.validated==='EVIDENCE_REQUIRED');
    const verified = candidates.find(c=>c.validated==='EVIDENCE_VERIFIED');
    const samples = [['LD_WITHHELD',ld],['HD_WITHHELD',hd],['EVIDENCE_VERIFIED',verified]];
    for(const [label,sample] of samples) {
      if (!sample) { record(label,'BLOCKED','No matching real catalog sample within first 120 active rows per duty');continue; }
      const {row,field}=sample;
      // This is an existing GET /api/search?q= route, not an invented API.
      const url = new URL('/api/search',base);
      url.searchParams.set('q',row.sku);
      let response, data;
      try {
        response = await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw Error('HTTP '+response.status);
        data = await response.json();
      } catch(e) {record(label,'BLOCKED','Public GET failed for '+row.sku+': '+e.message);continue;}
      const matches=productRows(data).filter(p=>String(p.sku||p.elimfilters_sku).toUpperCase()===row.sku.toUpperCase());
      if(matches.length!==1) {record(label,'BLOCKED','Expected one exact public SKU '+row.sku+'; found '+matches.length);continue;}
      const p=matches[0], published=p[field];
      if (!Array.isArray(published)) {record(label,'BLOCKED',row.sku+' missing public '+field+' array');continue;}
      const expected = label==='EVIDENCE_VERIFIED' ? row[field] : [];
      const fitmentOK = normalize(published)===normalize(expected);
      const other = field==='vehicle_applications'?'equipment_applications':'vehicle_applications';
      const crossDutyOK = !Array.isArray(p[other]) || p[other].length===0;
      record(label,fitmentOK&&crossDutyOK?'PASS':'FAIL',
        row.sku+' '+field+': expected '+count(expected)+', public '+count(published)+', cross-duty '+count(p[other]));
      // Codes may be omitted by public API; absence is BLOCKED, never a PASS.
      for(const key of ['oem_codes','competitor_codes']) {
        if (!Array.isArray(p[key])) {record(label+':'+key,'BLOCKED','Public API does not expose '+key+' as array');continue;}
        record(label+':'+key,normalize(p[key])===normalize(row[key])?'PASS':'FAIL',
          row.sku+' exact public-vs-DB '+key+' comparison');
      }
    }
    await client.query('ROLLBACK');
  } catch(e) {
    record('database','BLOCKED',e.message);
    try { await client.query('ROLLBACK'); } catch {}
  } finally { await client.end().catch(()=>{}); }
}
main().catch(e=>record('runtime','BLOCKED',e.message)).finally(()=>{
  const status=checks.length>0&&checks.every(x=>x.status==='PASS')?'PASS':
    checks.some(x=>x.status==='FAIL')?'FAIL':'BLOCKED';
  const report={timestamp:new Date().toISOString(), mode:'READ_ONLY',status,checks};
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});
  fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  process.exitCode=status==='PASS'?0:status==='FAIL'?1:2;
});
