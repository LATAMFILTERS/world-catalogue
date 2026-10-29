#!/usr/bin/env node
// Source-only agent discovery guard: never touches DB, Cloudflare or production.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = (p) => path.join(root,p);
const read = (p) => fs.readFileSync(source(p),'utf8');
const failures = [];
const findings = [];
const check = (name, ok, detail) => {
  findings.push({name, status: ok ? 'PASS':'FAIL', detail});
  if (!ok) failures.push(name);
};

const publicRoot='frontend/public/';
for (const name of ['robots.txt','llms.txt','llm.txt','sitemap.xml','sitemap-ai.xml']) {
  check('discovery:'+name, fs.existsSync(source(publicRoot+name)), 'discovery asset exists in source');
}
const robots=read(publicRoot+'robots.txt');
const llms=read(publicRoot+'llms.txt');
check('single robots authority', !fs.existsSync(source('frontend/src/app/robots.ts')),
  'frontend/public/robots.txt is sole authoritative source');
const groups = robots.split(/(?=^User-agent:\s*)/mi).filter(x=>/^User-agent:/i.test(x.trim()));
const byAgent=new Map(groups.map(g=>[g.match(/^User-agent:\s*([^\r\n]+)/im)?.[1]?.trim(),g]));
const blocked=['/api/admin/','/admin/','/knowledge-center/coverage/','/search?'];
for (const agent of ['*','OAI-SearchBot','GPTBot','ClaudeBot','anthropic-ai','PerplexityBot','Perplexity-User']) {
  const group=byAgent.get(agent)||'';
  check('restricted paths:'+agent, blocked.every(p=>group.split(/\r?\n/).some(l=>l.trim()==='Disallow: '+p)),
    'Every allowed crawler group must deny restricted paths explicitly');
}
for (const agent of ['CCBot','Bytespider']) {
  check('training restriction:'+agent,/^Disallow:\s*\/\s*$/m.test(byAgent.get(agent)||''), 'explicit disallow');
}
for (const url of ['https://elimfilters.com/sitemap.xml','https://elimfilters.com/sitemap-ai.xml','https://part-search.elimfilters.com/sitemap.xml']) {
  check('sitemap reference:'+url, robots.includes('Sitemap: '+url),'sitemap advertised');
}
check('llms catalogue and citation',llms.includes('https://part-search.elimfilters.com/')&&llms.includes('https://elimfilters.com/api/citation/index.json'),'technical discovery present');
check('technical qualification',/evidence|verified|validation|not imply|not verified/i.test(llms),'governance qualification present');
const aiSitemap=read(publicRoot+'sitemap-ai.xml');
check('AI sitemap shell',/<urlset\b/.test(aiSitemap)&&/<\/urlset>/.test(aiSitemap),'URL set present');
check('no SKU claims in AI knowledge sitemap',!/\/products\/[A-Za-z0-9-]+\//.test(aiSitemap),'knowledge sitemap excludes SKU routes');
console.log(JSON.stringify({audit:'agent-readiness-static',mode:'READ_ONLY',findings,failures,deployGate:failures.length?'NO_GO':'PASS',note:'Source-only audit; HTTP, Cloudflare and catalogue evidence checks remain separate'},null,2));
process.exitCode=failures.length?1:0;
