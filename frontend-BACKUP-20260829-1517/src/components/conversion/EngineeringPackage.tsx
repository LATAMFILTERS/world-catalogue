'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { buildAIContextBatch, citeEntity } from '@/lib/services';
import { useConversion } from './ConversionContext';

interface EngineeringPackageProps {
  leadType: string;
}

export function EngineeringPackage({ leadType }: EngineeringPackageProps) {
  const { state } = useConversion();
  const { entitiesEngaged, journeySelections, currentTrustLevel, recommendationsReceived } = state;

  const context = useMemo(() => {
    if (entitiesEngaged.length === 0) return null;
    return buildAIContextBatch(entitiesEngaged);
  }, [entitiesEngaged]);

  const citations = useMemo(() => {
    return entitiesEngaged
      .map(id => { try { return citeEntity(id, 'Engineering package reference'); } catch { return null; } })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .slice(0, 6);
  }, [entitiesEngaged]);

  if (!context && recommendationsReceived.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255,241,45,0.03)',
        border: '2px solid rgba(255,241,45,0.2)',
        borderRadius: '10px', padding: '2rem', marginTop: '1.5rem',
      }}
    >
      <div style={{
        fontSize: '0.65rem', color: '#FFF12D',
        fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem',
      }}>
        ENGINEERING PACKAGE — {leadType}
      </div>
      <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#fff', margin: '0 0 1.25rem', fontSize: '1.1rem' }}>
        Your Engineering Summary
      </h3>

      {/* Session context */}
      {journeySelections.industryId && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.35rem' }}>
            ASSET CONTEXT
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            Industry: <strong style={{ color: '#fff' }}>{journeySelections.industryId}</strong>
            {journeySelections.assetType && <> · Asset: <strong style={{ color: '#fff' }}>{journeySelections.assetType}</strong></>}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendationsReceived.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
            RECOMMENDED PROTECTION TECHNOLOGIES ({recommendationsReceived.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {recommendationsReceived.map(rec => (
              <div key={rec.recommendationId} style={{
                padding: '0.6rem 0.85rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '4px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span style={{ color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>
                    {rec.targetEntityId}
                  </span>
                  {rec.explanation && (
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                      — {rec.explanation.slice(0, 60)}…
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '3px',
                  background: rec.confidence === 'HIGH' ? 'rgba(134,239,172,0.1)' : 'rgba(255,255,255,0.06)',
                  color: rec.confidence === 'HIGH' ? '#86efac' : 'rgba(255,255,255,0.3)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {rec.confidence}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engineering entities cited */}
      {citations.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '0.5rem' }}>
            KNOWLEDGE REFERENCES ({citations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {citations.map((cit, i) => (
              <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                [{i + 1}] {cit.sourceEntityId} · {cit.sourceEntityType} · {cit.sourceNodeId}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust level indicator */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '1rem', marginTop: '1rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
          ENGINEERING TRUST LEVEL {currentTrustLevel}/7
        </div>
        <div style={{ display: 'flex', gap: '0.3rem' }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{
              width: '18px', height: '4px', borderRadius: '2px',
              background: i < currentTrustLevel ? '#FFF12D' : 'rgba(255,255,255,0.1)',
            }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
