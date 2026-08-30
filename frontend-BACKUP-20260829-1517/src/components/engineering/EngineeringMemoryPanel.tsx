'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMemoryFor } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';

interface EngineeringMemoryPanelProps {
  entityId: string;
}

export function EngineeringMemoryPanel({ entityId }: EngineeringMemoryPanelProps) {
  const [memories, setMemories] = useState<GraphNode[]>([]);
  const [expanded, setExpanded] = useState(false);
  const { dispatchTrustSignal } = useConversion();

  useEffect(() => {
    const m = getMemoryFor(entityId);
    setMemories(m);
  }, [entityId]);

  // Render nothing when no memory exists — this is by design
  if (memories.length === 0) return null;

  function handleExpand() {
    setExpanded(e => !e);
    if (!expanded) dispatchTrustSignal('T-5');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.24)',
        borderRadius: '6px', overflow: 'hidden',
      }}
    >
      <button
        onClick={handleExpand}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.85rem 1rem', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
        aria-expanded={expanded}
      >
        <span style={{ fontSize: '0.65rem', color: '#FFF12D', fontFamily: 'JetBrains Mono, monospace' }}>
          ◈ FIELD ENGINEERING RECORD
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
          {memories.length} entr{memories.length !== 1 ? 'ies' : 'y'} {expanded ? '▲' : '▼'}
        </span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,241,45,0.1)', padding: '0.85rem 1rem' }}>
              {memories.map((m, i) => {
                const mp = m.properties as Record<string, unknown>;
                return (
                  <div
                    key={m.nodeId}
                    style={{
                      marginBottom: i < memories.length - 1 ? '0.85rem' : 0,
                      paddingBottom: i < memories.length - 1 ? '0.85rem' : 0,
                      borderBottom: i < memories.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}
                  >
                    {!!mp['archivedReason'] && (
                      <p style={{
                        margin: '0 0 0.3rem', color: 'rgba(255,255,255,0.65)',
                        fontSize: '0.82rem', lineHeight: 1.65,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {String(mp['archivedReason'])}
                      </p>
                    )}
                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {m.entityId} · {m.provenance.sourceRegistry}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
