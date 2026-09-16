'use strict';
const fs = require('fs');
const { spawnSync } = require('child_process');
const path = require('path');
const ROOT = __dirname;
const INPUT = path.join(ROOT,'donaldson_hd_air_active_codes.json');
const RESULTS = path.join(ROOT,'donaldson_hd_air_deep_20260911_results.jsonl');
const PROGRESS = path.join(ROOT,'donaldson_hd_air_deep_20260911_progress.json');
const MATRIX = path.join(ROOT,'donaldson_hd_air_completion_matrix_20260912.json');
const CSV = path.join(ROOT,'donaldson_hd_air_completion_matrix_20260912.csv');
const LOG = path.join(ROOT,'donaldson_hd_air_resilient_supervisor.log');
const LOCK = path.join(ROOT,'donaldson_hd_air_resilient_supervisor.lock');
const WORKER = path.join(ROOT,'scrape_donaldson_hd_air_deep_20260911.js');
const MAX_ATTEMPTS_PER_PASS = 2;
const sleep = ms => new Promise(r=>setTimeout(r,ms));
function log(s){ const line=`${new Date().toISOString()} ${s}`; fs.appendFileSync(LOG,line+'\n'); console.log(line); }
function loadJson(p,f){try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return f;}}
function codes(){const x=loadJson(INPUT,[]);return [...new Set((Array.isArray(x)?x:(x.codes||[])).map(v=>String(v).trim().toUpperCase()).filter(Boolean))];}
function rows(){if(!fs.existsSync(RESULTS))return[];return fs.readFileSync(RESULTS,'utf8').split(/\r?\n/).filter(Boolean).flatMap(x=>{try{return[JSON.parse(x)]}catch{return[]}});}
function codeOf(r){return String(r.codigo_base||r.part_number||r.requested_code||'').trim().toUpperCase();}
function isVerifiedOk(r){return r.status==='OK' && (!r.audit || (r.audit.expansion_complete===true && Number(r.audit.remaining_show_more||0)===0 && Number(r.audit.remaining_plus||0)===0));}
function buildMatrix(allCodes){const allRows=rows();const by=new Map();for(const r of allRows){const c=codeOf(r);if(!c)continue;if(!by.has(c))by.set(c,[]);by.get(c).push(r);}const items=allCodes.map(c=>{const h=by.get(c)||[];const ok=h.find(isVerifiedOk);const last=h[h.length-1]||{};return{codigo_base:c,complete:!!ok,attempts:h.length,last_status:ok?'OK':(last.status||'PENDING'),last_error:last.error||null,last_scraped_at:last.scraped_at||null};});const summary={target:allCodes.length,complete:items.filter(x=>x.complete).length,pending:items.filter(x=>!x.complete).length,ok:items.filter(x=>x.last_status==='OK').length,partial:items.filter(x=>x.last_status==='PARTIAL').length,not_found:items.filter(x=>x.last_status==='NOT_FOUND').length,error:items.filter(x=>x.last_status==='ERROR').length,untouched:items.filter(x=>x.last_status==='PENDING').length,updated_at:new Date().toISOString()};return{summary,items};}
function writeMatrix(m){fs.writeFileSync(MATRIX,JSON.stringify(m,null,2));const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const lines=['codigo_base,complete,attempts,last_status,last_error,last_scraped_at',...m.items.map(x=>[x.codigo_base,x.complete,x.attempts,x.last_status,x.last_error||'',x.last_scraped_at||''].map(q).join(','))];fs.writeFileSync(CSV,lines.join('\n'));}
function verifiedCodes(m){return m.items.filter(x=>x.complete).map(x=>x.codigo_base);}
function syncProgress(m){fs.writeFileSync(PROGRESS,JSON.stringify({done:verifiedCodes(m).sort(),updated_at:new Date().toISOString(),policy:'VERIFIED_OK_ONLY'},null,2));}
function pidAlive(pid){try{process.kill(pid,0);return true}catch{return false}}
function acquireLock(){const old=loadJson(LOCK,null);if(old?.pid&&pidAlive(Number(old.pid))){console.log(`Supervisor already running PID=${old.pid}`);process.exit(0);}fs.writeFileSync(LOCK,JSON.stringify({pid:process.pid,started_at:new Date().toISOString()}));}
function releaseLock(){try{fs.unlinkSync(LOCK)}catch{}}
function runOne(code){const out=spawnSync(process.execPath,[WORKER,'--part',code,'--headed'],{cwd:path.dirname(ROOT),encoding:'utf8',timeout:12*60*1000,maxBuffer:8*1024*1024});fs.appendFileSync(LOG,`\n--- worker ${code} exit=${out.status} signal=${out.signal||''} ---\n${out.stdout||''}\n${out.stderr||''}\n`);return out;}
async function main(){acquireLock();const allCodes=codes();if(allCodes.length!==1608)throw new Error(`Target mismatch: expected 1608 active codes, found ${allCodes.length}`);let pass=0;while(true){pass++;let m=buildMatrix(allCodes);writeMatrix(m);syncProgress(m);log(`[matrix] pass=${pass} complete=${m.summary.complete}/${m.summary.target} pending=${m.summary.pending} partial=${m.summary.partial} not_found=${m.summary.not_found} error=${m.summary.error}`);if(m.summary.complete===allCodes.length){fs.writeFileSync(path.join(ROOT,'donaldson_hd_air_1608_complete.marker'),JSON.stringify(m.summary,null,2));log('[complete] 1608/1608 verified OK');break;}const pending=m.items.filter(x=>!x.complete);let progressThisPass=0;for(const item of pending){for(let a=0;a<MAX_ATTEMPTS_PER_PASS;a++){m=buildMatrix(allCodes);const current=m.items.find(x=>x.codigo_base===item.codigo_base);if(current?.complete)break;syncProgress(m);log(`[retry] code=${item.codigo_base} attempt_in_pass=${a+1} historical_attempts=${current?.attempts||0}`);runOne(item.codigo_base);const after=buildMatrix(allCodes);writeMatrix(after);syncProgress(after);const now=after.items.find(x=>x.codigo_base===item.codigo_base);if(now?.complete){progressThisPass++;log(`[ok] ${item.codigo_base} attempts=${now.attempts}`);break;}log(`[still_pending] ${item.codigo_base} status=${now?.last_status} error=${now?.last_error||''}`);await sleep(1500);}}m=buildMatrix(allCodes);writeMatrix(m);syncProgress(m);log(`[pass_end] pass=${pass} complete=${m.summary.complete}/${m.summary.target} gained=${progressThisPass}`);if(progressThisPass===0){log('[backoff] no progress this pass; sleeping 120s before retry');await sleep(120000);}else await sleep(5000);}}
main().catch(e=>{log(`[fatal] ${e.stack||e}`);process.exitCode=1;}).finally(releaseLock);
