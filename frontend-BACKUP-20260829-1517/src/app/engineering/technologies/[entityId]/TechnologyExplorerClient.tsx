'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  findById,
  recommendFromTechnology,
  citeEntity,
  getEntityProvenance,
  getMemoryFor,
  formatCitation,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { TechnologyCard } from '@/components/engineering/TechnologyCard';
import { RecommendationPanel } from '@/components/engineering/RecommendationPanel';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

interface Props {
  entityId: string;
  label: string;
}

function TechnologyExplorerContent({ entityId }: { entityId: string }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [citationFormatted, setCitationFormatted] = useState('');
  const [memoryCount, setMemoryCount] = useState(0);

  useEffect(() => {
    const r = recommendFromTechnology(entityId);
    setRecs(r);
    const cit = citeEntity(entityId, `Technology architecture: ${entityId}`);
    setCitationFormatted(formatCitation(cit));
    const mem = getMemoryFor(entityId);
    setMemoryCount(mem.length);
  }, [entityId]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);

  const principles = recs.filter((r) => r.targetEntityType === 'ENGINEERING_PRINCIPLE');
  const standards = recs.filter((r) => r.targetEntityType === 'STANDARD');
  const failureModes = recs.filter((r) => r.targetEntityType === 'FAILURE_MODE');
  const media = recs.filter((r) => r.targetEntityType === 'PROTECTION_MEDIA');

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back navigation */}
      <div style={{ padding: '1.5rem 2rem 0', maxWidth: '920px', margin: '0 auto' }}>
        <Link
          href="/search"
          style={{
            fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.08em',
          }}
        >
          ← ENGINEERING INTELLIGENCE
        </Link>
      </div>

      {/* Hero */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
      }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: '#FFF12D', letterSpacing: '0.12em', marginBottom: '1rem',
            }}>
              TECHNOLOGY ARCHITECTURE · {entityId}
            </p>
            <TechnologyCard entityId={entityId} mode="full" />
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Engineering Connections */}
        {recs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1.5rem',
            }}>
              01 / ENGINEERING CONNECTIONS
            </p>

            {principles.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', marginBottom: '0.75rem' }}>
                  IMPLEMENTS ENGINEERING PRINCIPLE
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {principles.map((r) => (
                    <RecommendationPanel key={r.recommendationId} recommendation={r} showFullTrace />
                  ))}
                </div>
              </div>
            )}

            {standards.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#c4b5fd', marginBottom: '0.75rem' }}>
                  VALIDATED BY STANDARD
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {standards.map((r) => (
                    <RecommendationPanel key={r.recommendationId} recommendation={r} showFullTrace />
                  ))}
                </div>
              </div>
            )}

            {failureModes.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#fca5a5', marginBottom: '0.75rem' }}>
                  PREVENTS FAILURE MODE
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {failureModes.map((r) => (
                    <Link
                      key={r.recommendationId}
                      href={`/engineering/failure-modes/${r.targetEntityId}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <RecommendationPanel recommendation={r} showFullTrace />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {media.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#86efac', marginBottom: '0.75rem' }}>
                  USES PROTECTION MEDIA
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {media.map((r) => (
                    <Link
                      key={r.recommendationId}
                      href={`/engineering/media/${r.targetEntityId}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <RecommendationPanel recommendation={r} />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Provenance */}
        {provenance && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>
              02 / GOVERNANCE & PROVENANCE
            </p>
            <ProvenancePanel entityId={entityId} />
          </motion.section>
        )}

        {/* Citation */}
        {citationFormatted && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{
              marginBottom: '3rem',
              padding: '1rem 1.25rem',
              background: 'rgba(255,241,45,0.03)',
              border: '1px solid rgba(255,241,45,0.1)',
              borderRadius: '6px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
            {memoryCount > 0 && (
              <span style={{ marginLeft: '1rem', color: 'rgba(255,241,45,0.4)' }}>
                · {memoryCount} field engineering {memoryCount === 1 ? 'record' : 'records'}
              </span>
            )}
          </motion.section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        {/* Related search */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', color: 'rgba(255,255,255,0.25)', marginBottom: '0.75rem' }}>
            EXPLORE IN ENGINEERING SEARCH
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block',
              fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,241,45,0.7)', textDecoration: 'none',
              border: '1px solid rgba(255,241,45,0.2)',
              padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function TechnologyExplorerClient({ entityId, label: _label }: Props) {
  return (
    <ConversionProvider>
      <TechnologyExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
