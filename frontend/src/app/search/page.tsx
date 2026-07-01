'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  search,
  findById,
  recommendFromFailureMode,
  recommendFromContamination,
  recommendFromPrinciple,
  recommendFromTechnology,
  getMemoryFor,
  getEntityProvenance,
  citeEntity,
  formatCitation,
} from '@/lib/services';
import type { SearchResult, Recommendation, RecommendationStep } from '@/lib/services';
import type { GraphNode } from '@/lib/graph/graph-types';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ConversionProvider } from '@/components/conversion';
import { EngineeringSearchBar } from '@/components/engineering';
import type { CustomerIntent } from '@/components/conversion';

// ─── Engineering conversation types ───────────────────────────────────────────

type SearchGroup =
  | 'RECOMMENDED_SOLUTION'
  | 'ENGINEERING_EXPLANATION'
  | 'TECHNOLOGIES'
  | 'STANDARDS'
  | 'RELATED_EQUIPMENT'
  | 'ENGINEERING_REFERENCES';

interface EngineeringConversation {
  result: SearchResult;
  whyMatched: string;
  engineeringRole: string;
  engineeringPath: string[];
  recommendations: Recommendation[];
  supportingMemory: GraphNode[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  group: SearchGroup;
  citationRef: string;
}

// ─── Group metadata ────────────────────────────────────────────────────────────

const GROUP_META: Record<SearchGroup, {
  label: string;
  description: string;
  color: string;
  order: number;
}> = {
  RECOMMENDED_SOLUTION: {
    label: 'Recommended Solution',
    description: 'Derived from your query via the Engineering Graph. These recommendations include a full engineering trace.',
    color: '#86efac',
    order: 1,
  },
  ENGINEERING_EXPLANATION: {
    label: 'Engineering Explanation',
    description: 'The failure modes and contamination mechanisms underlying your query. Understanding these is the foundation of asset protection.',
    color: '#fca5a5',
    order: 2,
  },
  TECHNOLOGIES: {
    label: 'Technologies',
    description: 'Filtration technology architectures relevant to your query, with the engineering principles that govern them.',
    color: '#FFF12D',
    order: 3,
  },
  STANDARDS: {
    label: 'Standards & Measurement',
    description: 'Industrial standards that define the measurement framework for this contamination domain.',
    color: '#c4b5fd',
    order: 4,
  },
  RELATED_EQUIPMENT: {
    label: 'Related Equipment Context',
    description: 'Contamination contexts and protection media relevant to your asset type.',
    color: '#fdba74',
    order: 5,
  },
  ENGINEERING_REFERENCES: {
    label: 'Engineering References',
    description: 'Engineering principles and field records that underpin the recommended approach.',
    color: '#7dd3fc',
    order: 6,
  },
};

// ─── WHY MATCHED explanations (generated from entity data, not hardcoded) ─────

function buildWhyMatched(result: SearchResult, query: string): string {
  const node = findById(result.entityId);
  const p = node ? (node.properties as Record<string, unknown>) : {};
  const q = query.trim();

  switch (result.entityType) {
    case 'FAILURE_MODE': {
      const sys = typeof p['systemContext'] === 'string' ? p['systemContext'] : '';
      const consequence = typeof p['measurableConsequence'] === 'string'
        ? ` The measurable consequence is: ${p['measurableConsequence'].slice(0, 120)}.`
        : '';
      return `Your search for "${q}" matched the failure mode "${result.label}"${sys ? ` in ${sys}` : ''}. This failure mode is the underlying mechanism behind the symptom you described.${consequence} Understanding this failure mode is the first step to selecting the correct protection technology.`;
    }
    case 'CONTAMINATION': {
      const phase = typeof p['phaseState'] === 'string' ? ` (${p['phaseState'].toLowerCase()} phase)` : '';
      const def = typeof p['definition'] === 'string' ? ` ${p['definition'].slice(0, 120)}.` : '';
      return `Your search for "${q}" matched the contamination mechanism "${result.label}"${phase}.${def} Controlling this contamination at the source prevents downstream component degradation.`;
    }
    case 'TECHNOLOGY_ARCHITECTURE': {
      const domain = typeof p['filtrationDomain'] === 'string' ? ` for ${p['filtrationDomain']}` : '';
      const mech = typeof p['filtrationMechanism'] === 'string' ? ` It works via ${p['filtrationMechanism'].slice(0, 100)}.` : '';
      return `"${result.label}" is a technology architecture${domain} that directly addresses the contamination patterns related to your search.${mech} This architecture is recommended based on the engineering relationship between your query terms and the applicable contamination mechanisms.`;
    }
    case 'ENGINEERING_PRINCIPLE': {
      const sci = typeof p['scienceDomain'] === 'string' ? ` (${p['scienceDomain']})` : '';
      const phen = typeof p['phenomenonDescription'] === 'string' ? ` ${p['phenomenonDescription'].slice(0, 120)}.` : '';
      return `The engineering principle "${result.label}"${sci} governs the contamination control approach relevant to your search.${phen} Technology architectures that implement this principle are recommended for your application.`;
    }
    case 'STANDARD': {
      const body = typeof p['issuingBody'] === 'string' ? ` (${p['issuingBody']})` : '';
      const scope = typeof p['scope'] === 'string' ? ` Scope: ${p['scope'].slice(0, 120)}.` : '';
      return `${result.label}${body} is the applicable industrial standard for measuring and controlling the contamination type related to your search.${scope} Technologies validated against this standard provide verified contamination control for your application.`;
    }
    case 'PROTECTION_MEDIA': {
      const mediaType = typeof p['mediaType'] === 'string' ? ` (${p['mediaType']})` : '';
      return `"${result.label}"${mediaType} is a filtration media type relevant to your query. The choice of media directly determines contamination removal efficiency and service interval.`;
    }
    case 'ENGINEERING_MEMORY': {
      const archived = typeof p['archivedReason'] === 'string' ? ` ${p['archivedReason'].slice(0, 120)}.` : '';
      return `Field engineering record matched your query "${q}".${archived} This operational experience informs the engineering recommendation for your application.`;
    }
    default:
      return `"${result.label}" matched your search for "${q}" via the Engineering Knowledge Graph (${result.matchedFields.join(', ')}).`;
  }
}

// ─── Engineering paths per entity type ────────────────────────────────────────

const ENGINEERING_PATHS: Record<string, string[]> = {
  FAILURE_MODE: [
    'Symptom / Failure Observation',
    'Failure Mode Identification',
    'Root Contamination Source',
    'Engineering Principle',
    'Technology Architecture',
    'Product Selection',
  ],
  CONTAMINATION: [
    'Contamination Source',
    'Failure Mode Caused',
    'Engineering Principle (Control)',
    'Technology Architecture',
    'Product Selection',
  ],
  TECHNOLOGY_ARCHITECTURE: [
    'Technology Architecture',
    'Contamination Controlled',
    'Performance Standard',
    'Product Implementation',
  ],
  ENGINEERING_PRINCIPLE: [
    'Engineering Principle',
    'Technology Architectures Implementing',
    'Contamination Addressed',
    'Product Selection',
  ],
  STANDARD: [
    'Industrial Standard',
    'Measurement Framework',
    'Technology Compliance Requirement',
    'Validated Products',
  ],
  PROTECTION_MEDIA: [
    'Protection Media Type',
    'Technology Architecture Using',
    'Contamination Removed',
    'Product Implementation',
  ],
  ENGINEERING_MEMORY: [
    'Field Record',
    'Application Context',
    'Engineering Principle Applied',
    'Validated Technology',
  ],
};

// ─── Group assignment per entity type and recommendation availability ──────────

function assignGroup(result: SearchResult, hasRecommendations: boolean): SearchGroup {
  if (hasRecommendations && (result.entityType === 'FAILURE_MODE' || result.entityType === 'CONTAMINATION')) {
    return 'RECOMMENDED_SOLUTION';
  }
  switch (result.entityType) {
    case 'FAILURE_MODE':
    case 'CONTAMINATION':
      return 'ENGINEERING_EXPLANATION';
    case 'TECHNOLOGY_ARCHITECTURE':
      return 'TECHNOLOGIES';
    case 'STANDARD':
      return 'STANDARDS';
    case 'PROTECTION_MEDIA':
      return 'RELATED_EQUIPMENT';
    case 'ENGINEERING_PRINCIPLE':
    case 'ENGINEERING_MEMORY':
      return 'ENGINEERING_REFERENCES';
    default:
      return 'ENGINEERING_REFERENCES';
  }
}

// ─── Derive recommendations for a search result ────────────────────────────────

function deriveRecommendations(result: SearchResult): Recommendation[] {
  const MAX = 3;
  try {
    switch (result.entityType) {
      case 'FAILURE_MODE':
        return recommendFromFailureMode(result.entityId).slice(0, MAX);
      case 'CONTAMINATION':
        return recommendFromContamination(result.entityId).slice(0, MAX);
      case 'ENGINEERING_PRINCIPLE':
        return recommendFromPrinciple(result.entityId).slice(0, MAX);
      case 'TECHNOLOGY_ARCHITECTURE':
        return recommendFromTechnology(result.entityId).slice(0, MAX);
      default:
        return [];
    }
  } catch {
    return [];
  }
}

// ─── Confidence from score and recommendation availability ─────────────────────

function deriveConfidence(score: number, recs: Recommendation[]): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score >= 70 && recs.length > 0) return 'HIGH';
  if (score >= 45 || recs.length > 0) return 'MEDIUM';
  return 'LOW';
}

// ─── Build full engineering conversation from raw search results ───────────────

function buildConversations(
  query: string,
  results: SearchResult[],
  _intent?: CustomerIntent,
): EngineeringConversation[] {
  return results.map(result => {
    const recs = deriveRecommendations(result);
    const memory = getMemoryFor(result.entityId);
    const confidence = deriveConfidence(result.score, recs);
    const group = assignGroup(result, recs.length > 0);

    let citationRef = '';
    try {
      const cit = citeEntity(result.entityId, `Engineering explanation for: ${query}`);
      citationRef = formatCitation(cit);
    } catch {
      citationRef = result.entityId;
    }

    return {
      result,
      whyMatched: buildWhyMatched(result, query),
      engineeringRole: group,
      engineeringPath: ENGINEERING_PATHS[result.entityType as string] ?? ['Knowledge Graph', 'Engineering Context'],
      recommendations: recs,
      supportingMemory: memory,
      confidence,
      group,
      citationRef,
    };
  });
}

// ─── Intent metadata ───────────────────────────────────────────────────────────

const INTENT_META: Record<CustomerIntent, {
  label: string;
  explanation: string;
  engineeringApproach: string;
  color: string;
}> = {
  FAILURE_DIAGNOSIS: {
    label: 'Failure Diagnosis',
    explanation: 'You described a symptom or failure. The platform has traced it to the underlying failure mode and identified the contamination mechanism responsible.',
    engineeringApproach: 'Failure Mode → Contamination Source → Engineering Principle → Technology Architecture → Recommended Protection',
    color: '#fca5a5',
  },
  PROACTIVE_PROTECTION: {
    label: 'Asset Protection',
    explanation: 'You are seeking to prevent failures before they occur. The platform has identified the contamination risks for your application and the technologies that control them.',
    engineeringApproach: 'Asset Type → Risk Profile → Contamination Targets → Protection Technologies → Recommended System',
    color: '#86efac',
  },
  TECHNOLOGY_RESEARCH: {
    label: 'Technology Research',
    explanation: 'You are researching filtration technology or engineering knowledge. Results show the technology architectures, governing principles, and applicable standards.',
    engineeringApproach: 'Technology → Engineering Principles → Contamination Addressed → Standards Compliance → Applications',
    color: '#7dd3fc',
  },
  SUPPLIER_EVALUATION: {
    label: 'Standards & Compliance',
    explanation: 'You referenced an industrial standard. Results show the standard\'s scope, the technologies validated against it, and the contamination it controls.',
    engineeringApproach: 'Standard → Measurement Framework → Validated Technologies → Compliant Products',
    color: '#c4b5fd',
  },
  KNOWN_PART: {
    label: 'Part Number Search',
    explanation: 'You entered a specific part reference. Part lookup is handled by the Part Search tool.',
    engineeringApproach: 'Part Number → OEM Cross-Reference → Product Specification',
    color: '#FFF12D',
  },
  EQUIPMENT_REPLACEMENT: {
    label: 'Equipment Replacement',
    explanation: 'You are seeking a replacement or equivalent for existing equipment. Results show compatible technologies and cross-reference data.',
    engineeringApproach: 'OEM Specification → Performance Equivalence → Technology Architecture → Replacement Product',
    color: '#fdba74',
  },
  DISTRIBUTOR: {
    label: 'Distributor Search',
    explanation: 'You are looking for distribution or dealer information.',
    engineeringApproach: 'Region → Authorised Distributor Network → Contact',
    color: '#FFF12D',
  },
  UNKNOWN: {
    label: 'Engineering Search',
    explanation: 'Searching across all Engineering Knowledge. Results are organised by engineering relevance — from recommended solutions to supporting references.',
    engineeringApproach: 'Query → Knowledge Graph Traversal → Engineering Context → Recommendations',
    color: 'rgba(255,255,255,0.4)',
  },
};

// ─── Components ────────────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: 'HIGH' | 'MEDIUM' | 'LOW' }) {
  const colors = { HIGH: '#86efac', MEDIUM: '#FFF12D', LOW: 'rgba(255,255,255,0.3)' };
  return (
    <span style={{
      fontSize: '0.58rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
      background: colors[level] + '18', color: colors[level],
      fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em',
    }}>
      {level} CONFIDENCE
    </span>
  );
}

function EngineeringPathTrace({ steps }: { steps: string[] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.25rem',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.02)',
      borderRadius: '4px',
    }}>
      <span style={{
        fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
        fontFamily: 'JetBrains Mono, monospace', marginRight: '0.25rem',
        alignSelf: 'center',
      }}>
        PATH:
      </span>
      {steps.map((step, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{
            fontSize: '0.68rem',
            color: i === 0
              ? 'rgba(255,255,255,0.6)'
              : i === steps.length - 1
                ? '#FFF12D'
                : 'rgba(255,255,255,0.4)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem' }}>→</span>
          )}
        </span>
      ))}
    </div>
  );
}

function RecommendationTrace({ rec }: { rec: Recommendation }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      marginTop: '0.75rem', padding: '0.85rem 1rem',
      background: 'rgba(134,239,172,0.04)',
      border: '1px solid rgba(134,239,172,0.15)',
      borderRadius: '6px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.75rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '0.58rem', padding: '0.15rem 0.45rem', borderRadius: '3px',
            background: 'rgba(134,239,172,0.1)', color: '#86efac',
            fontFamily: 'JetBrains Mono, monospace',
          }}>RECOMMENDATION</span>
          <span style={{
            color: '#fff', fontFamily: 'Outfit, sans-serif',
            fontWeight: 600, fontSize: '0.88rem',
          }}>
            {rec.targetLabel}
          </span>
          <ConfidenceBadge level={rec.confidence} />
        </div>
        {rec.steps.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(134,239,172,0.6)', fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
            }}
          >
            {open ? 'Hide trace ▲' : 'Engineering trace ▼'}
          </button>
        )}
      </div>

      {rec.explanation && (
        <div style={{
          marginTop: '0.5rem', fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.6,
        }}>
          {rec.explanation}
        </div>
      )}

      {open && rec.steps.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {(rec.steps as readonly RecommendationStep[]).map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.4)',
            }}>
              <span style={{
                minWidth: '1.2rem', color: 'rgba(134,239,172,0.5)',
                marginTop: '0.05rem',
              }}>{i + 1}.</span>
              <span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{step.fromLabel}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', margin: '0 0.35rem' }}>
                  —[{step.relationshipType}]→
                </span>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{step.toLabel}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupportingMemory({ memories }: { memories: GraphNode[] }) {
  if (memories.length === 0) return null;
  return (
    <div style={{
      marginTop: '0.75rem', padding: '0.6rem 0.85rem',
      background: 'rgba(255,241,45,0.03)',
      border: '1px solid rgba(255,241,45,0.12)',
      borderRadius: '4px',
    }}>
      <div style={{
        fontSize: '0.58rem', color: '#FFF12D',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem',
      }}>
        ◈ FIELD ENGINEERING RECORD ({memories.length})
      </div>
      {memories.slice(0, 2).map(m => {
        const mp = m.properties as Record<string, unknown>;
        const text = typeof mp['archivedReason'] === 'string'
          ? mp['archivedReason'].slice(0, 150)
          : m.label;
        return (
          <div key={m.nodeId} style={{
            fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)',
            fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.55,
            marginBottom: '0.25rem',
          }}>
            {text}{text.length === 150 ? '…' : ''}
          </div>
        );
      })}
    </div>
  );
}

function EngineeringConversationCard({
  conv, index, groupColor,
}: { conv: EngineeringConversation; index: number; groupColor: string }) {
  const [expanded, setExpanded] = useState(index === 0);
  const provenance = getEntityProvenance(conv.result.entityId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        border: `1px solid ${groupColor}20`,
        borderLeft: `3px solid ${groupColor}`,
        borderRadius: '0 8px 8px 0',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.01)',
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start',
          gap: '1rem', padding: '1rem 1.25rem',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
        aria-expanded={expanded}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            marginBottom: '0.35rem', flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: '0.58rem', padding: '0.15rem 0.45rem', borderRadius: '3px',
              background: groupColor + '15', color: groupColor,
              fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap',
            }}>
              {conv.result.entityType.replace(/_/g, ' ')}
            </span>
            <span style={{
              color: '#fff', fontFamily: 'Outfit, sans-serif',
              fontWeight: 600, fontSize: '0.95rem',
            }}>
              {conv.result.label}
            </span>
            <ConfidenceBadge level={conv.confidence} />
          </div>

          {/* Why matched — always visible */}
          <div style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
            lineHeight: 1.6, fontFamily: 'Inter, sans-serif',
          }}>
            {conv.whyMatched}
          </div>
        </div>
        <span style={{
          color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem',
          marginTop: '0.15rem', flexShrink: 0,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expandable engineering context */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 1.25rem 1.25rem',
              borderTop: `1px solid ${groupColor}15`,
            }}>

              {/* Engineering path */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem',
                }}>
                  ENGINEERING PATH
                </div>
                <EngineeringPathTrace steps={conv.engineeringPath} />
              </div>

              {/* Recommendations derived from this entity */}
              {conv.recommendations.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{
                    fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                    fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
                  }}>
                    RECOMMENDED TECHNOLOGIES ({conv.recommendations.length})
                  </div>
                  {conv.recommendations.map(rec => (
                    <RecommendationTrace key={rec.recommendationId} rec={rec} />
                  ))}
                </div>
              )}

              {/* Supporting field memory */}
              <SupportingMemory memories={conv.supportingMemory} />

              {/* Citation reference */}
              <div style={{
                marginTop: '1rem', paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap',
              }}>
                <div style={{
                  fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {conv.citationRef}
                </div>
                {provenance && (
                  <div style={{
                    fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
                    fontFamily: 'JetBrains Mono, monospace',
                    display: 'flex', gap: '0.5rem',
                  }}>
                    <span style={{ color: provenance.provenance.governanceStatus === 'ACTIVE' ? 'rgba(134,239,172,0.5)' : 'rgba(255,165,0,0.5)' }}>
                      {provenance.provenance.governanceStatus}
                    </span>
                    <span>·</span>
                    <span>{provenance.provenance.sourceRegistry}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function GroupSection({
  group, conversations, groupIndex,
}: { group: SearchGroup; conversations: EngineeringConversation[]; groupIndex: number }) {
  const meta = GROUP_META[group];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupIndex * 0.1 }}
      style={{ marginBottom: '3rem' }}
    >
      {/* Group header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '0.35rem',
        }}>
          <div style={{
            fontSize: '0.62rem', color: meta.color,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
          }}>
            {meta.order.toString().padStart(2, '0')} / {meta.label.toUpperCase()}
          </div>
          <div style={{
            fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {conversations.length} result{conversations.length !== 1 ? 's' : ''}
          </div>
          <div style={{ flex: 1, height: '1px', background: meta.color + '25' }} />
        </div>
        <div style={{
          fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
          fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
        }}>
          {meta.description}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {conversations.map((conv, i) => (
          <EngineeringConversationCard
            key={conv.result.nodeId}
            conv={conv}
            index={i}
            groupColor={meta.color}
          />
        ))}
      </div>
    </motion.div>
  );
}

function IntentHeader({
  intent, query, resultCount,
}: { intent: CustomerIntent; query: string; resultCount: number }) {
  const meta = INTENT_META[intent];
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${meta.color}20`,
        borderRadius: '8px',
        marginBottom: '2.5rem',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            marginBottom: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.58rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
              background: meta.color + '18', color: meta.color,
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              INTENT: {meta.label.toUpperCase()}
            </span>
            <span style={{
              fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {resultCount} engineering {resultCount === 1 ? 'result' : 'results'}
            </span>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.65,
            marginBottom: '0.6rem',
          }}>
            {meta.explanation}
          </div>
          <div style={{
            fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {meta.engineeringApproach}
          </div>
        </div>

        {intent === 'KNOWN_PART' && (
          <a
            href={`https://part-search.elimfilters.com?q=${encodeURIComponent(query)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.65rem 1.5rem',
              background: '#FFF12D', borderRadius: '4px',
              color: '#000', fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
              whiteSpace: 'nowrap', alignSelf: 'flex-start',
            }}
          >
            Search Parts Database →
          </a>
        )}
      </div>
    </motion.div>
  );
}

function SuggestedSearches({ onSearch }: { onSearch: (q: string) => void }) {
  const SUGGESTIONS = [
    { label: 'Filter blinding too fast', type: 'FAILURE' },
    { label: 'Hydraulic oil contamination', type: 'CONTAMINATION' },
    { label: 'ISO 16889 beta ratio', type: 'STANDARD' },
    { label: 'MACROCORE filtration', type: 'TECHNOLOGY' },
    { label: 'Bearing failure causes', type: 'FAILURE' },
    { label: 'Diesel water contamination', type: 'CONTAMINATION' },
    { label: 'Depth filtration principle', type: 'PRINCIPLE' },
    { label: 'Turbocharger wear prevention', type: 'FAILURE' },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '2rem' }}>
      <div style={{
        fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '1.25rem',
      }}>
        START AN ENGINEERING CONVERSATION
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '0.75rem',
      }}>
        {SUGGESTIONS.map(s => (
          <button
            key={s.label}
            onClick={() => onSearch(s.label)}
            style={{
              padding: '0.9rem 1rem', textAlign: 'left',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '6px', cursor: 'pointer',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
          >
            <div style={{
              fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
              fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.3rem',
            }}>
              {s.type}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem',
              fontFamily: 'Outfit, sans-serif',
            }}>
              {s.label}
            </div>
          </button>
        ))}
      </div>
      <div style={{
        marginTop: '2rem', padding: '1.25rem 1.5rem',
        background: 'rgba(255,255,255,0.01)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter, sans-serif', lineHeight: 1.7,
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem' }}>
          HOW THIS SEARCH WORKS
        </strong>
        <br />
        This is not a product catalogue search. Every query is processed by the Engineering Knowledge Graph — a network of 94 engineering entities connected by 185 typed relationships. Each result explains why it matched, traces the engineering path from your symptom to a recommended solution, and shows the field evidence supporting the recommendation.
      </div>
    </motion.div>
  );
}

// ─── Main search inner (needs useSearchParams) ─────────────────────────────────

const GROUP_ORDER: SearchGroup[] = [
  'RECOMMENDED_SOLUTION',
  'ENGINEERING_EXPLANATION',
  'TECHNOLOGIES',
  'STANDARDS',
  'RELATED_EQUIPMENT',
  'ENGINEERING_REFERENCES',
];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(queryParam);
  const [intent, setIntent] = useState<CustomerIntent>('UNKNOWN');
  const [conversations, setConversations] = useState<EngineeringConversation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = useCallback((q: string, detectedIntent: CustomerIntent = 'UNKNOWN') => {
    if (!q.trim()) return;
    const hits = search(q, { maxResults: 24 });
    const convs = buildConversations(q, hits, detectedIntent);
    setConversations(convs);
    setIntent(detectedIntent);
    setHasSearched(true);
    setQuery(q);
    router.replace(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    if (queryParam) runSearch(queryParam, 'UNKNOWN');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleResult(hits: SearchResult[], detectedIntent: CustomerIntent) {
    const convs = buildConversations(query || queryParam, hits, detectedIntent);
    setConversations(convs);
    setIntent(detectedIntent);
    setHasSearched(true);
    if (query || queryParam) {
      router.replace(`/search?q=${encodeURIComponent(query || queryParam)}`, { scroll: false });
    }
  }

  // Group conversations by engineering meaning
  const grouped = new Map<SearchGroup, EngineeringConversation[]>();
  for (const conv of conversations) {
    const g = grouped.get(conv.group) ?? [];
    g.push(conv);
    grouped.set(conv.group, g);
  }
  const orderedGroups = GROUP_ORDER.filter(g => grouped.has(g));

  return (
    <>
      <Navigation />
      <main style={{ background: '#000', minHeight: '100vh' }}>

        {/* Search header */}
        <div style={{
          padding: '3rem 8% 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{
              fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.12em', marginBottom: '0.75rem',
            }}>
              ENGINEERING INTELLIGENCE SEARCH — KNOWLEDGE GRAPH v2.0.0
            </div>
            <EngineeringSearchBar
              initialQuery={queryParam}
              onResult={handleResult}
              placeholder="Describe a symptom, failure mode, contamination, or technology…"
              autoFocus
            />
            <div style={{
              marginTop: '0.75rem', fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif',
            }}>
              Every result includes an engineering explanation, the reasoning path, and supporting evidence.
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: '2.5rem 8%' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">

              {!hasSearched && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SuggestedSearches onSearch={q => runSearch(q, 'UNKNOWN')} />
                </motion.div>
              )}

              {hasSearched && conversations.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ paddingTop: '2rem', textAlign: 'center' }}>
                  <div style={{
                    fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)',
                    fontFamily: 'JetBrains Mono, monospace', marginBottom: '1rem',
                  }}>
                    NO ENGINEERING KNOWLEDGE FOUND
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                    The Knowledge Graph did not find engineering context for &ldquo;{query}&rdquo;. Try describing the symptom differently — for example &ldquo;filter blinding&rdquo; instead of &ldquo;filter is dirty&rdquo;.
                  </p>
                  <a href="/knowledge-system" style={{ color: '#FFF12D', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Browse the Engineering Knowledge System →
                  </a>
                </motion.div>
              )}

              {hasSearched && conversations.length > 0 && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                  <IntentHeader intent={intent} query={query} resultCount={conversations.length} />

                  {orderedGroups.map((group, gi) => (
                    <GroupSection
                      key={group}
                      group={group}
                      conversations={grouped.get(group)!}
                      groupIndex={gi}
                    />
                  ))}

                  {/* Engineering consultation CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                      marginTop: '1rem', padding: '1.5rem 1.75rem',
                      background: 'rgba(255,241,45,0.03)',
                      border: '1px solid rgba(255,241,45,0.15)',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{
                      fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)',
                      fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
                    }}>
                      ENGINEERING CONSULTATION
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem',
                      lineHeight: 1.65, margin: '0 0 1rem',
                    }}>
                      The Knowledge Graph has identified the engineering context. An ELIMFILTERS engineer can review your specific application, confirm the failure mode diagnosis, and specify the complete protection system.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <a href="/engineering/diagnosis" style={{
                        padding: '0.6rem 1.4rem',
                        background: '#FFF12D', borderRadius: '4px',
                        color: '#000', fontFamily: 'Outfit, sans-serif',
                        fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none',
                      }}>
                        Guided Diagnosis →
                      </a>
                      <a href="/engineering/asset-protection" style={{
                        padding: '0.6rem 1.25rem',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '4px', color: 'rgba(255,255,255,0.55)',
                        fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}>
                        Asset Protection Journey
                      </a>
                    </div>
                  </motion.div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <ConversionProvider>
      <Suspense fallback={
        <div style={{
          background: '#000', minHeight: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
          }}>
            Initialising Engineering Knowledge Graph…
          </div>
        </div>
      }>
        <SearchPageInner />
      </Suspense>
    </ConversionProvider>
  );
}
