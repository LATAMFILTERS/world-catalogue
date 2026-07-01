'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  findById,
  recommendFromContamination,
  citeEntity,
  getEntityProvenance,
  formatCitation,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { ContaminationCard } from '@/components/engineering/ContaminationCard';
import { RecommendationPanel } from '@/components/engineering/RecommendationPanel';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

function ContaminationExplorerContent({ entityId }: { entityId: string }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [citationFormatted, setCitationFormatted] = useState('');

  useEffect(() => {
    const r = recommendFromContamination(entityId);
    setRecs(r);
    const cit = citeEntity(entityId, `Contamination analysis: ${entityId}`);
    setCitationFormatted(formatCitation(cit));
  }, [entityId]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);
  const p = node?.properties as Record<string, unknown> | undefined;

  const failureModes = recs.filter((r) => r.targetEntityType === 'FAILURE_MODE');
  const technologies = recs.filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE');
  const standards = recs.filter((r) => r.targetEntityType === 'STANDARD');

  const sources = Array.isArray(p?.['sources']) ? (p['sources'] as string[]) : [];

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

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem', borderBottom: '1px solid rgba(253,186,116,0.08)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: '#fdba74', letterSpacing: '0.12em', marginBottom: '1rem',
            }}>
              CONTAMINATION ANALYSIS · {entityId}
            </p>
            <ContaminationCard entityId={entityId} showFailureModes={false} />
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Physical characteristics */}
        {(!!p?.['particleSizeRange'] || !!p?.['phaseState']) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1.5rem',
            }}>01 / PHYSICAL CHARACTERISTICS</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {!!p?.['phaseState'] && (
                <div style={{
                  padding: '0.75rem 1.1rem', background: 'rgba(253,186,116,0.05)',
                  border: '1px solid rgba(253,186,116,0.12)', borderRadius: '6px', flex: '1 1 220px',
                }}>
                  <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#fdba74', marginBottom: '0.35rem' }}>PHASE STATE</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{String(p['phaseState'])}</p>
                </div>
              )}
              {!!p?.['particleSizeRange'] && (
                <div style={{
                  padding: '0.75rem 1.1rem', background: 'rgba(253,186,116,0.05)',
                  border: '1px solid rgba(253,186,116,0.12)', borderRadius: '6px', flex: '1 1 220px',
                }}>
                  <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#fdba74', marginBottom: '0.35rem' }}>PARTICLE SIZE RANGE</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{String(p['particleSizeRange'])}</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* Sources */}
        {sources.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>02 / CONTAMINATION SOURCES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {sources.map((src, i) => (
                <div key={i} style={{
                  padding: '0.6rem 0.85rem', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px',
                  fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)',
                  borderLeft: '2px solid rgba(253,186,116,0.25)',
                }}>
                  {src}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {failureModes.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>03 / FAILURE MODES INITIATED</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {failureModes.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/failure-modes/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} showFullTrace />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {technologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>04 / CONTROL TECHNOLOGIES</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {technologies.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/technologies/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} showFullTrace />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {standards.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>05 / DETECTION STANDARDS</p>
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
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>06 / GOVERNANCE</p>
            <ProvenancePanel entityId={entityId} />
          </motion.section>
        )}

        {citationFormatted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
            style={{
              marginBottom: '3rem', padding: '1rem 1.25rem',
              background: 'rgba(253,186,116,0.03)', border: '1px solid rgba(253,186,116,0.1)',
              borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(253,186,116,0.7)', textDecoration: 'none',
              border: '1px solid rgba(253,186,116,0.2)', padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function ContaminationExplorerClient({ entityId }: { entityId: string }) {
  return (
    <ConversionProvider>
      <ContaminationExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
