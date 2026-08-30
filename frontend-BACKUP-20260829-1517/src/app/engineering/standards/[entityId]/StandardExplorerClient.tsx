'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  findById,
  citeEntity,
  getEntityProvenance,
  recommendFromTechnology,
  formatCitation,
  listEntitiesWithProvenance,
} from '@/lib/services';
import { ConversionProvider } from '@/components/conversion/ConversionContext';
import { StandardCard } from '@/components/engineering/StandardCard';
import { RecommendationPanel } from '@/components/engineering/RecommendationPanel';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

function StandardExplorerContent({ entityId }: { entityId: string }) {
  const [citationFormatted, setCitationFormatted] = useState('');
  const [relatedTechRecs, setRelatedTechRecs] = useState<Recommendation[]>([]);

  useEffect(() => {
    const cit = citeEntity(entityId, `Standard reference: ${entityId}`);
    setCitationFormatted(formatCitation(cit));

    // Find technologies that reference this standard via their recommendations
    const techs = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(({ node }) => node);
    const found: Recommendation[] = [];
    const seen = new Set<string>();
    techs.forEach((t) => {
      const recs = recommendFromTechnology(t.entityId);
      recs.forEach((r) => {
        if (r.targetEntityId === entityId && !seen.has(t.entityId)) {
          seen.add(t.entityId);
          // Build a synthetic rec pointing to the technology
          found.push({
            ...r,
            targetEntityId: t.entityId,
            targetLabel: t.label,
            targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
          });
        }
      });
    });
    setRelatedTechRecs(found);
  }, [entityId]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);
  const p = node?.properties as Record<string, unknown> | undefined;

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

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem', borderBottom: '1px solid rgba(196,181,253,0.08)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <p style={{
              fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace',
              color: '#c4b5fd', letterSpacing: '0.12em', marginBottom: '1rem',
            }}>
              INDUSTRIAL STANDARD · {entityId}
            </p>
            <StandardCard entityId={entityId} />
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Scope detail */}
        {!!p?.['scope'] && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>01 / FULL SCOPE</p>
            <div style={{
              padding: '1.25rem', background: 'rgba(196,181,253,0.03)',
              border: '1px solid rgba(196,181,253,0.1)', borderRadius: '6px',
            }}>
              <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, margin: 0, textAlign: 'justify' }}>
                {String(p['scope'])}
              </p>
            </div>
          </motion.section>
        )}

        {/* Technologies validated by this standard */}
        {relatedTechRecs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>02 / TECHNOLOGIES VALIDATED BY THIS STANDARD</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {relatedTechRecs.map((r) => (
                <Link key={r.recommendationId + r.targetEntityId} href={`/engineering/technologies/${r.targetEntityId}`} style={{ textDecoration: 'none' }}>
                  <RecommendationPanel recommendation={r} />
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {provenance && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>03 / GOVERNANCE</p>
            <ProvenancePanel entityId={entityId} />
          </motion.section>
        )}

        {citationFormatted && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            style={{
              marginBottom: '3rem', padding: '1rem 1.25rem',
              background: 'rgba(196,181,253,0.03)', border: '1px solid rgba(196,181,253,0.1)',
              borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(196,181,253,0.7)', textDecoration: 'none',
              border: '1px solid rgba(196,181,253,0.2)', padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

export function StandardExplorerClient({ entityId }: { entityId: string }) {
  return (
    <ConversionProvider>
      <StandardExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
