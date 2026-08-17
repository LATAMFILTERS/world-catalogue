#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { resolveRealCandidatesInputDir } from './hermes-core.mjs';
const inputDir=path.resolve(process.argv[2]||resolveRealCandidatesInputDir());
if(!fs.existsSync(inputDir)) process.exit(0);
let ready=0,research=0,rejected=0,invalid=0;
for(const file of fs.readdirSync(inputDir).filter(f=>f.endsWith('.json')).sort()){
 try{const c=JSON.parse(fs.readFileSync(path.join(inputDir,file),'utf8')); if(c.workflow_status==='PENDING_REVIEW'&&c.groq_resolution?.resolution_status==='READY') ready++; else if(c.workflow_status==='NEEDS_RESEARCH') research++; else if(c.workflow_status==='REJECTED') rejected++;}catch{invalid++;}}
const out={ready_for_review:ready,needs_research:research,rejected,invalid};
fs.mkdirSync('hermes/reports',{recursive:true});
fs.writeFileSync('hermes/reports/groq-resolution-summary.json',JSON.stringify(out,null,2)+'\n');
console.log(`[HERMES Groq summary] ready=${ready} research=${research} rejected=${rejected} invalid=${invalid}`);
