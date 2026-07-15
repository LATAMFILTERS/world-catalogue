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

function requireValue(object, key, label) {
  if (!(key in object) || object[key] === '' || (Array.isArray(object[key]) && object[key].length === 0)) {
    errors.push(`${label} missing '${key}'`);
  }
}

const manifest = readJson(manifestPath, 'brain manifest');
const routing = readJson(routesPath, 'query routes');

if (manifest) {
  for (const key of [
    'schema_version',
    'brain_id',
    'name',
    'status',
    'sources',
    'authority_order',
    'public_blocked_fields',
    'required_validators',
    'conditional_validators',
  ]) {
    requireValue(manifest, key, 'brain manifest');
  }

  const sourceIds = new Set();
  for (const source of manifest.sources || []) {
    for (const key of ['id', 'kind', 'authority', 'sensitivity', 'write_policy']) {
      requireValue(source, key, `source '${source.id || 'unknown'}'`);
    }
    if (typeof source.public_projection_allowed !== 'boolean') {
      errors.push(`source '${source.id || 'unknown'}' missing boolean 'public_projection_allowed'`);
    }
    if (sourceIds.has(source.id)) errors.push(`duplicate source id '${source.id}'`);
    sourceIds.add(source.id);
    if (!['public', 'internal', 'confidential', 'restricted'].includes(source.sensitivity)) {
      errors.push(`source '${source.id}' has unsupported sensitivity '${source.sensitivity}'`);
    }
    if (source.sensitivity !== 'public' && source.public_projection_allowed && source.id !== 'canonical-knowledge') {
      errors.push(`source '${source.id}' cannot allow public projection while sensitivity is '${source.sensitivity}'`);
    }
  }

  for (const validator of manifest.required_validators || []) {
    if (!fs.existsSync(path.join(root, validator))) errors.push(`required validator missing: ${validator}`);
  }

  for (const item of manifest.conditional_validators || []) {
    requireValue(item, 'validator', 'conditional validator');
    requireValue(item, 'prerequisites', `conditional validator '${item.validator || 'unknown'}'`);
    if (item.validator && !fs.existsSync(path.join(root, item.validator))) {
      errors.push(`conditional validator missing: ${item.validator}`);
    }
    for (const prerequisite of item.prerequisites || []) {
      if (typeof prerequisite !== 'string' || !prerequisite.trim()) {
        errors.push(`conditional validator '${item.validator}' has invalid prerequisite`);
      }
    }
  }

  const blocked = new Set(manifest.public_blocked_fields || []);
  for (const required of ['price', 'margin', 'credentials', 'api_key', 'secret']) {
    if (!blocked.has(required)) errors.push(`public_blocked_fields must include '${required}'`);
  }

  if (routing) {
    if (!Array.isArray(routing.routes) || routing.routes.length === 0) errors.push('query routes must contain routes');
    const routeIds = new Set();
    for (const route of routing.routes || []) {
      for (const key of ['id', 'intents', 'required_sources', 'minimum_evidence', 'output_sensitivity']) {
        requireValue(route, key, `route '${route.id || 'unknown'}'`);
      }
      if (routeIds.has(route.id)) errors.push(`duplicate route id '${route.id}'`);
      routeIds.add(route.id);
      for (const sourceId of [...(route.required_sources || []), ...(route.optional_sources || [])]) {
        if (!sourceIds.has(sourceId)) errors.push(`route '${route.id}' references unknown source '${sourceId}'`);
      }
      if (!['public_safe', 'internal', 'confidential'].includes(route.output_sensitivity)) {
        errors.push(`route '${route.id}' has unsupported output_sensitivity '${route.output_sensitivity}'`);
      }
      if (route.output_sensitivity === 'public_safe') {
        for (const sourceId of route.required_sources || []) {
          const source = (manifest.sources || []).find((item) => item.id === sourceId);
          if (source && !source.public_projection_allowed) {
            errors.push(`route '${route.id}' requires non-public source '${sourceId}' for a public_safe output`);
          }
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
