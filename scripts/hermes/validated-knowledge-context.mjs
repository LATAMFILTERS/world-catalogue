import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  CANONICAL_ROOT,
  searchCanonicalKnowledge
} = require('../../lib/knowledge-governance/canonical-knowledge-repository');

export const VALIDATED_KNOWLEDGE_AUTHORITY = '13-canonical-knowledge';

function clean(value, max = 1200) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export function buildValidatedKnowledgeContext(query, { limit = 6 } = {}) {
  const available = fs.existsSync(CANONICAL_ROOT);
  if (!available) {
    return {
      authority: VALIDATED_KNOWLEDGE_AUTHORITY,
      available: false,
      matches: []
    };
  }

  const matches = searchCanonicalKnowledge(query, { limit }).map((record) => ({
    id: record.id,
    title: record.title,
    domain: record.domain || null,
    content_type: record.contentType || null,
    score: record.score,
    validated_fact: clean(record.body)
  }));

  return {
    authority: VALIDATED_KNOWLEDGE_AUTHORITY,
    available: true,
    matches
  };
}

function tokens(value) {
  return new Set(
    String(value || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 3)
  );
}

function overlapRatio(left, right) {
  const a = tokens(left);
  const b = tokens(right);
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const token of a) if (b.has(token)) common += 1;
  return common / Math.min(a.size, b.size);
}

function resolutionMaterialText(resolution) {
  return [
    resolution.finding_title,
    ...(Array.isArray(resolution.technical_facts) ? resolution.technical_facts : []),
    resolution.public_safe_fact,
    resolution.neutral_fact,
    resolution.specific_item,
    ...(Array.isArray(resolution.facts) ? resolution.facts : [])
  ].filter(Boolean).join(' ');
}

export function findCanonicalDuplicate(resolution, validatedBase, { threshold = 0.72 } = {}) {
  if (!validatedBase?.available || !Array.isArray(validatedBase.matches)) return null;
  const material = resolutionMaterialText(resolution);
  if (!material.trim()) return null;

  let best = null;
  for (const match of validatedBase.matches) {
    const ratio = overlapRatio(material, `${match.title || ''} ${match.validated_fact || ''}`);
    if (!best || ratio > best.ratio) best = { ...match, ratio };
  }
  return best && best.ratio >= threshold ? best : null;
}

export function validateNoveltyAgainstValidatedBase(resolution, validatedBase) {
  if (!resolution || typeof resolution !== 'object') return ['resolution missing'];
  if (!validatedBase?.available && resolution.knowledge_action === 'CREATE_NEW') {
    return ['validated knowledge comparison unavailable; CREATE_NEW forbidden'];
  }
  if (resolution.knowledge_action === 'CREATE_NEW') {
    const duplicate = findCanonicalDuplicate(resolution, validatedBase);
    if (duplicate) {
      return [`canonical duplicate detected: ${duplicate.id || duplicate.title || 'existing validated record'}; CREATE_NEW forbidden`];
    }
  }
  return [];
}
