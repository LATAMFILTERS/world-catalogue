#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const entitiesRoot = path.join(root, 'knowledge', 'entities');
const generatedRoot = path.join(root, 'knowledge', 'generated', 'failure-intelligence');
const scenariosDir = path.join(generatedRoot, 'scenarios');
const recommendationsDir = path.join(generatedRoot, 'recommendations');

const walk = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
};

const parse = (file) => {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end < 0) return null;
  const data = {};
  let activeList = null;
  for (const rawLine of text.slice(4, end).split('\n')) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;
    const list = rawLine.match(/^\s+-\s+(.+)$/);
    if (list && activeList) {
      data[activeList].push(list[1].trim().replace(/^['"]|['"]$/g, ''));
      continue;
    }
    const match = rawLine.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) continue;
    const value = match[2].trim();
    if (!value) {
      data[match[1]] = [];
      activeList = match[1];
    } else {
      data[match[1]] = value.replace(/^['"]|['"]$/g, '');
      activeList = null;
    }
  }
  const relations = [...text.matchAll(/(?:^|\n)-\s+([a-z_]+):\s+`([a-z0-9-]+:[a-z0-9-]+)`/g)]
    .map((match) => ({ predicate: match[1], target: match[2] }));
  return { file, text, data, relations };
};

const records = walk(entitiesRoot).map(parse).filter(Boolean);
const byId = new Map(records.filter((record) => record.data.id).map((record) => [record.data.id, record]));
const scenarios = records.filter((record) => record.data.type === 'FailureScenario');
const rules = records.filter((record) => record.data.type === 'RecommendationRule');
const unresolved = [];

const requireTarget = (owner, predicate, prefixes) => {
  const matches = owner.relations.filter((relation) => relation.predicate === predicate);
  if (!matches.length) {
    unresolved.push({ entity: owner.data.id, issue: `missing relation ${predicate}` });
    return [];
  }
  for (const match of matches) {
    if (!prefixes.some((prefix) => match.target.startsWith(`${prefix}:`))) {
      unresolved.push({ entity: owner.data.id, issue: `invalid target type for ${predicate}`, target: match.target });
    } else if (!byId.has(match.target)) {
      unresolved.push({ entity: owner.data.id, issue: `missing target for ${predicate}`, target: match.target });
    }
  }
  return matches.map((match) => match.target);
};

const scenarioMatrix = scenarios.map((scenario) => {
  const symptoms = requireTarget(scenario, 'indicated_by', ['symptom']);
  const contaminants = requireTarget(scenario, 'involves_contaminant', ['contaminant']);
  const failureModes = requireTarget(scenario, 'contributes_to', ['failure-mode']);
  const systems = requireTarget(scenario, 'affects_system', ['system']);
  const evidence = requireTarget(scenario, 'supported_by_evidence', ['evidence']);
  const confidence = scenario.data.confidence || 'hypothesis';
  const severity = scenario.data.severity || 'moderate';
  const automaticEligible = confidence === 'validated' && evidence.length > 0 && scenario.data.evidence_status === 'validated';
  return {
    id: scenario.data.id,
    name: scenario.data.name,
    status: scenario.data.status,
    confidence,
    severity,
    symptoms,
    contaminants,
    failure_modes: failureModes,
    systems,
    evidence,
    automatic_recommendation_eligible: automaticEligible,
  };
});

const recommendationMatrix = rules.map((rule) => {
  const scenariosLinked = rule.data.scenario ? [rule.data.scenario] : requireTarget(rule, 'applies_to_scenario', ['failure-scenario']);
  for (const target of scenariosLinked) {
    if (!byId.has(target)) unresolved.push({ entity: rule.data.id, issue: 'missing scenario target', target });
  }
  const technologies = requireTarget(rule, 'consider_technology', ['technology']);
  const families = requireTarget(rule, 'consider_product_family', ['product-family']);
  const skus = rule.relations.filter((relation) => relation.predicate === 'recommend_sku').map((relation) => relation.target);
  const evidence = requireTarget(rule, 'supported_by_evidence', ['evidence']);
  const actionLevel = rule.data.action_level || 'inspect';
  if (skus.length && actionLevel !== 'validated_recommendation') {
    unresolved.push({ entity: rule.data.id, issue: 'SKU recommendation requires validated_recommendation action level' });
  }
  return {
    id: rule.data.id,
    name: rule.data.name,
    status: rule.data.status,
    scenario: scenariosLinked,
    action_level: actionLevel,
    technologies,
    product_families: families,
    skus,
    evidence,
  };
});

fs.rmSync(generatedRoot, { recursive: true, force: true });
fs.mkdirSync(scenariosDir, { recursive: true });
fs.mkdirSync(recommendationsDir, { recursive: true });

for (const scenario of scenarioMatrix) {
  fs.writeFileSync(path.join(scenariosDir, `${scenario.id.split(':')[1]}.json`), `${JSON.stringify(scenario, null, 2)}\n`);
}
for (const rule of recommendationMatrix) {
  fs.writeFileSync(path.join(recommendationsDir, `${rule.id.split(':')[1]}.json`), `${JSON.stringify(rule, null, 2)}\n`);
}

const matrix = { generated_at: new Date().toISOString(), scenarios: scenarioMatrix, recommendations: recommendationMatrix };
const summary = {
  generated_at: matrix.generated_at,
  scenario_count: scenarioMatrix.length,
  recommendation_count: recommendationMatrix.length,
  validated_scenario_count: scenarioMatrix.filter((item) => item.confidence === 'validated').length,
  automatic_eligible_count: scenarioMatrix.filter((item) => item.automatic_recommendation_eligible).length,
  unresolved_count: unresolved.length,
};

fs.writeFileSync(path.join(generatedRoot, 'matrix.json'), `${JSON.stringify(matrix, null, 2)}\n`);
fs.writeFileSync(path.join(generatedRoot, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(generatedRoot, 'unresolved.json'), `${JSON.stringify(unresolved, null, 2)}\n`);

console.log(`[failure-intelligence] scenarios=${summary.scenario_count} recommendations=${summary.recommendation_count} unresolved=${summary.unresolved_count}`);
if (unresolved.length) process.exitCode = 2;
