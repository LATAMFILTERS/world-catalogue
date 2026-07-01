'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  findById,
  recommendFromPrinciple,
  citeEntity,
  getEntityProvenance,
  getMemoryFor,
  formatCitation,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { EngineeringPrincipleCard } from '@/components/engineering/EngineeringPrincipleCard';
import { RecommendationPanel } from '@/components/engineering/RecommendationPanel';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

function PrincipleExplorerContent({ entityId }: { entityId: string }) {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [citationFormatted, setCitationFormatted] = useState('');

  useEffect(() => {
    const r = recommendFromPrinciple(entityId);
    setRecs(r);
    const cit = citeEntity(entityId, `Engineering principle: ${entityId}`);
    setCitationFormatted(formatCitation(cit));
  }, [entityId]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);
  const memories = getMemoryFor(entityId);

  const technologies = recs.filter((r) => r.targetEntityType === 'TECHNOLOGY_ARCHITECTURE');
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

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: '#7dd3fc', letterSpacing: '0.12em', marginBottom: '1rem',
            }}>
              ENGINEERING PRINCIPLE · {entityId}
            </p>
            <EngineeringPrincipleCard entityId={entityId} showTechnologies={false} />
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {technologies.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>01 / TECHNOLOGIES THAT IMPLEMENT THIS PRINCIPLE</p>
            <p style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: '#7dd3fc', marginBottom: '0.75rem' }}>
              IMPLEMENTED BY
            </p>
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
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>02 / APPLICABLE STANDARDS</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {standards.map((r) => (
                <Link key={r.recommendationId} href={`/engineering/standards/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {memories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>03 / FIELD ENGINEERING MEMORY</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {memories.map((m) => {
                const mp = m.properties as Record<string, unknown>;
                return (
                  <div key={m.entityId} style={{
                    padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px',
                    fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65,
                  }}>
                    {!!mp['memoryContent'] && <span>{String(mp['memoryContent'])}</span>}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {provenance && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>04 / GOVERNANCE</p>
            <ProvenancePanel entityId={entityId} />
          </motion.section>
        )}

        {citationFormatted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{
              marginBottom: '3rem', padding: '1rem 1.25rem',
              background: 'rgba(125,211,252,0.03)', border: '1px solid rgba(125,211,252,0.1)',
              borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(125,211,252,0.7)', textDecoration: 'none',
              border: '1px solid rgba(125,211,252,0.2)', padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function PrincipleExplorerClient({ entityId }: { entityId: string }) {
  return (
    <ConversionProvider>
      <PrincipleExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
