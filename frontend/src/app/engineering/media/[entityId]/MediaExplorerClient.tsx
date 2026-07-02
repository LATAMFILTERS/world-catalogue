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
import { ConversionProvider, useConversion } from '@/components/conversion/ConversionContext';
import { ProvenancePanel } from '@/components/engineering/ProvenancePanel';
import { CTACard } from '@/components/conversion/CTACard';
import type { Recommendation } from '@/lib/services';

const MEDIA_FUNCTION_COLORS: Record<string, string> = {
  DEPTH_FILTRATION: '#FFF12D',
  SURFACE_FILTRATION: '#86efac',
  COALESCING: '#7dd3fc',
  ADSORPTION: '#c4b5fd',
  DESICCANT: '#fdba74',
  STRUCTURAL: 'rgba(255,255,255,0.4)',
};

function MediaExplorerContent({ entityId }: { entityId: string }) {
  const [citationFormatted, setCitationFormatted] = useState('');
  const [deployedByRecs, setDeployedByRecs] = useState<Recommendation[]>([]);
  const { dispatchTrustSignal, engageEntity } = useConversion();

  useEffect(() => {
    engageEntity(entityId);
    dispatchTrustSignal('T-3');
    const cit = citeEntity(entityId, `Protection media specification: ${entityId}`);
    setCitationFormatted(formatCitation(cit));

    // Find technologies that deploy this media
    const techs = listEntitiesWithProvenance('TECHNOLOGY_ARCHITECTURE').map(({ node }) => node);
    const found: Recommendation[] = [];
    const seen = new Set<string>();
    techs.forEach((t) => {
      const recs = recommendFromTechnology(t.entityId);
      recs.forEach((r) => {
        if (r.targetEntityId === entityId && !seen.has(t.entityId)) {
          seen.add(t.entityId);
          found.push({
            ...r,
            targetEntityId: t.entityId,
            targetLabel: t.label,
            targetEntityType: 'TECHNOLOGY_ARCHITECTURE',
          });
        }
      });
    });
    setDeployedByRecs(found);
  }, [entityId, dispatchTrustSignal, engageEntity]);

  const node = findById(entityId);
  const provenance = getEntityProvenance(entityId);
  const p = node?.properties as Record<string, unknown> | undefined;

  const mediaFunction = typeof p?.['mediaFunction'] === 'string' ? p['mediaFunction'] : '';
  const accentColor = MEDIA_FUNCTION_COLORS[mediaFunction] ?? '#86efac';
  const compatibleFluids = Array.isArray(p?.['compatibleFluidTypes']) ? (p['compatibleFluidTypes'] as string[]) : [];

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

      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 2rem 2.5rem', borderBottom: `1px solid ${accentColor}18` }}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '3px',
                background: accentColor + '15', color: accentColor,
                fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
              }}>
                PROTECTION MEDIA
              </span>
              {mediaFunction && (
                <span style={{
                  fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {mediaFunction.replace(/_/g, ' ')}
                </span>
              )}
              <span style={{
                fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {entityId}
              </span>
            </div>

            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              color: '#fff', fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              margin: '0 0 1rem',
            }}>
              {node?.label}
            </h1>

            {!!p?.['definition'] && (
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: 1.75, margin: 0, textAlign: 'justify' }}>
                {String(p['definition'])}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '3rem 2rem' }}>

        {/* Technical specs */}
        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1.25rem',
          }}>01 / TECHNICAL SPECIFICATIONS</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            {!!p?.['baseConstruction'] && (
              <SpecCard label="BASE CONSTRUCTION" value={String(p['baseConstruction'])} color={accentColor} />
            )}
            {!!p?.['micronRatingRange'] && (
              <SpecCard label="MICRON RATING RANGE" value={String(p['micronRatingRange'])} color={accentColor} />
            )}
            {!!p?.['operatingTempRange'] && (
              <SpecCard label="OPERATING TEMP RANGE" value={String(p['operatingTempRange'])} color={accentColor} />
            )}
            {!!p?.['efficiency'] && (
              <SpecCard label="EFFICIENCY" value={String(p['efficiency'])} color={accentColor} />
            )}
          </div>
        </motion.section>

        {/* Compatible fluids */}
        {compatibleFluids.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>02 / COMPATIBLE FLUID TYPES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {compatibleFluids.map((f, i) => (
                <span key={i} style={{
                  fontSize: '0.75rem', padding: '0.25rem 0.65rem', borderRadius: '3px',
                  background: accentColor + '10', color: accentColor,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {f}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Technologies that deploy this media */}
        {deployedByRecs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace',
              color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: '1rem',
            }}>03 / DEPLOYED BY TECHNOLOGIES</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {deployedByRecs.map((r) => (
                <Link
                  key={r.targetEntityId}
                  href={`/engineering/technologies/${r.targetEntityId}`}
                  style={{
                    display: 'inline-block', fontSize: '0.8rem',
                    padding: '0.4rem 0.9rem', borderRadius: '4px',
                    background: 'rgba(255,241,45,0.06)', color: '#FFF12D',
                    fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none',
                    border: '1px solid rgba(255,241,45,0.15)',
                  }}
                >
                  {r.targetLabel}
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {provenance && (
          <motion.section
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}
            style={{
              marginBottom: '3rem', padding: '1rem 1.25rem',
              background: accentColor + '08', border: `1px solid ${accentColor}18`,
              borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: '0.5rem' }}>CITATION</span>
            {citationFormatted}
          </motion.div>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          style={{ marginBottom: '3rem' }}
        >
          <CTACard onLeadCapture={() => {}} />
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          <Link
            href={`/search?q=${encodeURIComponent(node?.label ?? entityId)}`}
            style={{
              display: 'inline-block', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace',
              color: accentColor + 'b3', textDecoration: 'none',
              border: `1px solid ${accentColor}30`, padding: '0.5rem 1rem', borderRadius: '4px',
            }}
          >
            Search: {node?.label ?? entityId} →
          </Link>
        </div>
      </div>
    </main>
  );
}

function SpecCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: '0.75rem 1rem', background: color + '06',
      border: `1px solid ${color}15`, borderRadius: '6px', flex: '1 1 200px',
    }}>
      <p style={{ fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace', color: color, marginBottom: '0.35rem', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', margin: 0 }}>{value}</p>
    </div>
  );
}

export function MediaExplorerClient({ entityId }: { entityId: string }) {
  return (
    <ConversionProvider>
      <MediaExplorerContent entityId={entityId} />
    </ConversionProvider>
  );
}
