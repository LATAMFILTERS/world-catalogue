'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  recommendFromTechnology,
  recommendFromContamination,
  recommendFromFailureMode,
  recommendFromPrinciple,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { RecommendationPanel } from './RecommendationPanel';
import { EngineeringMemoryPanel } from './EngineeringMemoryPanel';

type QueryType = 'technology' | 'contamination' | 'failureMode' | 'principle';

interface EngineeringRecommendationsSectionProps {
  primaryEntityId: string;
  queryType: QueryType;
  label?: string;
  maxRecommendations?: number;
}

export function EngineeringRecommendationsSection({
  primaryEntityId,
  queryType,
  label = 'ENGINEERING RECOMMENDATIONS',
  maxRecommendations = 3,
}: EngineeringRecommendationsSectionProps) {
  const recommendations = useMemo(() => {
    const recs =
      queryType === 'technology'    ? recommendFromTechnology(primaryEntityId)
      : queryType === 'contamination' ? recommendFromContamination(primaryEntityId)
      : queryType === 'failureMode'   ? recommendFromFailureMode(primaryEntityId)
      : recommendFromPrinciple(primaryEntityId);
    return recs.slice(0, maxRecommendations);
  }, [primaryEntityId, queryType, maxRecommendations]);

  // Render nothing if the graph returns no recommendations for this entity
  if (recommendations.length === 0) return null;

  return (
    <ConversionProvider>
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
      style={{
        marginTop: '3rem',
        paddingTop: '2.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <p style={{
        fontSize: '0.6rem',
        fontFamily: 'JetBrains Mono, monospace',
        color: 'rgba(255,241,45,0.45)',
        letterSpacing: '0.12em',
        marginBottom: '0.5rem',
      }}>
        {label}
      </p>
      <p style={{
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.38)',
        marginBottom: '1.5rem',
        lineHeight: 1.65,
      }}>
        The following recommendations are derived from the Knowledge Graph — tracing from the engineering
        principles that govern this domain to the technology architectures that implement them.
        Each recommendation includes a full engineering step trace.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {recommendations.map((rec) => (
          <RecommendationPanel key={rec.recommendationId} recommendation={rec} />
        ))}
      </div>

      <EngineeringMemoryPanel entityId={primaryEntityId} />
    </motion.section>
    </ConversionProvider>
  );
}
