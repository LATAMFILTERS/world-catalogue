#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.env.ELIMSERVER_ROOT||'C:\\ELIMSERVER';
const STATE=path.join(ROOT,'state','hermes');
const PORT=Number(process.env.HERMES_DASHBOARD_PORT||8788);
const readJson=p=>{try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return null;}};
const latest=(prefix)=>{try{return fs.readdirSync(STATE).filter(f=>f.startsWith(prefix)&&f.endsWith('.json')).map(f=>({f,t:fs.statSync(path.join(STATE,f)).mtimeMs})).sort((a,b)=>b.t-a.t)[0]?.f||null;}catch{return null;}};
function snapshot(){
  const operational=readJson(path.join(STATE,'operational-validation.json'));
  const pending=readJson(path.join(STATE,'recovery-pending.json'));
  const sweepFile=latest('sweep-');
  const researchFile=latest('research-');
  const sweep=sweepFile?readJson(path.join(STATE,sweepFile)):null;
  const research=researchFile?readJson(path.join(STATE,researchFile)):null;
  const completed=Array.isArray(sweep?.completed_work)?sweep.completed_work.length:0;
  const deferred=research?.items?Object.values(research.items).filter(x=>x&&x.status==='DEFERRED'&&!x.terminal).length:0;
  return {generatedAt:new Date().toISOString(),operational,pending,sweep:{file:sweepFile,completed,total:sweep?.total_work||0,complete:!!sweep?.complete,resumeReason:sweep?.last_run_summary?.resume_reason||null},research:{file:researchFile,deferred,resumeRequired:!!research?.last_summary?.resume_required,lastSummary:research?.last_summary||null}};
}
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function html(s){const status=s.operational?.status||'UNKNOWN';const valid=s.operational?.valid===true?'VALID':'CHECK';return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="30"><title>HERMES Dashboard</title><style>body{font-family:Segoe UI,Arial;background:#0b0b0b;color:#f4f4f4;margin:0}header{padding:24px 30px;border-bottom:4px solid #ffd400}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:24px}.card{background:#171717;border:1px solid #333;border-radius:10px;padding:18px}.v{font-size:24px;font-weight:700;margin:8px 0}.s{color:#aaa;font-size:13px}pre{margin:0 24px 24px;padding:18px;background:#111;border:1px solid #333;border-radius:10px;white-space:pre-wrap}</style></head><body><header><h1>ELIMFILTERS® HERMES Dashboard</h1><div class="s">Technical intelligence · ${esc(s.generatedAt)}</div></header><div class="grid"><div class="card"><b>Operational State</b><div class="v">${esc(status)}</div><div class="s">${esc(valid)}</div></div><div class="card"><b>Sweep</b><div class="v">${s.sweep.completed}/${s.sweep.total}</div><div class="s">${esc(s.sweep.resumeReason|| (s.sweep.complete?'COMPLETE':'PENDING'))}</div></div><div class="card"><b>Research Deferred</b><div class="v">${s.research.deferred}</div><div class="s">resumeRequired=${s.research.resumeRequired}</div></div><div class="card"><b>Recovery Pending</b><div class="v">${s.pending?'YES':'NO'}</div><div class="s">${esc(s.pending?.failed?.join(', ')||'')}</div></div></div><pre>${esc(JSON.stringify(s,null,2))}</pre></body></html>`;}
http.createServer((req,res)=>{const s=snapshot();if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,status:s.operational?.status||'UNKNOWN'}));}if(req.url==='/api/status'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(s,null,2));}res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html(s));}).listen(PORT,'127.0.0.1',()=>console.log(`HERMES Dashboard http://127.0.0.1:${PORT}`));
