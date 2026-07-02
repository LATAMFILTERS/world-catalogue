'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { findById } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';

interface StandardCardProps {
  entityId: string;
  showValidatedTechnologies?: boolean;
}

export function StandardCard({ entityId, showValidatedTechnologies = false }: StandardCardProps) {
  const [node, setNode] = useState<GraphNode | null>(null);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    const n = findById(entityId);
    setNode(n);
    if (n) { engageEntity(entityId); dispatchTrustSignal('T-3'); }
  }, [entityId, dispatchTrustSignal, engageEntity]);

  if (!node) return null;
  const p = node.properties as Record<string, unknown>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(196,181,253,0.3)' }}
      style={{
        background: 'rgba(196,181,253,0.03)', border: '1px solid rgba(196,181,253,0.12)',
        borderRadius: '8px', padding: '1rem 1.25rem', transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
          color: '#c4b5fd', fontSize: '0.85rem', whiteSpace: 'nowrap', marginTop: '0.1rem',
        }}>
          {node.label}
        </div>
        {!!p['issuingBody'] && (
          <span style={{
            fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
            background: 'rgba(196,181,253,0.1)', color: 'rgba(196,181,253,0.7)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {String(p['issuingBody'])}
          </span>
        )}
      </div>

      {!!p['title'] && (
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.82rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
          {String(p['title'])}
        </div>
      )}

      {!!p['scope'] && (
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '0.4rem', lineHeight: 1.55 }}>
          {String(p['scope']).slice(0, 180)}{String(p['scope']).length > 180 ? '…' : ''}
        </div>
      )}

      <div style={{ marginTop: '0.6rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
        {node.entityId}
      </div>
    </motion.div>
  );
}
