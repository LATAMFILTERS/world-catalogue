'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { findById } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';

interface ContaminationCardProps {
  entityId: string;
  showFailureModes?: boolean;
  onSelect?: (entityId: string) => void;
}

const PHASE_COLORS: Record<string, string> = {
  solid: '#fdba74', liquid: '#7dd3fc', gas: '#86efac',
  biological: '#f9a8d4', aerosol: '#c4b5fd',
};

export function ContaminationCard({ entityId, showFailureModes = false, onSelect }: ContaminationCardProps) {
  const [node, setNode] = useState<GraphNode | null>(null);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    const n = findById(entityId);
    setNode(n);
    if (n) { engageEntity(entityId); dispatchTrustSignal('T-1'); }
  }, [entityId, dispatchTrustSignal, engageEntity]);

  if (!node) return null;
  const p = node.properties as Record<string, unknown>;
  const phase = (typeof p['phaseState'] === 'string' ? p['phaseState'].toLowerCase() : 'solid');
  const phaseColor = PHASE_COLORS[phase] ?? '#fdba74';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ borderColor: 'rgba(253,186,116,0.35)' }}
      onClick={() => onSelect?.(entityId)}
      style={{
        background: 'rgba(253,186,116,0.03)', border: '1px solid rgba(253,186,116,0.12)',
        borderRadius: '8px', padding: '1.25rem',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
        <span style={{
          fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '3px',
          background: phaseColor + '18', color: phaseColor,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {String(p['phaseState'] ?? 'SOLID').toUpperCase()}
        </span>
        {!!p['contaminantClass'] && (
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
            {String(p['contaminantClass'])}
          </span>
        )}
      </div>

      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
        {node.label}
      </div>

      {!!p['definition'] && (
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.6 }}>
          {String(p['definition']).slice(0, 140)}{String(p['definition']).length > 140 ? '…' : ''}
        </div>
      )}

      <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
        {node.entityId}
      </div>
    </motion.div>
  );
}
