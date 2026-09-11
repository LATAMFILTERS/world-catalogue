#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const ledgerPath = path.resolve('elimfilters-vault/12-knowledge-candidates/_reviews/TECHNICAL_VALIDATION_LEDGER.json');
const candidateRoot = path.resolve('elimfilters-vault/12-knowledge-candidates');
const reportDir = path.resolve('hermes/nodal-promotion-reports');
const reviewer = 'ELIMFILTERS AI Engineering Validation — OEM/Standards Corroboration';
const reviewedAt = new Date().toISOString();

const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const evidenceFiles = [
  'hermes/validation-evidence/ld-engineering-standards-batch1.json',
  'hermes/validation-evidence/ld-engineering-oem-batch2.json'
];
const validEvidenceIds = new Set(evidenceFiles.flatMap((file) => (JSON.parse(fs.readFileSync(file, 'utf8')).sources || []).map((x) => x.evidence_id)));

const relationshipRules = new Map([
  ['REL-7F943CADFBC30E8A', ['engineering_review',['EVID-VAL5011','EVID-VALFORD-AIR']]],
  ['REL-D37C7B131601986B', ['engineering_review',['EVID-VALTOYOTA-CABIN']]],
  ['REL-FC7C74691B99FA8C', ['engineering_review',['EVID-VAL111551','EVID-VALTOYOTA-CABIN','EVID-VALTOYOTA-MAINT']]],
  ['REL-B5E977E1338ECC95', ['engineering_review',['EVID-VAL45485','EVID-VAL454812']]],
  ['REL-4DBF312810894F2B', ['engineering_review',['EVID-VAL45481','EVID-VAL45482','EVID-VAL454812']]],
  ['REL-68E5CD3FD6FF27E7', ['cross_source_validation',['EVID-VALNHTSA-LOWOIL1','EVID-VALNHTSA-LOWOIL2']]],
  ['REL-C778BC2D662A21E8', ['cross_source_validation',['EVID-VALNHTSA-LOWOIL1','EVID-VALNHTSA-LOWOIL2']]],
  ['REL-9DA75FD97C08DF06', ['engineering_review',['EVID-VALJ300','EVID-VAL5011','EVID-VALTOYOTA-MAINT']]],
  ['REL-EA596FA33062FE6A', ['engineering_review',['EVID-VALTOYOTA-MAINT','EVID-VALTOYOTA-CABIN']]],
  ['REL-83D52A08B514965E', ['engineering_review',['EVID-VAL454812','EVID-VAL5011','EVID-VAL111551']]],
  ['REL-5B9AA1D2C2681613', ['cross_source_validation',['EVID-VALFORD-AIR','EVID-VALTOYOTA-CABIN','EVID-VALNHTSA-OIL-SERVICE']]]
]);

const procedureEvidence = new Map([
  ['PROC-3F893A3BF0AB3950',['EVID-VALFORD-AIR']],
  ['PROC-51FD83DC177CBF97',['EVID-VALFORD-AIR']],
  ['PROC-3FFA64BCF9069226',['EVID-VALFORD-AIR']],
  ['PROC-4858E0B1204F7449',['EVID-VALFORD-AIR']],
  ['PROC-E1D1FE9F5CDA8C6D',['EVID-VALTOYOTA-CABIN']],
  ['PROC-22B7E2A1B2A1D4E2',['EVID-VALTOYOTA-CABIN']],
  ['PROC-78FA14F2D899E28E',['EVID-VALTOYOTA-CABIN']],
  ['PROC-2B762B08AB5EC09C',['EVID-VALNHTSA-OIL-SERVICE']],
  ['PROC-199A8D6D71930C29',['EVID-VALNHTSA-OIL-SERVICE']],
  ['PROC-4CB50144CB6359DD',['EVID-VALNHTSA-OLDGASKET','EVID-VALNHTSA-OIL-SERVICE']],
  ['PROC-6D20217485CA126A',['EVID-VALNHTSA-OIL-SERVICE']]
]);

function ensureEvidence(ids) {
  for (const id of ids) if (!validEvidenceIds.has(id)) throw new Error(`Unknown evidence ID: ${id}`);
}
function walk(dir, out=[]) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if (entry.name === '_reviews') continue;
    const full = path.join(dir,entry.name);
    if (entry.isDirectory()) walk(full,out); else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}
function metricReason(line='') {
  if (/Service Interval:/i.test(line)) return 'service interval is vehicle/application/operating-condition specific and cannot be promoted as a universal ELIMFILTERS value';
  if (/Pressure \/ Bypass Setting:/i.test(line)) return 'bypass pressure is application-specific and requires validated product/application authority';
  if (/Particle Size \/ Micron Rating:/i.test(line)) return 'standalone micron value lacks paired efficiency/test-method context and cannot define generic filtration performance';
  if (/Filtration Efficiency:/i.test(line)) return 'efficiency percentage lacks required particle-size, method, product and application context for canonical generic use';
  return 'source-reported numeric value lacks a defined governed parameter, method and application context';
}

const result = {mode:apply?'APPLY':'DRY_RUN', reviewed_at:reviewedAt, relationships_approved:[], procedures_approved:[], metrics_rejected:[], notes_cleaned:0};

for (const item of ledger.relationship_reviews || []) {
  if (item.decision === 'approved') continue;
  const rule = relationshipRules.get(item.item_id);
  if (!rule) continue;
  const [method,evidence] = rule; ensureEvidence(evidence);
  result.relationships_approved.push(item.item_id);
  if (apply) Object.assign(item,{decision:'approved',validation_method:method,supporting_evidence_ids:evidence,reviewer,reviewed_at:reviewedAt,notes:'Validated independently against governed standards/OEM diagnostic or service evidence and ELIMFILTERS engineering review.'});
}

for (const item of ledger.procedure_reviews || []) {
  if (item.decision === 'approved') continue;
  const evidence = procedureEvidence.get(item.item_id);
  if (!evidence) continue;
  ensureEvidence(evidence); result.procedures_approved.push(item.item_id);
  if (apply) Object.assign(item,{decision:'approved',validation_method:'engineering_review',supporting_evidence_ids:evidence,reviewer,reviewed_at:reviewedAt,notes:'Procedure is intentionally generic; vehicle-specific torque, access and safety instructions remain controlled by the applicable service information.'});
}

const rejectedLines = new Set();
for (const item of ledger.metric_reviews || []) {
  if (item.decision !== 'needs_evidence') continue;
  result.metrics_rejected.push(item.item_id); rejectedLines.add(item.source_line);
  if (apply) Object.assign(item,{decision:'rejected',validation_method:'engineering_review',supporting_evidence_ids:[],reviewer,reviewed_at:reviewedAt,notes:`Rejected from canonical generic knowledge: ${metricReason(item.source_line)}.`});
}

if (apply) {
  for (const file of walk(candidateRoot)) {
    let text = fs.readFileSync(file,'utf8');
    const before = text;
    for (const line of rejectedLines) text = text.split(/\r?\n/).filter((x) => x.trim() !== String(line).trim()).join('\n');
    text = text.replace(/(## Metrics — Awaiting Validation\s*\n)(?=\n## )/g,'$1\n- None recorded\n');
    if (text !== before) { fs.writeFileSync(file,text.endsWith('\n')?text:text+'\n','utf8'); result.notes_cleaned++; }
  }
  ledger.last_validation_batch = {batch_id:'LD_ENGINEERING_BATCH_2',reviewed_at:reviewedAt,reviewer,relationship_approvals:result.relationships_approved.length,procedure_approvals:result.procedures_approved.length,metric_rejections:result.metrics_rejected.length,independent_evidence_registry:'hermes/validation-evidence/ld-engineering-oem-batch2.json'};
  fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n','utf8');
}

fs.mkdirSync(reportDir,{recursive:true});
const reportPath = path.join(reportDir,`ld-engineering-validation-batch2-${reviewedAt.replace(/[:.]/g,'-')}.json`);
fs.writeFileSync(reportPath,JSON.stringify(result,null,2)+'\n','utf8');
console.log(`[LD engineering validation batch 2] mode=${result.mode} relationships=${result.relationships_approved.length} procedures=${result.procedures_approved.length} metrics_rejected=${result.metrics_rejected.length} notes_cleaned=${result.notes_cleaned}`);
console.log(`[LD engineering validation batch 2] report=${path.relative(root,reportPath).replaceAll('\\','/')}`);
