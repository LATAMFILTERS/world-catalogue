import { describe, expect, it } from 'vitest';
import {
  CANONICAL_KNOWLEDGE_COUNT,
  getCanonicalKnowledgeAuthority,
  listCanonicalKnowledge,
  searchCanonicalKnowledge,
} from '../canonical-knowledge-service';
import { buildAIContext } from '../ai-context-builder';
import { KC_SEARCH_INDEX } from '@/lib/knowledge-center/search-index';

describe('canonical knowledge consumption', () => {
  it('exposes exactly the approved 13-canonical-knowledge corpus', () => {
    expect(getCanonicalKnowledgeAuthority()).toBe('13-canonical-knowledge');
    expect(CANONICAL_KNOWLEDGE_COUNT).toBeGreaterThanOrEqual(40);
    expect(listCanonicalKnowledge()).toHaveLength(CANONICAL_KNOWLEDGE_COUNT);
    expect(new Set(listCanonicalKnowledge().map(record => record.id)).size).toBe(CANONICAL_KNOWLEDGE_COUNT);
  });
  it('contains no private source/provenance signatures', () => {
    const text = JSON.stringify(listCanonicalKnowledge());
    expect(text).not.toMatch(/\bFRAM\b|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i);
  });
  it('still detects private manufacturer signatures without confusing structural vocabulary', () => {
    const signature = /\bFRAM\b|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i;
    for (const value of ['FRAM', 'fram.com', 'https://private.example', 'EVID-123', '12-knowledge-candidates']) expect(value).toMatch(signature);
    expect('Seal or frame leakage; evaluation framework').not.toMatch(signature);
  });
  it('grounds technical search in canonical records', () => {
    const hits = searchCanonicalKnowledge('oil filter bypass restriction');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].id).toMatch(/LUBE|SHARED/);
  });
  it('builds AI context with no candidate or engineering-memory fallback', () => {
    const ctx = buildAIContext('LD-LUBE-BYPASS-OPERATION');
    expect(ctx.authority).toBe('13-canonical-knowledge');
    expect(ctx.fallbackBlocked).toBe(true);
    expect(ctx.engineeringMemory).toEqual([]);
    expect(ctx.nodes[0]?.id).toBe('LD-LUBE-BYPASS-OPERATION');
    expect(JSON.stringify(ctx)).not.toMatch(/EVID-|\bFRAM\b|12-knowledge-candidates/i);
  });
  it('makes Knowledge Center search canonical-only', () => {
    expect(KC_SEARCH_INDEX).toHaveLength(CANONICAL_KNOWLEDGE_COUNT);
    expect(KC_SEARCH_INDEX.map(doc => doc.href).sort()).toEqual(listCanonicalKnowledge().map(record => '/knowledge-center/canonical/' + record.slug + '/').sort());
    expect(KC_SEARCH_INDEX.every(doc => doc.href.startsWith('/knowledge-center/canonical/'))).toBe(true);
  });
});
