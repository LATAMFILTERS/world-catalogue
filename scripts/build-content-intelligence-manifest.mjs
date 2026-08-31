import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITEMAP = path.join(ROOT, 'frontend/public/sitemap.xml');
const OUT_DIR = path.join(ROOT, 'knowledge/generated/content-intelligence');
const OUT_FILE = path.join(OUT_DIR, 'publication-manifest.json');

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  let pathname = url.pathname.replace(/\/+/g, '/');
  if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/';
  return `https://elimfilters.com${pathname}`;
}

function classify(canonicalUrl) {
  const pathname = new URL(canonicalUrl).pathname;
  const parts = pathname.split('/').filter(Boolean);

  if (!parts.length) return { entityType: 'organization', entityKey: 'elimfilters', nodalSourcePath: null };

  if (parts[0] === 'technologies') {
    const key = parts[1] || 'technologies';
    return {
      entityType: parts[1] ? 'technology' : 'technology_hub',
      entityKey: key,
      nodalSourcePath: parts[1] ? `knowledge/entities/technologies/${key}.md` : null,
    };
  }

  if (parts[0] === 'systems') {
    const key = parts[1] || 'systems';
    return {
      entityType: parts[1] ? 'system' : 'system_hub',
      entityKey: key,
      nodalSourcePath: parts[1] ? `knowledge/entities/systems/${key}.md` : null,
    };
  }

  if (parts[0] === 'industries') {
    const key = parts[1] || 'industries';
    return {
      entityType: parts[1] ? 'industry' : 'industry_hub',
      entityKey: key,
      nodalSourcePath: parts[1] ? `knowledge/entities/industries/${key}.md` : null,
    };
  }

  if (parts[0] === 'knowledge-center') {
    return {
      entityType: parts.length === 1 ? 'knowledge_hub' : 'knowledge_page',
      entityKey: parts.slice(1).join(':') || 'knowledge-center',
      nodalSourcePath: null,
    };
  }

  if (parts[0] === 'commercial-lines') {
    return {
      entityType: parts[1] ? 'commercial_line' : 'commercial_line_hub',
      entityKey: parts[1] || 'commercial-lines',
      nodalSourcePath: null,
    };
  }

  return { entityType: 'corporate_page', entityKey: parts.join(':'), nodalSourcePath: null };
}

async function sourceExists(sourcePath) {
  if (!sourcePath) return false;
  try {
    await fs.access(path.join(ROOT, sourcePath));
    return true;
  } catch {
    return false;
  }
}

const xml = await fs.readFile(SITEMAP, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalizeUrl(match[1]));
const uniqueUrls = [...new Set(urls)].sort();

const rows = [];
for (const canonicalUrl of uniqueUrls) {
  const classification = classify(canonicalUrl);
  const nodalSourceExists = await sourceExists(classification.nodalSourcePath);
  rows.push({
    canonicalUrl,
    entityType: classification.entityType,
    entityKey: classification.entityKey,
    publicationStatus: 'PUBLIC',
    nodalSourcePath: classification.nodalSourcePath,
    nodalSourceExists,
    sourceChain: nodalSourceExists
      ? ['canonical-knowledge', 'website']
      : ['website'],
    metricsSources: ['gsc', 'ga4', 'llm-referral', 'commercial-intelligence'],
  });
}

const payload = {
  schemaVersion: '1.0.0',
  generatedAt: new Date().toISOString(),
  canonicalHost: 'elimfilters.com',
  rowCount: rows.length,
  governance: {
    obsidianRole: 'reviewed_working_knowledge',
    canonicalKnowledgeRole: 'public_projection_source_when_validated',
    websiteRole: 'public_projection',
    commercialIntelligenceRole: 'confidential_feedback_only',
    noAutomaticPublicationFromObsidian: true,
  },
  rows,
};

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(OUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`[content-intelligence] wrote ${rows.length} rows to ${path.relative(ROOT, OUT_FILE)}`);
