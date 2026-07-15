#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const entitiesRoot = path.join(root, 'knowledge', 'entities');
const requiredFields = [
  'id',
  'type',
  'name',
  'status',
  'authority',
  'owner',
  'source',
  'last_reviewed',
  'evidence_status',
];
const skuRequiredFields = [
  'sku',
  'product_family',
  'technology',
  'system',
  'lifecycle_status',
  'synchronized_from',
  'synchronized_at',
];
const equipmentRequiredFields = ['manufacturer', 'model', 'synchronized_from', 'synchronized_at'];
const engineRequiredFields = ['manufacturer', 'model', 'synchronized_from', 'synchronized_at'];
const vehicleRequiredFields = ['manufacturer', 'model', 'year_start', 'year_end', 'synchronized_from', 'synchronized_at'];
const manufacturerRequiredFields = ['canonical_name'];
const symptomRequiredFields = ['observable_on', 'measurement_type'];
const scenarioRequiredFields = ['confidence', 'severity', 'affected_system', 'primary_failure_mode'];
const recommendationRequiredFields = ['scenario', 'action_level'];
const allowedTypes = new Set([
  'Technology',
  'ProtectionSystem',
  'Industry',
  'ProductFamily',
  'SKU',
  'Standard',
  'FailureMode',
  'Contaminant',
  'EvidenceRecord',
  'SourceDocument',
  'Manufacturer',
  'Equipment',
  'Engine',
  'Vehicle',
  'OEMManufacturer',
  'OEMCode',
  'CompetitorCode',
  'CrossReferenceAssertion',
  'Symptom',
  'FailureScenario',
  'RecommendationRule',
]);
const allowedStatuses = new Set(['draft', 'under_review', 'approved', 'deprecated', 'rejected']);
const allowedAuthorities = new Set(['canonical', 'operational', 'working', 'historical', 'generated']);
const allowedEvidence = new Set(['unverified', 'under_review', 'validated', 'rejected', 'not_required']);
const allowedLifecycle = new Set(['active', 'inactive', 'superseded', 'unknown']);
const allowedConfidence = new Set(['hypothesis', 'plausible', 'supported', 'validated', 'rejected']);
const allowedSeverity = new Set(['low', 'moderate', 'high', 'critical']);
const allowedActionLevels = new Set(['inspect', 'sample', 'review_selection', 'recommend_candidate', 'validated_recommendation']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
}

function parseFrontmatter(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) throw new Error('missing YAML frontmatter');
  const normalized = text.replace(/\r\n/g, '\n');
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error('unterminated YAML frontmatter');
  const block = normalized.slice(4, end);
  const data = {};
  let activeList = null;

  for (const rawLine of block.split('\n')) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;
    const listMatch = rawLine.match(/^\s+-\s+(.+)$/);
    if (listMatch && activeList) {
      data[activeList].push(listMatch[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const match = rawLine.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.trim();
    if (!value) {
      data[key] = [];
      activeList = key;
    } else {
      data[key] = value.replace(/^['"]|['"]$/g, '');
      activeList = null;
    }
  }
  return { data, text: normalized };
}

function requireFields(entity, relative, fields, label, errors) {
  for (const field of fields) {
    if (!(field in entity) || entity[field] === '' || (Array.isArray(entity[field]) && entity[field].length === 0)) {
      errors.push(`${relative}: ${label} missing required field '${field}'`);
    }
  }
}

const files = walk(entitiesRoot);
const errors = [];
const ids = new Map();
const entities = [];

for (const file of files) {
  const relative = path.relative(root, file).replaceAll('\\', '/');
  try {
    const parsed = parseFrontmatter(file);
    const entity = parsed.data;
    entities.push({ entity, relative, text: parsed.text });
    requireFields(entity, relative, requiredFields, 'entity', errors);

    if (entity.id && !/^[a-z0-9-]+:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid canonical id '${entity.id}'`);
    if (entity.id) {
      if (ids.has(entity.id)) errors.push(`${relative}: duplicate id '${entity.id}' also used by ${ids.get(entity.id)}`);
      else ids.set(entity.id, relative);
    }
    if (entity.type && !allowedTypes.has(entity.type)) errors.push(`${relative}: unsupported type '${entity.type}'`);
    if (entity.status && !allowedStatuses.has(entity.status)) errors.push(`${relative}: unsupported status '${entity.status}'`);
    if (entity.authority && !allowedAuthorities.has(entity.authority)) errors.push(`${relative}: unsupported authority '${entity.authority}'`);
    if (entity.evidence_status && !allowedEvidence.has(entity.evidence_status)) errors.push(`${relative}: unsupported evidence_status '${entity.evidence_status}'`);
    if (entity.last_reviewed && !/^\d{4}-\d{2}-\d{2}$/.test(entity.last_reviewed)) errors.push(`${relative}: last_reviewed must use YYYY-MM-DD`);
    if (entity.status === 'approved' && !['validated', 'not_required'].includes(entity.evidence_status)) errors.push(`${relative}: approved entity requires evidence_status validated or not_required`);
    if (entity.authority && entity.authority !== 'canonical') errors.push(`${relative}: files under knowledge/entities must use authority: canonical`);

    if (entity.type === 'SKU') {
      requireFields(entity, relative, skuRequiredFields, 'SKU', errors);
      if (entity.id && !/^sku:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid SKU canonical id`);
      if (entity.product_family && !/^product-family:[a-z0-9-]+$/.test(entity.product_family)) errors.push(`${relative}: invalid product_family relation '${entity.product_family}'`);
      if (entity.technology && !/^technology:[a-z0-9-]+$/.test(entity.technology)) errors.push(`${relative}: invalid technology relation '${entity.technology}'`);
      if (entity.system && !/^system:[a-z0-9-]+$/.test(entity.system)) errors.push(`${relative}: invalid system relation '${entity.system}'`);
      if (entity.lifecycle_status && !allowedLifecycle.has(entity.lifecycle_status)) errors.push(`${relative}: unsupported lifecycle_status '${entity.lifecycle_status}'`);
      if (entity.synchronized_at && !/^\d{4}-\d{2}-\d{2}$/.test(entity.synchronized_at)) errors.push(`${relative}: synchronized_at must use YYYY-MM-DD`);
      if (entity.status === 'approved' && !/supported_by_evidence:\s*`evidence:[a-z0-9-]+`/.test(parsed.text)) errors.push(`${relative}: approved SKU requires a supported_by_evidence relationship`);
    }

    if (entity.type === 'Equipment') requireFields(entity, relative, equipmentRequiredFields, 'Equipment', errors);
    if (entity.type === 'Engine') requireFields(entity, relative, engineRequiredFields, 'Engine', errors);
    if (entity.type === 'Vehicle') requireFields(entity, relative, vehicleRequiredFields, 'Vehicle', errors);
    if (entity.type === 'Manufacturer') requireFields(entity, relative, manufacturerRequiredFields, 'Manufacturer', errors);

    if (['Equipment', 'Engine', 'Vehicle'].includes(entity.type)) {
      const expectedPrefix = entity.type.toLowerCase();
      if (entity.id && !new RegExp(`^${expectedPrefix}:[a-z0-9-]+$`).test(entity.id)) errors.push(`${relative}: invalid ${entity.type} canonical id`);
      if (entity.manufacturer && !/^manufacturer:[a-z0-9-]+$/.test(entity.manufacturer)) errors.push(`${relative}: invalid manufacturer relation '${entity.manufacturer}'`);
      if (entity.synchronized_at && !/^\d{4}-\d{2}-\d{2}$/.test(entity.synchronized_at)) errors.push(`${relative}: synchronized_at must use YYYY-MM-DD`);
    }
    if (entity.type === 'Manufacturer' && entity.id && !/^manufacturer:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid Manufacturer canonical id`);

    if (entity.type === 'Symptom') {
      requireFields(entity, relative, symptomRequiredFields, 'Symptom', errors);
      if (entity.id && !/^symptom:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid Symptom canonical id`);
      if (entity.observable_on && !/^system:[a-z0-9-]+$/.test(entity.observable_on)) errors.push(`${relative}: invalid observable_on relation '${entity.observable_on}'`);
    }

    if (entity.type === 'FailureScenario') {
      requireFields(entity, relative, scenarioRequiredFields, 'FailureScenario', errors);
      if (entity.id && !/^failure-scenario:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid FailureScenario canonical id`);
      if (entity.confidence && !allowedConfidence.has(entity.confidence)) errors.push(`${relative}: unsupported confidence '${entity.confidence}'`);
      if (entity.severity && !allowedSeverity.has(entity.severity)) errors.push(`${relative}: unsupported severity '${entity.severity}'`);
      if (entity.affected_system && !/^system:[a-z0-9-]+$/.test(entity.affected_system)) errors.push(`${relative}: invalid affected_system relation '${entity.affected_system}'`);
      if (entity.primary_failure_mode && !/^failure-mode:[a-z0-9-]+$/.test(entity.primary_failure_mode)) errors.push(`${relative}: invalid primary_failure_mode relation '${entity.primary_failure_mode}'`);
      if (entity.confidence === 'validated' && entity.evidence_status !== 'validated') errors.push(`${relative}: validated scenario requires validated evidence_status`);
    }

    if (entity.type === 'RecommendationRule') {
      requireFields(entity, relative, recommendationRequiredFields, 'RecommendationRule', errors);
      if (entity.id && !/^recommendation-rule:[a-z0-9-]+$/.test(entity.id)) errors.push(`${relative}: invalid RecommendationRule canonical id`);
      if (entity.scenario && !/^failure-scenario:[a-z0-9-]+$/.test(entity.scenario)) errors.push(`${relative}: invalid scenario relation '${entity.scenario}'`);
      if (entity.action_level && !allowedActionLevels.has(entity.action_level)) errors.push(`${relative}: unsupported action_level '${entity.action_level}'`);
      if (entity.action_level === 'validated_recommendation' && entity.evidence_status !== 'validated') errors.push(`${relative}: validated recommendation requires validated evidence_status`);
    }
  } catch (error) {
    errors.push(`${relative}: ${error.message}`);
  }
}

for (const { entity, relative, text } of entities) {
  if (entity.type === 'SKU') {
    for (const field of ['product_family', 'technology', 'system']) {
      const target = entity[field];
      if (target && !ids.has(target)) errors.push(`${relative}: relation '${field}' targets missing entity '${target}'`);
    }
    for (const match of text.matchAll(/supported_by_evidence:\s*`(evidence:[a-z0-9-]+)`/g)) {
      if (!ids.has(match[1])) errors.push(`${relative}: evidence target does not exist '${match[1]}'`);
    }
  }
  if (['Equipment', 'Engine', 'Vehicle'].includes(entity.type) && entity.manufacturer && !ids.has(entity.manufacturer)) {
    errors.push(`${relative}: manufacturer relation targets missing entity '${entity.manufacturer}'`);
  }
  if (entity.type === 'Symptom' && entity.observable_on && !ids.has(entity.observable_on)) {
    errors.push(`${relative}: observable_on targets missing entity '${entity.observable_on}'`);
  }
  if (entity.type === 'FailureScenario') {
    for (const field of ['affected_system', 'primary_failure_mode']) {
      if (entity[field] && !ids.has(entity[field])) errors.push(`${relative}: ${field} targets missing entity '${entity[field]}'`);
    }
  }
  if (entity.type === 'RecommendationRule' && entity.scenario && !ids.has(entity.scenario)) {
    errors.push(`${relative}: scenario targets missing entity '${entity.scenario}'`);
  }
}

if (errors.length) {
  console.error(`[knowledge-v2] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[knowledge-v2] validation passed: ${files.length} canonical entity file(s), ${ids.size} unique id(s)`);
