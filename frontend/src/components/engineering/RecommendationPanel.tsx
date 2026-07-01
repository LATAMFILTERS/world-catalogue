'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useConversion } from '@/components/conversion/ConversionContext';
import type { Recommendation } from '@/lib/services';

interface RecommendationPanelProps {
  recommendation: Recommendation;
  showFullTrace?: boolean;
  onAccept?: (recommendation: Recommendation) => void;
}

const CONFIDENCE_COLORS = { HIGH: '#86efac', MEDIUM: '#FFF12D', LOW: 'rgba(255,255,255,0.4)' };
const CONFIDENCE_BG = { HIGH: 'rgba(134,239,172,0.1)', MEDIUM: 'rgba(255,241,45,0.08)', LOW: 'rgba(255,255,255,0.04)' };

const ENTITY_TYPE_COLORS: Record<string, string> = {
  ENGINEERING_PRINCIPLE: '#7dd3fc',
  TECHNOLOGY_ARCHITECTURE: '#FFF12D',
  PROTECTION_MEDIA: '#86efac',
  STANDARD: '#c4b5fd',
  FAILURE_MODE: '#fca5a5',
  CONTAMINATION: '#fdba74',
  ENGINEERING_MEMORY: 'rgba(255,255,255,0.4)',
};

export function RecommendationPanel({ recommendation: rec, showFullTrace = false, onAccept }: RecommendationPanelProps) {
  const [traceOpen, setTraceOpen] = useState(showFullTrace);
  const { dispatchTrustSignal, receiveRecommendation } = useConversion();

  useEffect(() => {
    if (rec.steps.length === 0) return; // Hard constraint: no steps = no dispatch
    dispatchTrustSignal('T-6');
    receiveRecommendation(rec);
  }, [rec, dispatchTrustSignal, receiveRecommendation]);

  // Constitutional constraint: never render unexplained recommendations
  if (rec.steps.length === 0) {
    return (
      <div style={{
        padding: '1rem 1.25rem', background: 'rgba(252,165,165,0.06)',
        border: '1px solid rgba(252,165,165,0.2)', borderRadius: '6px',
        color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
      }}>
        ⚠ This recommendation has no engineering trace and cannot be displayed.
      </div>
    );
  }

  const conf = rec.confidence;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: CONFIDENCE_BG[conf], border: `1px solid ${CONFIDENCE_COLORS[conf]}22`,
        borderRadius: '8px', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
            background: (ENTITY_TYPE_COLORS[rec.targetEntityType] ?? '#fff') + '18',
            color: ENTITY_TYPE_COLORS[rec.targetEntityType] ?? '#fff',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {rec.targetEntityType.replace(/_/g, ' ')}
          </span>
          <span
            style={{
              fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
              background: CONFIDENCE_BG[conf], color: CONFIDENCE_COLORS[conf],
              fontFamily: 'JetBrains Mono, monospace', border: `1px solid ${CONFIDENCE_COLORS[conf]}33`,
            }}
            aria-label={`Confidence: ${conf}`}
          >
            {conf} CONFIDENCE
          </span>
        </div>

        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: '0.4rem' }}>
          {rec.targetLabel}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.65 }}>
          {rec.explanation}
        </div>
      </div>

      {/* Trace toggle */}
      <button
        onClick={() => setTraceOpen(o => !o)}
        style={{
          width: '100%', padding: '0.75rem 1.5rem',
          background: 'transparent', border: 'none',
          borderBottom: traceOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem',
          fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}
        aria-label={`Engineering path: ${rec.steps.length} steps`}
      >
        {traceOpen ? '▲' : '▼'} Engineering path · {rec.steps.length} step{rec.steps.length !== 1 ? 's' : ''}
      </button>

      {/* Trace */}
      <AnimatePresence>
        {traceOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1rem 1.5rem' }}>
              {rec.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: i < rec.steps.length - 1 ? '0' : '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: CONFIDENCE_COLORS[conf], marginTop: '0.4rem',
                    }} />
                    {i < rec.steps.length - 1 && (
                      <div style={{ width: '1px', flex: 1, background: 'rgba(255,255,255,0.1)', minHeight: '2rem' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < rec.steps.length - 1 ? '1rem' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {step.fromEntityId}
                      </span>
                      <span style={{
                        fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '2px',
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {step.relationshipType}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                        {step.toEntityId}
                      </span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.5 }}>
                      {step.reasoning}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accept action */}
      {onAccept && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => onAccept(rec)}
            style={{
              padding: '0.6rem 1.5rem', background: '#FFF12D',
              border: 'none', borderRadius: '4px', color: '#000',
              fontFamily: 'Outfit, sans-serif', fontWeight: 600,
              fontSize: '0.85rem', cursor: 'pointer',
            }}
          >
            Apply this recommendation
          </button>
        </div>
      )}
    </motion.div>
  );
}
