'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { formatCitation } from '@/lib/services';
import { useConversion } from '@/components/conversion/ConversionContext';

// CitationObject shape (matches citation-service output)
interface CitationObject {
  citationId: string;
  claim: string;
  sourceEntityId: string;
  sourceRegistry: string;
  traceability: 'FULL' | 'PARTIAL' | 'NONE';
  formattedCitation?: string;
  edrRef?: string;
  governanceStatus?: string;
}

interface CitationPanelProps {
  citation: CitationObject;
  compact?: boolean;
}

const TRACEABILITY_COLORS = { FULL: '#86efac', PARTIAL: '#FFF12D', NONE: '#fca5a5' };
const TRACEABILITY_BG = { FULL: 'rgba(134,239,172,0.08)', PARTIAL: 'rgba(255,241,45,0.06)', NONE: 'rgba(252,165,165,0.06)' };

export function CitationPanel({ citation, compact = false }: CitationPanelProps) {
  const { dispatchTrustSignal } = useConversion();

  useEffect(() => {
    if (citation.traceability === 'FULL') dispatchTrustSignal('T-3');
  }, [citation.traceability, dispatchTrustSignal]);

  const color = TRACEABILITY_COLORS[citation.traceability];
  const bg = TRACEABILITY_BG[citation.traceability];

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '3px',
          background: bg, color, fontFamily: 'JetBrains Mono, monospace',
          border: `1px solid ${color}22`,
        }}
        aria-label={`Traceability: ${citation.traceability}`}
      >
        <span>{citation.traceability}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>{citation.sourceEntityId}</span>
      </span>
    );
  }

  const formatted = formatCitation(citation as Parameters<typeof formatCitation>[0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '0.85rem 1rem', background: bg,
        border: `1px solid ${color}22`, borderRadius: '6px',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <span
          style={{ fontSize: '0.65rem', color, border: `1px solid ${color}44`, padding: '0.1rem 0.4rem', borderRadius: '3px' }}
          aria-label={`Traceability: ${citation.traceability}`}
        >
          {citation.traceability}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{citation.sourceEntityId}</span>
        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{citation.sourceRegistry}</span>
      </div>

      {citation.claim && (
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
          "{citation.claim}"
        </div>
      )}

      {formatted && (
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', lineHeight: 1.5 }}>
          {formatted}
        </div>
      )}

      {citation.edrRef && (
        <div style={{ marginTop: '0.4rem', color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem' }}>
          EDR: {citation.edrRef}
        </div>
      )}
    </motion.div>
  );
}
