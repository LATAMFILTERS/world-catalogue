#!/usr/bin/env node
// HERMES — CLI for scripts/hermes/diagnose-source-endpoint-core.mjs.
//
// Usage:
//   node scripts/hermes/diagnose-source-endpoint.mjs <url> [<url> ...]
//   node scripts/hermes/diagnose-source-endpoint.mjs --all-active
//
// Read-only diagnostic: makes the same single GET request the collector
// would make, reports final URL/status/content-type/lengths/redirect
// count/classification, and writes nothing except an optional report file
// under hermes/reports/ (gitignored). Never saves cookies, full response
// headers, or the full response body.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { diagnoseEndpoints } from './diagnose-source-endpoint-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { DEFAULT_TIMEOUT_MS, DEFAULT_MAX_BYTES } from './collect-real-sources-core.mjs';
import { loadRegistry, activeEndpoints } from './source-registry-core.mjs';

const args = process.argv.slice(2);
const timeoutMs = Number(process.env.HERMES_COLLECTION_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxBytes = Number(process.env.HERMES_COLLECTION_MAX_BYTES || DEFAULT_MAX_BYTES);
const minContentLength = Number(process.env.HERMES_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);

let urls;
if (args.includes('--all-active')) {
  const registry = loadRegistry('hermes/config/source-organizations.json', 'hermes/config/source-endpoints.json');
  urls = activeEndpoints(registry.endpoints).filter((e) => e.enabled === true).map((e) => e.url);
} else {
  urls = args.filter((a) => !a.startsWith('--'));
}

if (!urls.length) {
  console.error('Usage: node scripts/hermes/diagnose-source-endpoint.mjs <url> [<url> ...] | --all-active');
  process.exit(2);
}

const results = await diagnoseEndpoints(urls, { timeoutMs, maxBytes, minContentLength });

for (const r of results) {
  console.log(`[HERMES diagnose] ${r.result} ${r.url}`);
  console.log(`  final_url=${r.final_url} http_status=${r.http_status} content_type=${r.content_type} redirect_count=${r.redirect_count}`);
  console.log(`  raw_length=${r.raw_length} normalized_length=${r.normalized_length}${r.reason ? ` reason="${r.reason}"` : ''}`);
}

const reportsDir = path.resolve('hermes/reports');
fs.mkdirSync(reportsDir, { recursive: true });
const reportPath = path.join(reportsDir, 'endpoint-diagnostics.json');
fs.writeFileSync(reportPath, JSON.stringify({ generated_at: new Date().toISOString(), min_content_length: minContentLength, results }, null, 2) + '\n', 'utf8');
console.log(`[HERMES diagnose] wrote ${path.relative(process.cwd(), reportPath)}`);

const failed = results.filter((r) => r.result !== 'VALID');
if (failed.length) {
  console.log(`[HERMES diagnose] ${failed.length}/${results.length} endpoint(s) did not classify as VALID — see reasons above.`);
}
