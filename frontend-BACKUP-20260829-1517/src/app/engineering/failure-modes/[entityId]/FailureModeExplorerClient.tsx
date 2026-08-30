'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  findById,
  recommendFromFailureMode,
  citeEntity,
  getEntityProvenance,
  formatCitation,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { FailureModeCard } from '@/components/engineering/FailureModeCard';
import { RecommendationPanel } from '@/components/engineering/RecommendationPanel';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

function FailureModeExplorerContent({ entityId }: { entityId: string }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [citationFormatted, setCitationFormatted] = useState('');

  useEffect(() => {
    const r = recommendFromFailureMode(entityId);
    setRecs(r);
    const cit = citeEntity(entityId, `Failure mode analysis: ${entityId}`);
    setCitationFormatted(formatCitation(cit));
  }, [entityId]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);
  const p = node?.properties as Record<string, unknown> | undefined;

  const technologies = recs.filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE');
  const contaminations = recs.filter((r) => r.targetEntityType === 'CONTAMINATION');
  const standards = recs.filter((r) => r.targetEntityType === 'STANDARD');

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '920px', margin: '0 auto' }}>
        <Link href="/search" style={{
          fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
          color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
        }}>
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem', borderBottom: '1px solid rgba(252,165,165,0.08)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: '#fca5a5', letterSpacing: '0.12em', marginBottom: '1rem',
            }}>
              FAILURE MODE · {entityId}
            </p>
            <FailureModeCard entityId={entityId} expanded />
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Cause chain + impact — surface key properties if not already in the card */}
        {(!!p?.['measurableConsequence'] || !!p?.['industrialImpact']) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1.5rem',
            }}>01 / QUANTIFIED OPERATIONAL IMPACT</p>

            {!!p?.['measurableConsequence'] && (
              <div style={{
                padding: '1rem 1.25rem', marginBottom: '1rem',
                background: 'rgba(252,165,165,0.04)', border: '1px solid rgba(252,165,165,0.15)',
                borderRadius: '6px',
              }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', marginBottom: '0.5rem' }}>
                  MEASURABLE CONSEQUENCE
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, textAlign: 'justify' }}>
                  {String(p['measurableConsequence'])}
                </p>
              </div>
            )}

            {!!p?.['industrialImpact'] && (
              <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(253,186,116,0.04)', border: '1px solid rgba(253,186,116,0.15)',
                borderRadius: '6px',
              }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#fdba74', marginBottom: '0.5rem' }}>
                  INDUSTRIAL IMPACT
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, margin: 0, textAlign: 'justify' }}>
                  {String(p['industrialImpact'])}
                </p>
              </div>
            )}
          </motion.section>
        )}

        {technologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>02 / PREVENTION TECHNOLOGIES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {technologies.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/technologies/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} showFullTrace />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {contaminations.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>03 / RELATED CONTAMINATION SOURCES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {contaminations.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/contamination/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {standards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>04 / APPLICABLE STANDARDS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {standards.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/standards/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {provenance && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>05 / GOVERNANCE</p>
            <ProvenancePanel entityId={entityId} />
          </motion.section>
        )}

        {citationFormatted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.26 }}
            style={{
              marginBottom: '3rem', padding: '1rem 1.25rem',
              background: 'rgba(252,165,165,0.03)', border: '1px solid rgba(252,165,165,0.1)',
              borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(252,165,165,0.7)', textDecoration: 'none',
              border: '1px solid rgba(252,165,165,0.2)', padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function FailureModeExplorerClient({ entityId }: { entityId: string }) {
  return (
    <ConversionProvider>
      <FailureModeExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
