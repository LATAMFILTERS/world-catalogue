#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const root = path.join(repoRoot, 'elimfilters-vault/13-canonical-knowledge');
const out = path.join(repoRoot, 'frontend/src/generated/canonical-knowledge.json');
const forbiddenRoots = ['12-knowledge-candidates','hermes/structured-knowledge','hermes/validation-evidence'];

function walk(dir, files=[]) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) { const f=path.join(dir,e.name); if(e.isDirectory()) walk(f,files); else if(e.name.endsWith('.md')) files.push(f); } return files; }
function fm(text) { const m=text.match(/^---\s*\n([\s\S]*?)\n---/); const o={}; if(!m)return o; for(const line of m[1].split(/\r?\n/)){const i=line.indexOf(':');if(i>0)o[line.slice(0,i).trim()]=line.slice(i+1).trim().replace(/^"|"$/g,'');} return o; }
function section(text, name) { const esc=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const m=text.match(new RegExp(`## ${esc}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`)); if(!m)return []; return m[1].split(/\r?\n/).map(x=>x.trim()).filter(x=>/^(- |\d+\. )/.test(x)&&!/None recorded|No neutral evidence/i.test(x)).map(x=>x.replace(/^(- |\d+\. )/,'').replace(/\s*\|\s*status:\s*approved\s*$/i,'').trim()); }
function position(text,key){const line=section(text,'Knowledge Position').find(x=>x.startsWith(`${key}:`));return line?line.slice(key.length+1).trim().split(';').map(x=>x.trim()).filter(Boolean):[];}
function slug(id){return id.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function dedupe(a){return [...new Set(a.filter(Boolean))];}

if(!fs.existsSync(root)) throw new Error(`Canonical knowledge root missing: ${root}`);
if(forbiddenRoots.some(x=>root.replaceAll('\\','/').includes(x))) throw new Error('Refusing to build public index from a non-canonical root');
const records=[];
for(const file of walk(root)){
 const text=fs.readFileSync(file,'utf8'); const meta=fm(text);
 if(meta.type!=='canonical_knowledge'||meta.status!=='approved'||meta.publication_status!=='approved'||meta.public_use_allowed!=='true') throw new Error(`Non-approved record in canonical root: ${file}`);
 const id=meta.knowledge_object_id; if(!id) throw new Error(`Missing knowledge_object_id: ${file}`);
 const rec={
  id, slug:slug(id), title:meta.title, domain:meta.domain, contentType:meta.knowledge_content_type, confidence:meta.confidence,
  industries:position(text,'Industries'), systems:position(text,'Systems'), technologies:position(text,'Technologies'),
  components:section(text,'Components'), problems:section(text,'Problems'), failureModes:section(text,'Failure Modes'), symptoms:section(text,'Symptoms'),
  rootCauses:section(text,'Root Causes'), diagnosticMethods:section(text,'Diagnostic Methods'), correctiveActions:section(text,'Corrective Actions'),
  maintenanceProcedures:section(text,'Maintenance Procedures'), procedures:section(text,'Procedures'), technicalRelationships:section(text,'Technical Relationships — Validated'),
  operatingConditions:section(text,'Operating Conditions'), standards:section(text,'Standards'), sharedEngineering:section(text,'Shared Engineering').map(x=>x.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,'$2')),
 };
 rec.keywords=dedupe([rec.title,rec.domain,rec.contentType,...rec.industries,...rec.systems,...rec.technologies,...rec.components,...rec.problems,...rec.failureModes,...rec.symptoms,...rec.rootCauses,...rec.diagnosticMethods,...rec.correctiveActions,...rec.technicalRelationships,...rec.operatingConditions,...rec.standards,...rec.sharedEngineering]);
 const publicText=JSON.stringify(rec);
 if(/\bFRAM\b|fram\.com|https?:\/\/|EVID-|source_evidence|validation_sources|12-knowledge-candidates/i.test(publicText)) throw new Error(`Public canonical projection leak: ${id}`);
 records.push(rec);
}
records.sort((a,b)=>a.id.localeCompare(b.id));
fs.mkdirSync(path.dirname(out),{recursive:true}); fs.writeFileSync(out,JSON.stringify({schemaVersion:'1.0.0',sourceAuthority:'13-canonical-knowledge',generatedAt:new Date().toISOString(),count:records.length,records},null,2)+'\n');
console.log(`[canonical index] records=${records.length} authority=13-canonical-knowledge output=${path.relative(process.cwd(),out).replaceAll('\\','/')}`);
