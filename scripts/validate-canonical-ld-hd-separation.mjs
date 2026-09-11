#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('elimfilters-vault/13-canonical-knowledge');
const LD_DOMAIN = 'LIGHT_DUTY_KNOWLEDGE_DOMAIN';
const HD_DOMAIN = 'HEAVY_DUTY_KNOWLEDGE_DOMAIN';
const errors = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function meta(text) {
  const block = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const result = {};
  if (!block) return result;
  for (const line of block[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) result[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, '');
  }
  return result;
}

const ids = new Map();
for (const file of walk(root)) {
  const text = fs.readFileSync(file, 'utf8');
  const m = meta(text);
  if (m.type !== 'canonical_knowledge' || m.status !== 'approved') continue;
  const rel = path.relative(root, file).replaceAll('\\', '/');
  const id = m.knowledge_object_id || '';
  const domain = m.domain || '';

  if (ids.has(id)) errors.push(`duplicate canonical id ${id}: ${ids.get(id)} and ${rel}`);
  ids.set(id, rel);

  if (id.startsWith('LD-') && domain !== LD_DOMAIN) errors.push(`${id} must use ${LD_DOMAIN}, got ${domain}`);
  if (id.startsWith('HD-') && domain !== HD_DOMAIN) errors.push(`${id} must use ${HD_DOMAIN}, got ${domain}`);
  if (rel.startsWith('ld-automotive/') && domain !== LD_DOMAIN) errors.push(`${rel} is in LD tree but domain=${domain}`);
  if (rel.startsWith('hd-heavy-duty/') && domain !== HD_DOMAIN) errors.push(`${rel} is in HD tree but domain=${domain}`);
  if (rel.startsWith('ld-automotive/') && id.startsWith('HD-')) errors.push(`${rel} carries HD id inside LD tree`);
  if (rel.startsWith('hd-heavy-duty/') && id.startsWith('LD-')) errors.push(`${rel} carries LD id inside HD tree`);

  const publicText = text
    .replace(/## Evidence Trace[\s\S]*?(?=\n## |$)/g, '')
    .replace(/## Canonical Approval[\s\S]*?(?=\n## |$)/g, '');
  if (domain === LD_DOMAIN && /\bHeavy Duty values?\b.*(?:appl|inherit)/i.test(publicText) && !/must not be inherited|No Heavy Duty/i.test(publicText)) {
    errors.push(`${id} contains ambiguous HD inheritance language`);
  }
  if (domain === HD_DOMAIN && /\bLight Duty values?\b.*(?:appl|inherit)/i.test(publicText) && !/must not be inherited|No Light Duty/i.test(publicText)) {
    errors.push(`${id} contains ambiguous LD inheritance language`);
  }
}

if (errors.length) {
  console.error('Canonical LD/HD separation FAIL');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const ld = [...ids.keys()].filter((id) => id.startsWith('LD-')).length;
const hd = [...ids.keys()].filter((id) => id.startsWith('HD-')).length;
console.log(`Canonical LD/HD separation PASS: LD=${ld} HD=${hd}; cross-domain canonical IDs=0.`);
