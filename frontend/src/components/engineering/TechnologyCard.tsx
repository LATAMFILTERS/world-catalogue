'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { findById, getEntityProvenance, recommendFromTechnology } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { GraphNode } from '@/lib/graph/graph-types';
import type { Recommendation } from '@/lib/services';

interface TechnologyCardProps {
  entityId: string;
  mode?: 'summary' | 'full';
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  onSelectForProtection?: (entityId: string) => void;
}

const CONFIDENCE_COLORS = { HIGH: '#86efac', MEDIUM: '#FFF12D', LOW: 'rgba(255,255,255,0.4)' };

export function TechnologyCard({ entityId, mode = 'summary', confidence, onSelectForProtection }: TechnologyCardProps) {
  const [node, setNode] = useState<GraphNode | null>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [showRecs, setShowRecs] = useState(false);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    const n = findById(entityId);
    setNode(n);
    if (n) {
      engageEntity(entityId);
      dispatchTrustSignal('T-4');
      if (mode === 'full') {
        const r = recommendFromTechnology(entityId);
        setRecs(r);
        if (r.length > 0) dispatchTrustSignal('T-6');
      }
    }
  }, [entityId, mode, dispatchTrustSignal, engageEntity]);

  if (!node) return null;
  const p = node.properties as Record<string, unknown>;

  const definition = typeof p['canonicalDefinition'] === 'string' ? p['canonicalDefinition'] : '';
  const systemDomain = typeof p['systemDomain'] === 'string' ? p['systemDomain'] : '';
  const techName = typeof p['technologyName'] === 'string' ? p['technologyName'] : node.label;

  if (mode === 'summary') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
        onClick={() => onSelectForProtection?.(entityId)}
        style={{
          background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)',
          borderRadius: '8px', padding: '1.25rem',
          cursor: onSelectForProtection ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <span style={{
            fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
            background: 'rgba(255,241,45,0.1)', color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
          }}>TECHNOLOGY</span>
          {confidence && (
            <span style={{
              fontSize: '0.65rem', color: CONFIDENCE_COLORS[confidence],
              fontFamily: 'JetBrains Mono, monospace',
            }} aria-label={`Confidence: ${confidence}`}>
              {confidence}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
          {techName}
        </div>
        {systemDomain && (
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>{systemDomain}</div>
        )}
        {definition && (
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', lineHeight: 1.6 }}>
            {definition.slice(0, 120)}{definition.length > 120 ? '…' : ''}
          </div>
        )}
        <div style={{ marginTop: '0.75rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'JetBrains Mono, monospace' }}>
          {node.entityId}
        </div>
      </motion.div>
    );
  }

  // Full mode
  const provenance = getEntityProvenance(entityId);
  const principles = recs.filter(r => r.targetEntityType === 'ENGINEERING_PRINCIPLE');
  const standards = recs.filter(r => r.targetEntityType === 'STANDARD');
  const failureModes = recs.filter(r => r.targetEntityType === 'FAILURE_MODE');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,241,45,0.02)', border: '1px solid rgba(255,241,45,0.15)',
        borderRadius: '8px', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '3px',
            background: 'rgba(255,241,45,0.12)', color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
          }}>TECHNOLOGY ARCHITECTURE</span>
          {systemDomain && (
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>
              {systemDomain}
            </span>
          )}
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', margin: '0 0 1rem' }}>
          {techName}
        </h2>
        {definition && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.75, margin: 0, textAlign: 'justify' }}>
            {definition}
          </p>
        )}
      </div>

      {/* Related entities */}
      {recs.length > 0 && (
        <div style={{ padding: '1.5rem 1.75rem' }}>
          <button
            onClick={() => setShowRecs(r => !r)}
            style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer', padding: 0, marginBottom: '1rem',
            }}
          >
            {showRecs ? '▲' : '▼'} Engineering context ({recs.length} connections)
          </button>

          <AnimatePresence>
            {showRecs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {principles.length > 0 && (
                  <RelGroup label="IMPLEMENTS PRINCIPLE" items={principles} color="#7dd3fc" />
                )}
                {standards.length > 0 && (
                  <RelGroup label="VALIDATES STANDARD" items={standards} color="#c4b5fd" />
                )}
                {failureModes.length > 0 && (
                  <RelGroup label="PREVENTS FAILURE MODE" items={failureModes} color="#fca5a5" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '1rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
          {node.entityId} · {provenance?.provenance.sourceRegistry ?? ''} · {provenance?.provenance.governanceStatus ?? ''}
        </div>
        {onSelectForProtection && (
          <button
            onClick={() => onSelectForProtection(entityId)}
            style={{
              padding: '0.5rem 1.25rem', background: 'rgba(255,241,45,0.1)',
              border: '1px solid rgba(255,241,45,0.3)', borderRadius: '4px',
              color: '#FFF12D', fontSize: '0.8rem', cursor: 'pointer',
            }}
          >
            Select for protection system →
          </button>
        )}
      </div>
    </motion.div>
  );
}

function RelGroup({ label, items, color }: { label: string; items: Recommendation[]; color: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.6rem', color: color, fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.4rem' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {items.map(r => (
          <span key={r.recommendationId} style={{
            fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '3px',
            background: color + '12', color: color, fontFamily: 'JetBrains Mono, monospace',
          }}>
            {r.targetLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
