#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const manifestPath = path.join(root, 'knowledge', 'brain', 'brain-manifest.json');
const routesPath = path.join(root, 'knowledge', 'brain', 'query-routes.json');
const errors = [];

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) {
    errors.push(`${label} missing: ${path.relative(root, filePath)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    errors.push(`${label} invalid JSON: ${error.message}`);
    return null;
  }
}

const manifest = readJson(manifestPath, 'brain manifest');
const routing = readJson(routesPath, 'query routes');

if (manifest) {
  for (const key of ['schema_version', 'brain_id', 'name', 'status', 'sources', 'authority_order', 'public_blocked_fields', 'required_validators']) {
    if (!(key in manifest) || manifest[key] === '' || (Array.isArray(manifest[key]) && manifest[key].length === 0)) {
      errors.push(`brain manifest missing '${key}'`);
    }
  }

  const sourceIds = new Set();
  for (const source of manifest.sources || []) {
    for (const key of ['id', 'kind', 'authority', 'sensitivity', 'write_policy']) {
      if (!source[key]) errors.push(`source '${source.id || 'unknown'}' missing '${key}'`);
    }
    if (sourceIds.has(source.id)) errors.push(`duplicate source id '${source.id}'`);
    sourceIds.add(source.id);
    if (!['public', 'internal', 'confidential', 'restricted'].includes(source.sensitivity)) {
      errors.push(`source '${source.id}' has unsupported sensitivity '${source.sensitivity}'`);
    }
  }

  for (const validator of manifest.required_validators || []) {
    if (!fs.existsSync(path.join(root, validator))) errors.push(`required validator missing: ${validator}`);
  }

  const blocked = new Set(manifest.public_blocked_fields || []);
  for (const required of ['price', 'margin', 'credentials', 'api_key', 'secret']) {
    if (!blocked.has(required)) errors.push(`public_blocked_fields must include '${required}'`);
  }

  if (routing) {
    const routeIds = new Set();
    for (const route of routing.routes || []) {
      for (const key of ['id', 'intents', 'required_sources', 'minimum_evidence', 'output_sensitivity']) {
        if (!(key in route) || route[key] === '' || (Array.isArray(route[key]) && route[key].length === 0)) {
          errors.push(`route '${route.id || 'unknown'}' missing '${key}'`);
        }
      }
      if (routeIds.has(route.id)) errors.push(`duplicate route id '${route.id}'`);
      routeIds.add(route.id);
      for (const sourceId of [...(route.required_sources || []), ...(route.optional_sources || [])]) {
        if (!sourceIds.has(sourceId) && !['equipment-graph', 'failure-intelligence'].includes(sourceId)) {
          errors.push(`route '${route.id}' references unknown source '${sourceId}'`);
        }
      }
      if (route.output_sensitivity === 'public_safe' && (route.required_sources || []).includes('commercial-intelligence')) {
        errors.push(`route '${route.id}' cannot expose commercial-intelligence as public_safe`);
      }
    }
  }
}

if (errors.length) {
  console.error(`[digital-brain] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[digital-brain] validation passed: ${manifest.sources.length} source(s), ${routing.routes.length} query route(s)`);
