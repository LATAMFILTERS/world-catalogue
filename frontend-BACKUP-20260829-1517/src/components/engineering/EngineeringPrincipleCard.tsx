'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { findById, recommendFromPrinciple } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';

interface EngineeringPrincipleCardProps {
  entityId: string;
  showTechnologies?: boolean;
}

export function EngineeringPrincipleCard({ entityId, showTechnologies = false }: EngineeringPrincipleCardProps) {
  const [node, setNode] = useState<GraphNode | null>(null);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    const n = findById(entityId);
    setNode(n);
    if (n) {
      engageEntity(entityId);
      dispatchTrustSignal('T-2');
      dispatchTrustSignal('T-3');
    }
  }, [entityId, dispatchTrustSignal, engageEntity]);

  if (!node) return null;
  const p = node.properties as Record<string, unknown>;

  const techs = showTechnologies ? recommendFromPrinciple(entityId).filter(r => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE') : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(125,211,252,0.3)' }}
      style={{
        background: 'rgba(125,211,252,0.03)', border: '1px solid rgba(125,211,252,0.12)',
        borderRadius: '8px', padding: '1.25rem', transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <span style={{
          fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
          background: 'rgba(125,211,252,0.1)', color: '#7dd3fc',
          fontFamily: 'JetBrains Mono, monospace',
        }}>ENGINEERING PRINCIPLE</span>
        {!!p['scienceDomain'] && (
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
            {String(p['scienceDomain'])}
          </span>
        )}
      </div>

      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
        {node.label}
      </div>

      {!!p['definition'] && (
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', lineHeight: 1.65, marginBottom: '0.75rem' }}>
          {String(p['definition'])}
        </div>
      )}

      {!!p['phenomenonDescription'] && (
        <div style={{
          padding: '0.6rem 0.85rem', background: 'rgba(125,211,252,0.05)',
          borderLeft: '2px solid rgba(125,211,252,0.25)', borderRadius: '0 4px 4px 0',
          fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
        }}>
          {String(p['phenomenonDescription'])}
        </div>
      )}

      {showTechnologies && techs.length > 0 && (
        <div style={{ marginTop: '0.85rem' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem' }}>
            IMPLEMENTED BY
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {techs.map(r => (
              <span key={r.recommendationId} style={{
                fontSize: '0.7rem', padding: '0.2rem 0.5rem',
                background: 'rgba(255,241,45,0.08)', color: '#FFF12D',
                borderRadius: '3px', fontFamily: 'JetBrains Mono, monospace',
              }}>{r.targetLabel}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
        {node.entityId}
      </div>
    </motion.div>
  );
}
