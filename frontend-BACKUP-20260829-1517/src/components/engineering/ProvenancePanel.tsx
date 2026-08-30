'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getEntityProvenance } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { EntityProvenance } from '@/lib/services';

interface ProvenancePanelProps {
  entityId: string;
  compact?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#86efac', DEPRECATED: '#fca5a5', ALIAS: '#FFF12D', SUPERSEDED: '#fdba74',
};

export function ProvenancePanel({ entityId, compact = false }: ProvenancePanelProps) {
  const [provenance, setProvenance] = useState<EntityProvenance | null>(null);
  const { dispatchTrustSignal } = useConversion();

  useEffect(() => {
    const p = getEntityProvenance(entityId);
    setProvenance(p);
    if (p) dispatchTrustSignal('T-7');
  }, [entityId, dispatchTrustSignal]);

  if (!provenance) return null;

  const prov = provenance.provenance;
  const statusColor = STATUS_COLORS[prov.governanceStatus] ?? '#fff';

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.35)',
      }}>
        <span style={{ color: statusColor }}>{prov.governanceStatus}</span>
        <span>·</span>
        <span>{prov.sourceRegistry}</span>
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: '6px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
      }}
    >
      <div style={{ color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>PROVENANCE</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>status </span>
          <span style={{ color: statusColor }}>{prov.governanceStatus}</span>
        </span>
        <span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>registry </span>
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{prov.sourceRegistry}</span>
        </span>
        {prov.entityVersion && (
          <span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>version </span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{prov.entityVersion}</span>
          </span>
        )}
        {prov.edrRefs.length > 0 && (
          <span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>EDR </span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>{prov.edrRefs[0]}</span>
          </span>
        )}
      </div>
      {prov.aliasFor && (
        <div style={{ marginTop: '0.5rem', color: '#FFF12D' }}>
          Canonical alias for {prov.aliasFor}
        </div>
      )}
    </motion.div>
  );
}
