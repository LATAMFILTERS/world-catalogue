#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const ROOT = process.env.ELIMSERVER_ROOT || 'C:\\ELIMSERVER';
const REPO = process.env.ELIMSERVER_REPO || path.join(ROOT, 'repos', 'world-catalogue');
const STATE = path.join(ROOT, 'state');
const HERMES = path.join(STATE, 'hermes');
const PORT = Number(process.env.ELIMSERVER_DASHBOARD_PORT || 8787);

const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } };
const exists = (p) => fs.existsSync(p);
const git = (...args) => { try { return execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', windowsHide: true }).trim(); } catch { return null; } };
const latestByPrefix = (dir, prefix) => { try { const files = fs.readdirSync(dir).filter(f=>f.startsWith(prefix)&&f.endsWith('.json')).map(f=>({f,t:fs.statSync(path.join(dir,f)).mtimeMs})).sort((a,b)=>b.t-a.t); return files[0]?.f ? readJson(path.join(dir, files[0].f)) : null; } catch { return null; } };
const alertList = () => { const dir=path.join(STATE,'alerts'); try { return fs.readdirSync(dir).filter(f=>f.endsWith('.json')).map(f=>({file:f,data:readJson(path.join(dir,f)),mtime:fs.statSync(path.join(dir,f)).mtimeMs})).filter(x=>x.data).sort((a,b)=>b.mtime-a.mtime).slice(0,20).map(x=>x.data); } catch { return []; } };

function snapshot(){
  const operational = readJson(path.join(HERMES,'operational-validation.json'));
  const pending = readJson(path.join(HERMES,'recovery-pending.json'));
  const sweep = latestByPrefix(HERMES,'sweep-');
  const research = latestByPrefix(HERMES,'research-');
  const health = readJson(path.join(STATE,'server-health.json'));
  const agents = readJson(path.join(REPO,'config','elimserver','agents.json'));
  const workflows = readJson(path.join(REPO,'config','elimserver','workflows.json'));
  const crmPath = path.join(ROOT,'repos','elimfilters-crm');
  const alerts = alertList();
  return {
    generatedAt:new Date().toISOString(), host:os.hostname(), platform:os.platform(), uptimeSeconds:Math.round(os.uptime()),
    git:{commit:git('rev-parse','--short','HEAD'), branch:git('rev-parse','--abbrev-ref','HEAD'), dirty:!!git('status','--porcelain')},
    hermes:{operational,pending,sweep,research}, health, alerts,
    services:{worldCatalogue:exists(REPO), crm:exists(crmPath), nodal:exists(path.join(ROOT,'nodal-center')), backups:exists(path.join(ROOT,'backups'))},
    agents, workflows
  };
}

const esc = s => String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function html(s){
  const op=s.hermes.operational||{}; const sw=s.hermes.sweep||{}; const health=s.health||{};
  const openAlerts=s.alerts.filter(a=>a.status!=='CLOSED');
  const cards=[
    ['HERMES', op.status||'UNKNOWN', op.valid===true?'VALID':'CHECK'],
    ['Sweep', `${Array.isArray(sw.completed_work)?sw.completed_work.length:0}/${sw.total_work??0}`, sw.complete?'COMPLETE':(sw.last_run_summary?.resume_reason||'PENDING')],
    ['Server', health.overall||'UNKNOWN', health.generatedAt||''],
    ['CEO Alerts', String(openAlerts.length), openAlerts[0]?.summary||'No open material alerts'],
    ['CRM', s.services.crm?'INSTALLED':'MISSING', 'Commercial system'],
    ['Nodal Center', s.services.nodal?'READY':'MISSING', 'Governed knowledge'],
    ['Backups', s.services.backups?'READY':'MISSING', 'Local retention']
  ];
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="30"><title>ELIMFILTERS Command Center</title><style>body{font-family:Segoe UI,Arial;background:#0d0d0d;color:#f5f5f5;margin:0}header{padding:24px 30px;border-bottom:4px solid #ffd400}h1{margin:0;font-size:28px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:24px}.card{background:#171717;border:1px solid #333;border-radius:10px;padding:18px}.v{font-size:24px;font-weight:700;margin:8px 0}.s{color:#aaa;font-size:13px}pre{white-space:pre-wrap;background:#111;padding:18px;margin:0 24px 24px;border:1px solid #333;border-radius:10px;color:#ddd}</style></head><body><header><h1>ELIMFILTERS® CEO Command Center</h1><div class="s">${esc(s.host)} · commit ${esc(s.git.commit)} · ${esc(s.generatedAt)}</div></header><div class="grid">${cards.map(c=>`<div class="card"><b>${esc(c[0])}</b><div class="v">${esc(c[1])}</div><div class="s">${esc(c[2])}</div></div>`).join('')}</div><pre>${esc(JSON.stringify({pending:s.hermes.pending,operational:s.hermes.operational,health:s.health,alerts:s.alerts.slice(0,5)},null,2))}</pre></body></html>`;
}

http.createServer((req,res)=>{
  const s=snapshot();
  if(req.url==='/api/status'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(s,null,2));}
  if(req.url==='/api/alerts'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify(s.alerts,null,2));}
  if(req.url==='/health'){res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,at:s.generatedAt}));}
  res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html(s));
}).listen(PORT,'127.0.0.1',()=>console.log(`ELIMSERVER Command Center http://127.0.0.1:${PORT}`));
