'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { findById, getEntityProvenance, getMemoryFor } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';

interface FailureModeCardProps {
  entityId: string;
  expanded?: boolean;
  onExploreContamination?: (entityId: string) => void;
  onExploreTechnology?: (entityId: string) => void;
}

export function FailureModeCard({
  entityId, expanded: initialExpanded = false,
  onExploreContamination, onExploreTechnology,
}: FailureModeCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);
  const [node, setNode] = useState<GraphNode | null>(null);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    const n = findById(entityId);
    setNode(n);
    if (n) engageEntity(entityId);
    dispatchTrustSignal('T-1');
  }, [entityId, dispatchTrustSignal, engageEntity]);

  function handleExpand() {
    setExpanded(e => !e);
    if (!expanded) dispatchTrustSignal('T-2');
  }

  if (!node) return null;
  const p = node.properties as Record<string, unknown>;

  const causeSteps = typeof p['causeChain'] === 'string'
    ? p['causeChain'].split(/→|->/).map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(252,165,165,0.04)', border: '1px solid rgba(252,165,165,0.15)',
        borderRadius: '8px', overflow: 'hidden',
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={handleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'flex-start',
          gap: '1rem', padding: '1.25rem 1.5rem',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
        aria-expanded={expanded}
      >
        <span style={{
          fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
          background: 'rgba(252,165,165,0.12)', color: '#fca5a5',
          fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', marginTop: '0.15rem',
        }}>
          FAILURE MODE
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1rem', marginBottom: '0.3rem' }}>
            {node.label}
          </div>
          {!!p['systemContext'] && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              {String(p['systemContext'])}
            </div>
          )}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(252,165,165,0.1)' }}>

              {/* Cause chain */}
              {causeSteps.length > 0 && (
                <div style={{ marginTop: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.75rem' }}>
                    CAUSE CHAIN
                  </div>
                  {causeSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <span style={{
                        minWidth: '1.5rem', height: '1.5rem', borderRadius: '50%',
                        background: 'rgba(252,165,165,0.15)', color: '#fca5a5',
                        fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'JetBrains Mono, monospace', flexShrink: 0,
                      }}>{i + 1}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: 1.6 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Measurable consequence */}
              {!!p['measurableConsequence'] && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(252,165,165,0.06)', borderRadius: '6px', borderLeft: '3px solid rgba(252,165,165,0.3)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem' }}>
                    MEASURABLE CONSEQUENCE
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {String(p['measurableConsequence'])}
                  </div>
                </div>
              )}

              {/* Industrial impact */}
              {!!p['industrialImpact'] && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem' }}>
                    INDUSTRIAL IMPACT
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {String(p['industrialImpact'])}
                  </div>
                </div>
              )}

              {/* Engineering memory */}
              <EngineeringMemoryInline entityId={entityId} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                {onExploreContamination && (
                  <button
                    onClick={() => onExploreContamination(entityId)}
                    style={{
                      padding: '0.5rem 1rem', background: 'transparent',
                      border: '1px solid rgba(253,186,116,0.3)', borderRadius: '4px',
                      color: '#fdba74', fontSize: '0.8rem', cursor: 'pointer',
                    }}
                  >
                    → Find root contamination
                  </button>
                )}
                {onExploreTechnology && (
                  <button
                    onClick={() => onExploreTechnology(entityId)}
                    style={{
                      padding: '0.5rem 1rem', background: 'rgba(255,241,45,0.08)',
                      border: '1px solid rgba(255,241,45,0.25)', borderRadius: '4px',
                      color: '#FFF12D', fontSize: '0.8rem', cursor: 'pointer',
                    }}
                  >
                    → Find prevention technology
                  </button>
                )}
              </div>

              {/* Provenance */}
              <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
                {node.entityId} · {node.provenance.sourceRegistry} · {node.provenance.governanceStatus}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Inline memory display (used inside FailureModeCard to avoid circular imports)
function EngineeringMemoryInline({ entityId }: { entityId: string }) {
  const memories = getMemoryFor(entityId);
  if (memories.length === 0) return null;
  return (
    <div style={{
      marginTop: '1rem', padding: '0.75rem 1rem',
      background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.15)',
      borderRadius: '6px',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
        FIELD ENGINEERING RECORD
      </div>
      {memories.map(m => {
        const mp = m.properties as Record<string, unknown>;
        return (
          <div key={m.nodeId} style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', lineHeight: 1.6 }}>
            {mp['archivedReason'] ? String(mp['archivedReason']) : m.label}
          </div>
        );
      })}
    </div>
  );
}
