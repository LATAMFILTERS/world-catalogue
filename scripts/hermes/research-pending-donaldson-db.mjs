#!/usr/bin/env node
// HERMES: research all Donaldson DB-prefix pending codes in one supervised batch.
// Official source only; publish exclusively through the governed batch publisher.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const root = path.resolve(cwd);
const reportPath = path.join(root,'hermes/catalogue-candidates/donaldson-db-batch-last-run.json');
if (!fs.existsSync(reportPath)) throw new Error('Prior batch report is required to enumerate pending codes');
const report = JSON.parse(fs.readFileSync(reportPath,'utf8'));
const pending = [...new Set((report.items || [])
  .filter(x => x.status === 'MISSING_OFFICIAL_EVIDENCE')
  .map(x => String(x.base || '').toUpperCase())
  .filter(x => /^(DBL|DBF|DBH|DBA)[A-Z0-9]+$/.test(x)))];
if (pending.length === 0) {
  console.log(JSON.stringify({outcome:'NO_PENDING_CODES',pending:0}));
  process.exit(0);
}
const evidenceDir = path.join(root,'hermes/catalogue-candidates');
fs.mkdirSync(evidenceDir,{recursive:true});
const input = path.join(evidenceDir,'donaldson-db-pending-research.json');
const combined = path.join(evidenceDir,'donaldson-db-pending-verified.jsonl');
const all = path.join(evidenceDir,'donaldson-db-batch-input.jsonl');
const scrapeResult = path.join(root,'scripts/donaldson_crm_results.jsonl');
const scraperProgress = path.join(root,'scripts/donaldson_crm_progress.json');
const readLines = p => fs.existsSync(p) ? fs.readFileSync(p,'utf8').split(/\r?\n/)
  .map(x => x.replace(/^\uFEFF/,'').trim()).filter(Boolean) : [];
const parseRows = p => readLines(p).flatMap(line => {
  try { return [JSON.parse(line)]; } catch { return []; }
});
const normalize = x => String(x||'').replace(/[^A-Z0-9]/ig,'').toUpperCase();
const trusted = row => {
  try {
    return row.status === 'OK' && row.audit?.expansion_complete &&
      new URL(row.source_url).hostname === 'shop.donaldson.com' &&
      normalize(row.codigo_base) === normalize(row.official?.part_number);
  } catch { return false; }
};
const eligible = new Set(pending);
const existing = new Map(parseRows(scrapeResult).filter(x => eligible.has(normalize(x.codigo_base)) && trusted(x))
  .map(x => [normalize(x.codigo_base),x]));
const toScrape = pending.filter(code => !existing.has(code));
fs.writeFileSync(input,JSON.stringify(toScrape,null,2)+'\n');
// The existing scraper tracks completed parts globally; clear the pending parts from its progress
// so a stale ERROR/NOT_FOUND status does not suppress a fresh research attempt.
if (fs.existsSync(scraperProgress)) {
  const prior=JSON.parse(fs.readFileSync(scraperProgress,'utf8'));
  prior.done=(prior.done||[]).filter(x=>!toScrape.includes(normalize(x)));
  fs.writeFileSync(scraperProgress,JSON.stringify(prior,null,2)+'\n');
}
const run = (command,args,env=process.env) => {
  const result=spawnSync(command,args,{cwd:root,env,stdio:'inherit',shell:false,windowsHide:true});
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(command+' returned '+result.status);
};
let researchBlocked = false;
if (toScrape.length && !process.argv.includes('--offline')) {
  try {
    const mapPath=path.join(evidenceDir,'donaldson-db-official-product-urls.json');
    const urlMap=fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath,'utf8').replace(/^\uFEFF/,'')) : {};
    run(process.execPath,['scripts/scrape_donaldson_crm.js','--input',input,
      ...(Object.keys(urlMap).length?['--url-map',mapPath]:[])]);

  } catch (error) {
    researchBlocked = true;
    console.error('[HERMES] Donaldson research stopped. Existing verified evidence will be reconciled; no access-control retry.');
  }
}
for (const row of parseRows(scrapeResult)) {
  const code=normalize(row.codigo_base);
  if (eligible.has(code) && trusted(row)) existing.set(code,row);
}
const merged = new Map();
for (const row of parseRows(all)) {
  const code=normalize(row.codigo_base);
  if (!code) continue;
  if (trusted(row)) merged.set(code,row);
}
for (const [code,row] of existing) merged.set(code,row);
fs.writeFileSync(combined,[...merged.values()].map(x=>JSON.stringify(x)).join('\n')+'\n','utf8');
const recovered = pending.filter(code => merged.has(code));
if (recovered.length === 0) {
  const summary={outcome:researchBlocked?'BLOCKED_OFFICIAL_SITE_ACCESS':'NO_NEW_OFFICIAL_EVIDENCE',
    requested:pending.length,recovered_official:0,published_this_pass:0,
    unresolved:pending,blocked_access:researchBlocked,
    note:'Previous publications and the original pending report are preserved.'};
  const summaryPath=path.join(evidenceDir,'donaldson-db-pending-research-summary.json');
  fs.writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
  process.exitCode=researchBlocked?2:0;
} else {
// The source archive is not mutated: the verified merged file is a new immutable input.
const snapshotDir=path.join(root,'hermes/catalogue-snapshots');
const before=new Set(fs.readdirSync(snapshotDir).filter(f=>/^elimfilters-catalogue-.*\.json$/.test(f)));
run(process.execPath,['scripts/hermes/export-catalogue-snapshot.mjs']);
const newFiles=fs.readdirSync(snapshotDir).filter(f=>/^elimfilters-catalogue-.*\.json$/.test(f) && !before.has(f));
if (newFiles.length!==1) throw new Error('Expected exactly one fresh PostgreSQL snapshot');
const snapshot=path.join(snapshotDir,newFiles[0]);
const publish = process.argv.includes('--apply');
if (publish) {
  if (!process.argv.includes('--approve-knowledge') || !process.argv.includes('--approve-catalogue')) throw new Error('Explicit approval flags required');
  if (process.env.HERMES_CATALOGUE_PUBLISH_LIVE!=='true') throw new Error('Live publication gate required');
}
run(process.execPath,['scripts/hermes/publish-donaldson-db-batch.mjs',snapshot,combined,
  ...(publish?['--approve-knowledge','--approve-catalogue','--apply']:[])]);
const after=JSON.parse(fs.readFileSync(reportPath,'utf8'));
const summary={outcome:researchBlocked?'PARTIAL_OFFICIAL_SITE_ACCESS':publish?'BATCH_PUBLICATION_ATTEMPTED':'PREVIEW_ONLY',
  requested:pending.length,recovered_official:recovered.length,blocked_access:researchBlocked,
  unresolved:after.items.filter(x=>x.status==='MISSING_OFFICIAL_EVIDENCE').map(x=>x.base),
  official_rows_found:recovered,
  publication_ready:after.ready,published_this_pass:after.published,
  blocked:after.blocked,errors:after.errors,snapshot,report:reportPath};
const summaryPath=path.join(evidenceDir,'donaldson-db-pending-research-summary.json');
fs.writeFileSync(summaryPath,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));

}
