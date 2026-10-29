#!/usr/bin/env node
// Read-only agent-discovery contract audit. Never queries or mutates PostgreSQL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const failures = [];
const findings = [];
const check = (name, ok, detail) => {
  findings.push({ name, status: ok ? 'PASS' : 'FAIL', detail });
  if (!ok) failures.push(name);
};

const publicRoot = 'frontend/public/';
const required = ['robots.txt', 'llms.txt', 'llm.txt', 'sitemap.xml', 'sitemap-ai.xml'];
for (const name of required) {
  check('discovery:' + name, fs.existsSync(path.join(root, publicRoot, name)), 'source asset exists');
}
const robots = read(publicRoot + 'robots.txt');
const dynamicRobots = read('frontend/src/app/robots.ts');
const llms = read(publicRoot + 'llms.txt');
const policyLines = (source) => source.split(/\r?\n/).map(v => v.trim()).filter(v => /^(User-agent|Allow|Disallow|Sitemap):/i.test(v));
const importantPaths = ['/api/admin/', '/knowledge-center/coverage/'];
for (const segment of importantPaths) {
  check('static robots restriction ' + segment, robots.includes('Disallow: ' + segment), 'sensitive path blocked in static file');
}
check('duplicate robots authority', !fs.existsSync(path.join(root, 'frontend/src/app/robots.ts')),
  'Static frontend/public/robots.txt and Next.js app/robots.ts must not both claim /robots.txt; reconcile before deployment');
check('AI retriever entry', /User-agent:\s*OAI-SearchBot/.test(robots), 'AI search crawler named explicitly');
check('training crawl separated', /User-agent:\s*CCBot[\s\S]*?Disallow:\s*\//.test(robots), 'training policy separate from search retrieval');
check('llms entry points', llms.includes('https://part-search.elimfilters.com/') &&
  llms.includes('https://elimfilters.com/api/citation/index.json'), 'part search and citation references present');
check('governance text', /evidence|verified|validation|not imply|not verified/i.test(llms),
  'machine guidance includes uncertainty / technical qualification');
check('dynamic robots policy review', !(/disallow:\s*\[[^\]]*'\/api\/'/s.test(dynamicRobots) &&
  /allow:\s*\[[^\]]*'\/api\/citation\/'/s.test(dynamicRobots)),
  'Next.js dynamic policy has overlapping /api/ disallow and /api/citation/ allow; verify precedence');
const aiSitemap = read(publicRoot + 'sitemap-ai.xml');
check('AI sitemap XML shell', /<urlset\b/.test(aiSitemap) && /<\/urlset>/.test(aiSitemap), 'XML URL set wrapper');
check('no unverified product claims in AI sitemap', !/\/products\/[A-Za-z0-9-]+\//.test(aiSitemap),
  'AI knowledge sitemap does not promote SKU application claims');
console.log(JSON.stringify({ audit: 'agent-readiness-static', mode: 'READ_ONLY', findings, failures, deployGate: failures.length ? 'NO_GO' : 'PASS', note: 'Source-only audit; not a live Cloudflare validation' }, null, 2));
process.exitCode = failures.length ? 1 : 0;
