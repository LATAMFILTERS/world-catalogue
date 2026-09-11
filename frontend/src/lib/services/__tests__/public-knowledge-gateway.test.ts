import { describe, expect, it } from 'vitest';
import {
  sanitizeKnowledgeValue,
  findPublicKnowledgeLeaks,
  isPublicGraphNode,
  toPublicGraphNode,
} from '../public-knowledge-gateway';
import type { GraphNode } from '@/lib/graph/graph-types';

function node(status: GraphNode['provenance']['governanceStatus'], properties: Record<string, unknown> = {}): GraphNode {
  return {
    nodeId: 'NODE-TECH-MACROCORE',
    entityType: 'TECHNOLOGY_ARCHITECTURE',
    entityId: 'TECH-MACROCORE',
    label: 'MACROCORE™',
    provenance: {
      sourceRegistry: 'technology-registry.ts',
      entityVersion: '1.0.0',
      createdDate: '2026-09-10',
      maturityLevel: 'APPROVED',
      governanceStatus: status,
      memoryEntryIds: [],
      edrRefs: [],
      isDeprecated: status === 'DEPRECATED',
    },
    properties,
  };
}

describe('public knowledge gateway', () => {
  it('recursively removes private HERMES evidence fields', () => {
    const clean = sanitizeKnowledgeValue({
      title: 'Airflow Protection',
      source_evidence: [{ source_url: 'https://www.fram.com/x' }],
      nested: { source_id: 'fram_ld_01', engineering: 'Restriction control' },
    });
    expect(clean).toEqual({ title: 'Airflow Protection', nested: { engineering: 'Restriction control' } });
  });

  it('allows ACTIVE governed graph nodes after sanitization', () => {
    const publicNode = toPublicGraphNode(node('ACTIVE', {
      engineering: 'Restriction control',
      source_evidence: [{ source_publisher: 'FRAM' }],
    }));
    expect(isPublicGraphNode(publicNode)).toBe(true);
    expect(publicNode.properties).toEqual({ engineering: 'Restriction control' });
  });

  it('blocks non-public graph states by default', () => {
    expect(() => toPublicGraphNode(node('DEPRECATED'))).toThrow(/blocked/i);
    expect(() => toPublicGraphNode(node('SUPERSEDED'))).toThrow(/blocked/i);
    expect(() => toPublicGraphNode(node('ALIAS'))).toThrow(/blocked/i);
  });

  it('detects source signatures outside private evidence fields', () => {
    expect(findPublicKnowledgeLeaks({ title: 'FRAM-style reference' }).length).toBeGreaterThan(0);
    expect(findPublicKnowledgeLeaks({ title: 'ELIMFILTERS engineering reference' })).toEqual([]);
  });
});
