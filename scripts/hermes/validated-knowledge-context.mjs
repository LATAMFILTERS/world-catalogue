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

export function validateNoveltyAgainstValidatedBase(resolution, validatedBase) {
  if (!resolution || typeof resolution !== 'object') return ['resolution missing'];
  if (!validatedBase?.available && resolution.knowledge_action === 'CREATE_NEW') {
    return ['validated knowledge comparison unavailable; CREATE_NEW forbidden'];
  }
  return [];
}
