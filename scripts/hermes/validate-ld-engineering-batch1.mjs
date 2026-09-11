#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const apply = process.argv.includes('--apply');
const ledgerPath = path.resolve('elimfilters-vault/12-knowledge-candidates/_reviews/TECHNICAL_VALIDATION_LEDGER.json');
const evidencePath = path.resolve('hermes/validation-evidence/ld-engineering-standards-batch1.json');
const reportDir = path.resolve('hermes/nodal-promotion-reports');
const reviewer = 'ELIMFILTERS AI Engineering Validation — Standards Corroboration';
const reviewedAt = new Date().toISOString();

const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
const evidenceRegistry = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
const validEvidenceIds = new Set((evidenceRegistry.sources || []).map((x) => x.evidence_id));

const relationshipApprovals = [
  {
    text: 'Oil-filter protection depends on balancing particle capture efficiency, contaminant-holding capacity and lubricant flow rather than optimizing a single parameter.',
    method: 'standard_reference', evidence: ['EVID-VAL45481','EVID-VAL454812']
  },
  {
    text: 'A micron value does not define filtration performance unless it is paired with capture efficiency at that particle size.',
    method: 'standard_reference', evidence: ['EVID-VAL454812']
  },
  {
    text: 'Excessive pressure difference across the filter can trigger bypass operation so lubricant flow can continue around the restricted media.',
    method: 'standard_reference', evidence: ['EVID-VAL45481','EVID-VAL45482']
  },
  {
    text: 'During bypass operation, lubrication flow may continue while filtration through the main media is temporarily reduced or absent.',
    method: 'engineering_review', evidence: ['EVID-VAL45482']
  },
  {
    text: 'A bypass setting must be treated as application-specific rather than as a universal filter value.',
    method: 'standard_reference', evidence: ['EVID-VAL45482']
  },
  {
    text: 'Increasing contaminant loading consumes available media capacity and can raise flow restriction.',
    method: 'standard_reference', evidence: ['EVID-VAL454812']
  },
  {
    text: 'Media saturation can increase pressure differential and raise the likelihood of bypass operation in systems designed with a bypass function.',
    method: 'standard_reference', evidence: ['EVID-VAL454812','EVID-VAL45482']
  },
  {
    text: 'Physical similarity does not establish functional interchangeability between oil filters.',
    method: 'engineering_review', evidence: ['EVID-VAL45481','EVID-VAL45482','EVID-VAL454812']
  },
  {
    text: 'Correct fitment requires compatible sealing, attachment geometry and application-specific flow and pressure-control requirements.',
    method: 'engineering_review', evidence: ['EVID-VAL45481','EVID-VAL45482']
  },
  {
    text: 'Oil-filter architecture combines the filtration element with structural, sealing and flow-control components whose functions depend on the application.',
    method: 'engineering_review', evidence: ['EVID-VAL45481','EVID-VAL45482','EVID-VAL454812']
  },
  {
    text: 'Spin-on and cartridge designs package these functions differently even when both perform engine-lubricant filtration.',
    method: 'engineering_review', evidence: ['EVID-VAL45481','EVID-VAL454812']
  },
  {
    text: 'Lower lubricant temperature generally increases viscosity, which can increase resistance to flow during cold-start conditions.',
    method: 'standard_reference', evidence: ['EVID-VALJ300','EVID-VAL45485']
  },
  {
    text: 'Cold-start flow demand can increase pressure differential across the filter and make correct application-specific flow and bypass characteristics important.',
    method: 'standard_reference', evidence: ['EVID-VAL45485','EVID-VAL45481','EVID-VAL45482']
  },
  {
    text: 'Engine-air-filter service life varies with dust exposure, operating environment and vehicle usage rather than mileage alone.',
    method: 'engineering_review', evidence: ['EVID-VAL5011']
  },
  {
    text: 'Higher airborne contaminant loading can accelerate media loading and increase intake restriction.',
    method: 'standard_reference', evidence: ['EVID-VAL5011']
  },
  {
    text: 'Engine-air-filter designs must provide particle capture while maintaining acceptable airflow and sealing within the intake housing.',
    method: 'engineering_review', evidence: ['EVID-VAL5011']
  },
  {
    text: 'The cabin filter removes airborne particulate matter from air entering the passenger-compartment HVAC path.',
    method: 'standard_reference', evidence: ['EVID-VAL111551']
  },
  {
    text: 'As contaminant loading increases, airflow through the element can decline and service replacement becomes necessary.',
    method: 'engineering_review', evidence: ['EVID-VAL111551']
  },
  {
    text: 'Activated-carbon cabin media adds adsorption capability for selected gases and odors while the filter structure continues to manage particulate contamination.',
    method: 'standard_reference', evidence: ['EVID-VAL111552','EVID-VAL111551']
  },
  {
    text: 'Adsorption capacity is finite and should be treated as a service-life property rather than a permanent function.',
    method: 'engineering_review', evidence: ['EVID-VAL111552']
  },
  {
    text: 'High contaminant exposure can shorten effective cabin-filter service life compared with operation in cleaner conditions.',
    method: 'engineering_review', evidence: ['EVID-VAL111551']
  }
];

const invalidMetricRules = [
  { test: (line) => /:\s*000 miles\b/i.test(line), reason: 'truncated or malformed mileage extraction; numeric value is incomplete' },
  { test: (line) => /Filtration Efficiency:\s*\d+(?:\.\d+)?\s*psi\b/i.test(line), reason: 'pressure unit cannot represent filtration efficiency' },
  { test: (line) => /Service Interval:\s*[^|]*%/i.test(line), reason: 'percentage cannot represent a service interval' },
  { test: (line) => /Filtration Efficiency:\s*[^|]*(?:month|months)\b/i.test(line), reason: 'time unit cannot represent filtration efficiency' },
  { test: (line) => /Particle Size \/ Micron Rating:\s*[^|]*%/i.test(line), reason: 'percentage cannot represent particle size or micron rating' },
  { test: (line) => /Filtration Efficiency:\s*\d+(?:\.\d+)?\s*microns?\b/i.test(line), reason: 'micron value requires paired efficiency context and is misclassified as efficiency' }
];

function findApproval(line) {
  return relationshipApprovals.find((rule) => line.includes(rule.text));
}

const result = {
  mode: apply ? 'APPLY' : 'DRY_RUN',
  reviewed_at: reviewedAt,
  relationships_approved: [],
  relationships_pending: [],
  metrics_rejected: [],
  metrics_pending: []
};

for (const item of ledger.relationship_reviews || []) {
  const rule = findApproval(item.source_line || '');
  if (!rule) {
    result.relationships_pending.push(item.item_id);
    continue;
  }
  for (const evidenceId of rule.evidence) {
    if (!validEvidenceIds.has(evidenceId)) throw new Error(`Unknown validation evidence ID: ${evidenceId}`);
  }
  result.relationships_approved.push(item.item_id);
  if (apply) Object.assign(item, {
    decision: 'approved',
    validation_method: rule.method,
    supporting_evidence_ids: rule.evidence,
    reviewer,
    reviewed_at: reviewedAt,
    notes: 'Independently corroborated against governed engineering standards; source corpus was not used as sole validation authority.'
  });
}

for (const item of ledger.metric_reviews || []) {
  const rule = invalidMetricRules.find((candidate) => candidate.test(item.source_line || ''));
  if (!rule) {
    result.metrics_pending.push(item.item_id);
    continue;
  }
  result.metrics_rejected.push(item.item_id);
  if (apply) Object.assign(item, {
    decision: 'rejected',
    validation_method: 'engineering_review',
    supporting_evidence_ids: [],
    reviewer,
    reviewed_at: reviewedAt,
    notes: `Rejected from canonical knowledge: ${rule.reason}. Candidate must be corrected/regenerated before promotion.`
  });
}

if (apply) {
  ledger.last_validation_batch = {
    batch_id: 'LD_ENGINEERING_BATCH_1',
    reviewed_at: reviewedAt,
    reviewer,
    relationship_approvals: result.relationships_approved.length,
    metric_rejections: result.metrics_rejected.length,
    independent_evidence_registry: 'hermes/validation-evidence/ld-engineering-standards-batch1.json'
  };
  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
}

fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, `ld-engineering-validation-batch1-${reviewedAt.replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n', 'utf8');
console.log(`[LD engineering validation batch 1] mode=${result.mode}`);
console.log(`[LD engineering validation batch 1] relationships approved=${result.relationships_approved.length} pending=${result.relationships_pending.length}`);
console.log(`[LD engineering validation batch 1] metrics rejected=${result.metrics_rejected.length} pending=${result.metrics_pending.length}`);
console.log(`[LD engineering validation batch 1] report=${path.relative(process.cwd(), reportPath).replaceAll('\\', '/')}`);
