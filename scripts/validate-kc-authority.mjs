import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve(process.cwd(), 'out');
const sitemapPath = path.join(out, 'sitemap.xml');
const violations = [];

function canonicalFor(route) {
  return `https://elimfilters.com${route}`;
}

function htmlPathFor(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return path.join(out, clean, 'index.html');
}

function requireAuthorityPage(route) {
  const file = htmlPathFor(route);
  if (!fs.existsSync(file)) {
    violations.push(`${route} missing generated HTML`);
    return;
  }

  const html = fs.readFileSync(file, 'utf8');
  const canonical = canonicalFor(route);

  if (/noindex/i.test(html)) violations.push(`${route} is unexpectedly noindex`);
  if (!new RegExp(`<link[^>]+rel=["']canonical["'][^>]+href=["']${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(html) &&
      !new RegExp(`<link[^>]+href=["']${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]+rel=["']canonical["']`, 'i').test(html)) {
    violations.push(`${route} missing self canonical ${canonical}`);
  }
  if (!/<title>[^<]{8,}<\/title>/i.test(html)) violations.push(`${route} missing substantive title`);
  if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{40,}["']/i.test(html) &&
      !/<meta[^>]+content=["'][^"']{40,}["'][^>]+name=["']description["']/i.test(html)) {
    violations.push(`${route} missing substantive meta description`);
  }
  if (!/<h1\b/i.test(html)) violations.push(`${route} missing H1`);
  if (/\b(?:TODO|Lorem ipsum|Coming soon)\b/i.test(html)) violations.push(`${route} contains placeholder content`);
}

const coreRoutes = [
  '/knowledge-center/',
  '/knowledge-center/standards/',
  '/knowledge-center/problems/',
  '/knowledge-center/technologies/',
  '/knowledge-center/systems/',
  '/knowledge-center/fleet-optimization/',
  '/knowledge-center/glossary/',
  '/knowledge-center/fleet-optimization/asset-protection-system/',
  '/knowledge-center/fleet-optimization/contamination-control-strategy/',
  '/knowledge-center/fleet-optimization/equipment-lifecycle-optimization/',
  '/knowledge-center/fleet-optimization/maintenance-scheduling/',
  '/knowledge-center/fleet-optimization/predictive-monitoring/',
  '/knowledge-center/fleet-optimization/regional-fleet-strategies/',
  '/knowledge-center/fleet-optimization/total-cost-ownership/',
];

for (const route of coreRoutes) requireAuthorityPage(route);

const rootHtmlPath = htmlPathFor('/knowledge-center/');
if (fs.existsSync(rootHtmlPath)) {
  const html = fs.readFileSync(rootHtmlPath, 'utf8');
  for (const required of [
    'Engineering knowledge for better asset decisions',
    'CONTAMINATION CONTROL LOGIC',
    'DECISION PATH',
    'https://elimfilters.com/knowledge-center/#collection',
  ]) {
    if (!html.includes(required)) violations.push(`/knowledge-center/ missing authority concept: ${required}`);
  }
}

if (!fs.existsSync(sitemapPath)) {
  violations.push('sitemap.xml missing');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const route of coreRoutes) {
    const url = canonicalFor(route);
    if (!sitemap.includes(`<loc>${url}</loc>`)) violations.push(`sitemap.xml missing authority URL ${url}`);
  }
}

if (violations.length) {
  console.error('[validate-kc-authority] FAILED');
  for (const violation of violations) console.error(` - ${violation}`);
  process.exit(1);
}

console.log(`[validate-kc-authority] PASS — ${coreRoutes.length} Knowledge Center authority routes validated`);
