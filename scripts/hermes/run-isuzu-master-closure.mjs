#!/usr/bin/env node
import {spawnSync} from 'node:child_process';

const apply=process.argv.includes('--apply');
const run=(args)=>{
 const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
 if(r.status!==0)process.exit(r.status||1);
};

run(['scripts/hermes/resolve-isuzu-v160-official-evidence.mjs']);
if(apply)run(['scripts/hermes/materialize-isuzu-v151-products.mjs','--manifest','scripts/hermes/isuzu-v160-materialize-oem.json','--apply']);
run(['scripts/hermes/compile-isuzu-v160-execution-plan.mjs']);
if(apply){
 run(['scripts/hermes/release-isuzu-v160-matrix.mjs','--apply']);
 run(['scripts/hermes/audit-isuzu-v160-matrix.mjs']);
 run(['scripts/hermes/hydrate-isuzu-v160-decision-ledger.mjs']);
 run(['scripts/hermes/compile-isuzu-v160-execution-plan.mjs']);
}
run(['scripts/hermes/isuzu-v160-control-plane.mjs']);
