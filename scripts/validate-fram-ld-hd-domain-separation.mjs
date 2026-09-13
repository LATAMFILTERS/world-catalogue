#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { KNOWLEDGE_DOMAINS, INDUSTRIES } = require('../lib/knowledge-governance/knowledge-domain-registry');
const { buildHermesLightDutyTechDocSources } = require('../lib/knowledge-governance/fram-light-duty-techdocs-corpus');
const { buildHermesHeavyDutySources } = require('../lib/knowledge-governance/fram-heavy-duty-source-corpus');

const ld = buildHermesLightDutyTechDocSources();
const hd = buildHermesHeavyDutySources();
const fail = (message) => { throw new Error(`FRAM LD/HD domain separation failed: ${message}`); };

if (!ld.length) fail('LD corpus is empty');
if (!hd.length) fail('HD corpus is empty');

const allIds = [...ld, ...hd].map((s) => s.id);
if (new Set(allIds).size !== allIds.length) fail('source IDs overlap between LD and HD');
const allUrls = [...ld, ...hd].map((s) => s.url);
if (new Set(allUrls).size !== allUrls.length) fail('source URL appears in both LD and HD corpora');

for (const source of ld) {
  if (source.knowledge_domain !== KNOWLEDGE_DOMAINS.LIGHT_DUTY) fail(`${source.id} is not LIGHT_DUTY`);
  if (source.industry !== 'Automotive') fail(`${source.id} LD industry must be Automotive`);
  if (source.cross_domain_inheritance_allowed !== false) fail(`${source.id} allows cross-domain inheritance`);
  if (!/consumer_tech_docs/i.test(source.url)) fail(`${source.id} LD source is outside Consumer Tech Docs`);
  if (source.public_brand_reference !== false || source.catalog_auto_update !== false) fail(`${source.id} public/catalog isolation not closed`);
}

for (const source of hd) {
  if (source.knowledge_domain !== KNOWLEDGE_DOMAINS.HEAVY_DUTY) fail(`${source.id} is not HEAVY_DUTY`);
  if (!INDUSTRIES.HEAVY_DUTY.includes(source.industry)) fail(`${source.id} HD industry is invalid`);
  if (!/commercial_tech_docs/i.test(source.url)) fail(`${source.id} HD source is outside Commercial Tech Docs`);
  if (source.public_brand_reference !== false || source.catalog_auto_update !== false) fail(`${source.id} public/catalog isolation not closed`);
  if (source.knowledge_topics.some((topic) => /passenger car|cabin air|light duty application/i.test(topic))) fail(`${source.id} contains LD-only topic`);
}

// Prevent private external provenance from entering generated/public surfaces.
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoots = [path.join(repo, 'frontend', 'public'), path.join(repo, 'frontend', 'src', 'generated')].filter(fs.existsSync);
const privateSignatures = [/fram_ld_pdf_/i, /fram_hd_/i, /91-private-evidence\/fram-/i, /consumer_tech_docs/i, /commercial_tech_docs/i];
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
for (const root of publicRoots) {
  for (const file of walk(root)) {
    if (!/\.(json|html|txt|xml|js|ts|tsx|md)$/i.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const signature of privateSignatures) {
      if (signature.test(text)) fail(`private FRAM domain signature leaked into ${path.relative(repo, file)}`);
    }
  }
}

console.log(`FRAM LD/HD separation PASS: LD=${ld.length}, HD=${hd.length}, overlap=0, public leakage=0.`);
