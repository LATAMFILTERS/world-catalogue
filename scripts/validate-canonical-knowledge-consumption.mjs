#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(repo, 'frontend/src/generated/canonical-knowledge.json');
const required = [
  'frontend/src/lib/services/canonical-knowledge-service.ts',
  'frontend/src/lib/services/ai-context-builder.ts',
  'frontend/src/lib/services/search-service.ts',
  'frontend/src/lib/knowledge-center/search-index.ts',
  'frontend/src/app/knowledge-center/canonical/page.tsx',
  'frontend/src/app/knowledge-center/canonical/[slug]/page.tsx',
  'lib/knowledge-governance/canonical-knowledge-repository.js',
];
for (const rel of required) if (!fs.existsSync(path.join(repo, rel))) throw new Error(`Missing canonical consumer: ${rel}`);
const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
if (data.sourceAuthority !== '13-canonical-knowledge') throw new Error('Generated knowledge index authority mismatch');
if (data.count !== 34 || data.records?.length !== 34) throw new Error(`Expected 34 canonical records, got ${data.records?.length ?? 0}`);
const serialized = JSON.stringify(data);
if (/\bFRAM\b|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates|validation-evidence|structured-knowledge/i.test(serialized)) throw new Error('Private/source signature leaked into canonical public index');
const ai = fs.readFileSync(path.join(repo,'frontend/src/lib/services/ai-context-builder.ts'),'utf8');
if (/graph\.json|engineeringMemory|020_engineering_memory/.test(ai.replace(/engineeringMemory:\s*readonly \[\]|engineeringMemory:\s*\[\]/g,''))) throw new Error('AI context builder still references non-canonical knowledge fallback');
if (!/fallbackBlocked:\s*true/.test(ai)) throw new Error('AI context builder must fail closed');
const searchIndex = fs.readFileSync(path.join(repo,'frontend/src/lib/knowledge-center/search-index.ts'),'utf8');
const exportBlock = searchIndex.match(/export const KC_SEARCH_INDEX:[\s\S]*?\];/i)?.[0] || '';
if (!/buildCanonicalKnowledgeDocs/.test(exportBlock) || /buildArticleDocs|buildStandardDocs|buildTechnologyDocs|buildProblemDocs/.test(exportBlock)) throw new Error('Knowledge Center search is not canonical-only');
const backend = fs.readFileSync(path.join(repo,'lib/knowledge-governance/canonical-knowledge-repository.js'),'utf8');
if (!/13-canonical-knowledge/.test(backend)) throw new Error('Backend canonical repository authority mismatch');
console.log(`[canonical consumption] PASS records=${data.count} KnowledgeCenter=canonical Search=canonical AI=canonical backend=canonical`);
