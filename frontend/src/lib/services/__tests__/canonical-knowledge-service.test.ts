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
    expect(CANONICAL_KNOWLEDGE_COUNT).toBe(40);
    expect(listCanonicalKnowledge()).toHaveLength(40);
  });
  it('contains no private source/provenance signatures', () => {
    const text = JSON.stringify(listCanonicalKnowledge());
    expect(text).not.toMatch(/FRAM|fram\.com|https?:\/\/|EVID-|12-knowledge-candidates/i);
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
    expect(JSON.stringify(ctx)).not.toMatch(/EVID-|FRAM|12-knowledge-candidates/i);
  });
  it('makes Knowledge Center search canonical-only', () => {
    expect(KC_SEARCH_INDEX).toHaveLength(40);
    expect(KC_SEARCH_INDEX.every(doc => doc.href.startsWith('/knowledge-center/canonical/'))).toBe(true);
  });
});
