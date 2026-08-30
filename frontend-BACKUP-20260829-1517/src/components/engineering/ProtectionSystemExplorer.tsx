'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { recommendFromFailureMode, recommendFromContamination, buildAIContext } from '@/lib/services';
import type { Recommendation } from '@/lib/services';
import { RecommendationPanel } from './RecommendationPanel';
import { useConversion } from '@/components/conversion/ConversionContext';

interface ProtectionSystemExplorerProps {
  failureModeEntityIds?: string[];
  contaminationEntityIds?: string[];
  onProductsRequested: (techEntityIds: string[]) => void;
}

export function ProtectionSystemExplorer({
  failureModeEntityIds = [],
  contaminationEntityIds = [],
  onProductsRequested,
}: ProtectionSystemExplorerProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const { dispatchTrustSignal } = useConversion();

  useEffect(() => {
    const seen = new Set<string>();
    const all: Recommendation[] = [];

    for (const fmId of failureModeEntityIds) {
      for (const r of recommendFromFailureMode(fmId)) {
        if (!seen.has(r.targetEntityId)) { seen.add(r.targetEntityId); all.push(r); }
      }
    }
    for (const contId of contaminationEntityIds) {
      for (const r of recommendFromContamination(contId)) {
        if (!seen.has(r.targetEntityId)) { seen.add(r.targetEntityId); all.push(r); }
      }
    }

    // Sort by confidence
    const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    all.sort((a, b) => order[a.confidence] - order[b.confidence]);

    const techRecs = all.filter(r => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE');
    setRecommendations(techRecs.slice(0, 4));
    setLoading(false);

    if (techRecs.length > 0) dispatchTrustSignal('T-6');
  }, [failureModeEntityIds, contaminationEntityIds, dispatchTrustSignal]);

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Analyzing protection requirements…</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
        No protection recommendations found for the selected failure modes.
      </div>
    );
  }

  const primary = recommendations[0];
  const secondary = recommendations.slice(1);
  const techIds = recommendations.map(r => r.targetEntityId);

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{
          fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)',
          fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem',
        }}>
          YOUR RECOMMENDED PROTECTION SYSTEM
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>
          Based on your assets and identified risks. Every recommendation below includes the complete engineering trace.
        </p>
      </div>

      {/* Primary recommendation */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#86efac', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
          PRIMARY RECOMMENDATION
        </div>
        <RecommendationPanel recommendation={primary} showFullTrace={true} />
      </div>

      {/* Secondary recommendations */}
      {secondary.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
            ADDITIONAL PROTECTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {secondary.map(rec => (
              <RecommendationPanel key={rec.recommendationId} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Show products CTA — appears only after engineering context is rendered */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          padding: '1.25rem', background: 'rgba(255,241,45,0.04)',
          border: '1px solid rgba(255,241,45,0.2)', borderRadius: '8px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '0.75rem',
        }}
      >
        <div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>
            Protection system confirmed
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            {recommendations.length} technology architecture{recommendations.length !== 1 ? 's' : ''} · Full engineering trace available
          </div>
        </div>
        <button
          onClick={() => onProductsRequested(techIds)}
          style={{
            padding: '0.65rem 1.5rem', background: '#FFF12D',
            border: 'none', borderRadius: '4px', color: '#000',
            fontFamily: 'Outfit, sans-serif', fontWeight: 700,
            fontSize: '0.9rem', cursor: 'pointer',
          }}
        >
          View recommended products →
        </button>
      </motion.div>
    </div>
  );
}
