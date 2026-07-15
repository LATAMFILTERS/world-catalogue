#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const entitiesRoot = path.join(root, 'knowledge', 'entities');
const required = ['id','type','name','status','authority','owner','source','last_reviewed','evidence_status'];
const allowedTypes = new Set([
  'Technology','ProtectionSystem','Industry','ProductFamily','SKU','Standard','FailureMode','Contaminant',
  'EvidenceRecord','SourceDocument','Manufacturer','Equipment','Engine','Vehicle','OEMManufacturer','OEMCode',
  'CompetitorCode','CrossReferenceAssertion','Symptom','FailureScenario','RecommendationRule','CommercialAccount',
  'Supplier','CommercialOffer','SelectionDecision','InventoryPosition','CommercialRisk','CommercialOpportunity','ApprovalRecord'
]);
const allowedStatuses = new Set(['draft','under_review','approved','deprecated','rejected']);
const allowedEvidence = new Set(['unverified','under_review','validated','rejected','not_required']);
const allowedLifecycle = new Set(['active','inactive','superseded','unknown']);
const allowedConfidence = new Set(['hypothesis','plausible','supported','validated','rejected']);
const allowedSeverity = new Set(['low','moderate','high','critical']);
const allowedActions = new Set(['inspect','sample','review_selection','recommend_candidate','validated_recommendation']);
const allowedPrivacy = new Set(['internal','confidential','restricted']);
const allowedOpportunityStages = new Set(['discovery','qualification','technical_review','quotation','negotiation','approval','won','lost','on_hold']);
const allowedDecisionStatuses = new Set(['pending','approved','rejected','superseded']);
const forbiddenSensitive = /(password|api[_ -]?key|secret|routing number|bank account|personal email|phone number|exact price|gross margin|payment terms)/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
}

function parse(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) throw new Error('missing YAML frontmatter');
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('unterminated YAML frontmatter');
  const data = {};
  let activeList = null;
  for (const raw of text.slice(4, end).split('\n')) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    const item = raw.match(/^\s+-\s+(.+)$/);
    if (item && activeList) { data[activeList].push(item[1].trim().replace(/^['"]|['"]$/g, '')); continue; }
    const match = raw.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim();
    if (!value) { data[match[1]] = []; activeList = match[1]; }
    else { data[match[1]] = value.replace(/^['"]|['"]$/g, ''); activeList = null; }
  }
  return { data, text };
}

function missing(entity, fields, relative, label, errors) {
  for (const field of fields) {
    if (!(field in entity) || entity[field] === '' || (Array.isArray(entity[field]) && !entity[field].length)) {
      errors.push(`${relative}: ${label} missing required field '${field}'`);
    }
  }
}

const files = walk(entitiesRoot);
const errors = [];
const ids = new Map();
const records = [];

for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  try {
    const parsed = parse(file);
    const entity = parsed.data;
    records.push({ entity, text: parsed.text, relative });
    missing(entity, required, relative, 'entity', errors);
    if (entity.id && !/^[a-z0-9-]+:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid canonical id '${entity.id}'`);
    if (entity.id) {
      if (ids.has(entity.id)) errors.push(`${relative}: duplicate id '${entity.id}' also used by ${ids.get(entity.id)}`);
      ids.set(entity.id, relative);
    }
    if (entity.type && !allowedTypes.has(entity.type)) errors.push(`${relative}: unsupported type '${entity.type}'`);
    if (entity.status && !allowedStatuses.has(entity.status)) errors.push(`${relative}: unsupported status '${entity.status}'`);
    if (entity.authority && entity.authority !== 'canonical') errors.push(`${relative}: canonical entity must use authority: canonical`);
    if (entity.evidence_status && !allowedEvidence.has(entity.evidence_status)) errors.push(`${relative}: unsupported evidence_status '${entity.evidence_status}'`);
    if (entity.last_reviewed && !/^\d{4}-\d{2}-\d{2}$/.test(entity.last_reviewed)) errors.push(`${relative}: last_reviewed must use YYYY-MM-DD`);
    if (entity.status === 'approved' && !['validated','not_required'].includes(entity.evidence_status)) errors.push(`${relative}: approved entity requires validated or not_required evidence`);
    if (forbiddenSensitive.test(parsed.text)) errors.push(`${relative}: contains prohibited sensitive commercial content`);

    if (entity.type === 'SKU') {
      missing(entity, ['sku','product_family','technology','system','lifecycle_status','synchronized_from','synchronized_at'], relative, 'SKU', errors);
      if (entity.lifecycle_status && !allowedLifecycle.has(entity.lifecycle_status)) errors.push(`${relative}: unsupported lifecycle_status '${entity.lifecycle_status}'`);
      if (entity.status === 'approved' && !/supported_by_evidence:\s*`evidence:[a-z0-9-]+`/.test(parsed.text)) errors.push(`${relative}: approved SKU requires evidence relationship`);
    }
    if (['Equipment','Engine'].includes(entity.type)) missing(entity, ['manufacturer','model','synchronized_from','synchronized_at'], relative, entity.type, errors);
    if (entity.type === 'Vehicle') missing(entity, ['manufacturer','model','year_start','year_end','synchronized_from','synchronized_at'], relative, 'Vehicle', errors);
    if (entity.type === 'Manufacturer') missing(entity, ['canonical_name'], relative, 'Manufacturer', errors);
    if (entity.type === 'Symptom') missing(entity, ['observable_on','measurement_type'], relative, 'Symptom', errors);
    if (entity.type === 'FailureScenario') {
      missing(entity, ['confidence','severity','affected_system','primary_failure_mode'], relative, 'FailureScenario', errors);
      if (entity.confidence && !allowedConfidence.has(entity.confidence)) errors.push(`${relative}: unsupported confidence '${entity.confidence}'`);
      if (entity.severity && !allowedSeverity.has(entity.severity)) errors.push(`${relative}: unsupported severity '${entity.severity}'`);
      if (entity.confidence === 'validated' && entity.evidence_status !== 'validated') errors.push(`${relative}: validated scenario requires validated evidence`);
    }
    if (entity.type === 'RecommendationRule') {
      missing(entity, ['scenario','action_level'], relative, 'RecommendationRule', errors);
      if (entity.action_level && !allowedActions.has(entity.action_level)) errors.push(`${relative}: unsupported action_level '${entity.action_level}'`);
      if (entity.action_level === 'validated_recommendation' && entity.evidence_status !== 'validated') errors.push(`${relative}: validated recommendation requires validated evidence`);
    }

    if (entity.type === 'CommercialAccount') missing(entity, ['account_class','industry','country_code','privacy_class'], relative, 'CommercialAccount', errors);
    if (entity.type === 'Supplier') missing(entity, ['supplier_status','country_code','quality_status','privacy_class'], relative, 'Supplier', errors);
    if (entity.type === 'CommercialOpportunity') {
      missing(entity, ['account','stage','priority','privacy_class'], relative, 'CommercialOpportunity', errors);
      if (entity.stage && !allowedOpportunityStages.has(entity.stage)) errors.push(`${relative}: unsupported opportunity stage '${entity.stage}'`);
      if (entity.stage === 'won' && entity.status === 'approved' && !/authorized_by:\s*`approval-record:[a-z0-9-]+`/.test(parsed.text)) errors.push(`${relative}: won opportunity requires approval relationship`);
    }
    if (entity.type === 'CommercialOffer') missing(entity, ['opportunity','supplier','currency','cost_band','lead_time_band','valid_until','privacy_class'], relative, 'CommercialOffer', errors);
    if (entity.type === 'InventoryPosition') missing(entity, ['sku','availability_band','as_of','location_class','privacy_class'], relative, 'InventoryPosition', errors);
    if (entity.type === 'CommercialRisk') {
      missing(entity, ['risk_type','severity','likelihood','risk_status','privacy_class'], relative, 'CommercialRisk', errors);
      if (entity.severity && !allowedSeverity.has(entity.severity)) errors.push(`${relative}: unsupported commercial risk severity '${entity.severity}'`);
    }
    if (entity.type === 'SelectionDecision') {
      missing(entity, ['opportunity','selected_offer','decision_status','approval','privacy_class'], relative, 'SelectionDecision', errors);
      if (entity.decision_status && !allowedDecisionStatuses.has(entity.decision_status)) errors.push(`${relative}: unsupported decision_status '${entity.decision_status}'`);
      if (entity.decision_status === 'approved' && (!/supported_by_evidence:\s*`evidence:[a-z0-9-]+`/.test(parsed.text) || !/authorized_by:\s*`approval-record:[a-z0-9-]+`/.test(parsed.text))) errors.push(`${relative}: approved selection requires evidence and approval relationships`);
    }
    if (entity.type === 'ApprovalRecord') missing(entity, ['approval_type','approval_status','approved_scope','privacy_class'], relative, 'ApprovalRecord', errors);
    if (entity.privacy_class && !allowedPrivacy.has(entity.privacy_class)) errors.push(`${relative}: unsupported privacy_class '${entity.privacy_class}'`);
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
  }
}

for (const { entity, text, relative } of records) {
  const relationFields = ['product_family','technology','system','manufacturer','observable_on','affected_system','primary_failure_mode','scenario','industry','account','opportunity','supplier','sku','selected_offer','approval','approved_scope'];
  for (const field of relationFields) {
    const target = entity[field];
    if (target && /^[a-z0-9-]+:[a-z0-9-]+$/.test(target) && !ids.has(target)) errors.push(`${relative}: relation '${field}' targets missing entity '${target}'`);
  }
  for (const match of text.matchAll(/(?:supported_by_evidence|authorized_by):\s*`([a-z0-9-]+:[a-z0-9-]+)`/g)) {
    if (!ids.has(match[1])) errors.push(`${relative}: relationship target does not exist '${match[1]}'`);
  }
}

if (errors.length) {
  console.error(`[knowledge-v2] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`[knowledge-v2] validation passed: ${files.length} canonical entity file(s), ${ids.size} unique id(s)`);
