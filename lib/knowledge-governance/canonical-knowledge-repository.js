'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CANONICAL_ROOT = path.resolve(__dirname, '../../elimfilters-vault/13-canonical-knowledge');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}
function frontmatter(text) {
  const out = {}; const match = String(text || '').match(/^---\s*\n([\s\S]*?)\n---/); if (!match) return out;
  for (const line of match[1].split(/\r?\n/)) { const i = line.indexOf(':'); if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, ''); }
  return out;
}
function publicBody(text) {
  return String(text || '')
    .replace(/^---[\s\S]*?---\s*/,'')
    .replace(/## Evidence Trace[\s\S]*?(?=\n## |$)/g,'')
    .replace(/## Canonical Approval[\s\S]*?(?=\n## |$)/g,'')
    .replace(/## Governance[\s\S]*?(?=\n## |$)/g,'')
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g,'$2')
    .replace(/\| status: approved/g,'')
    .trim();
}
function tokenize(value) { return [...new Set(String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(x => x.length > 2))]; }
function loadCanonicalRecords() {
  return walk(CANONICAL_ROOT).map(file => {
    const text = fs.readFileSync(file, 'utf8'); const meta = frontmatter(text);
    if (meta.type !== 'canonical_knowledge' || meta.status !== 'approved' || meta.publication_status !== 'approved' || meta.public_use_allowed !== 'true') return null;
    const body = publicBody(text);
    if (/\bFRAM\b|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i.test(body)) throw new Error(`canonical public body leak: ${meta.knowledge_object_id || file}`);
    return { id: meta.knowledge_object_id, title: meta.title, domain: meta.domain, contentType: meta.knowledge_content_type, body, file };
  }).filter(Boolean);
}
function searchCanonicalKnowledge(question, { limit = 6 } = {}) {
  const terms = tokenize(question); if (!terms.length) return [];
  return loadCanonicalRecords().map(record => {
    const title = String(record.title || '').toLowerCase(); const hay = `${title} ${record.body}`.toLowerCase();
    let score = 0; for (const term of terms) { if (title.includes(term)) score += 5; if (hay.includes(term)) score += 1; }
    return { ...record, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score-a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
function buildCanonicalKnowledgeAnswer(question) {
  const matches = searchCanonicalKnowledge(question, { limit: 4 });
  if (!matches.length) return null;
  const top = matches[0];
  if (top.score < 5) return null;
  const sourceId = `CANONICAL-${crypto.createHash('sha1').update(top.id).digest('hex').slice(0,12).toUpperCase()}`;
  return { record: top, matches, sourceId, answer: top.body };
}

module.exports = { CANONICAL_ROOT, loadCanonicalRecords, searchCanonicalKnowledge, buildCanonicalKnowledgeAnswer };
