'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_STANDARDS } from '@/lib/knowledge-center-data';
import type { KCStandard } from '@/lib/knowledge-center-data/types';

const FAMILY_COLOR: Record<string, string> = {
  ISO: '#FFF12D',
  ASTM: '#5EEAD4',
  SAE: '#FDBA74',
  NAS: '#A78BFA',
};
const FAMILY_ORDER = ['ISO', 'ASTM', 'SAE', 'NAS'];
const DEFAULT_COLOR = '#9CA3AF';

function familyOf(code: string) {
  return code.split(' ')[0];
}

function familyColor(code: string) {
  return FAMILY_COLOR[familyOf(code)] || DEFAULT_COLOR;
}

const GROUPS = (() => {
  const map = new Map<string, KCStandard[]>();
  for (const std of KC_STANDARDS) {
    const fam = familyOf(std.code);
    if (!map.has(fam)) map.set(fam, []);
    map.get(fam)!.push(std);
  }
  const known = FAMILY_ORDER.filter((f) => map.has(f));
  const rest = Array.from(map.keys()).filter((f) => !FAMILY_ORDER.includes(f)).sort();
  return [...known, ...rest].map((family) => ({ family, standards: map.get(family)! }));
})();

const MICRON_SCALE = [
  { label: 'Human hair', value: '~70 µm' },
  { label: 'Visible to the naked eye', value: '~40 µm' },
  { label: 'White blood cell', value: '~25 µm' },
  { label: 'Red blood cell', value: '~8 µm' },
  { label: 'Bacteria', value: '~2 µm' },
];

function MicronScaleGraphic() {
  const max = 70;
  return (
    <div
      aria-label="Reference scale of particle sizes in microns"
      style={{
        position: 'relative',
        minHeight: '330px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.09)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))',
        overflow: 'hidden',
        padding: '1.5rem',
      }}
    >
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.12em', color: '#FFF12D' }}>
        PARTICLE SIZE REFERENCE
      </span>

      <div style={{ marginTop: '1.6rem', display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
        {MICRON_SCALE.map((item) => (
          <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 46px', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
            <div style={{ width: '90px', height: '9px', borderRadius: '5px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.max(8, (parseFloat(item.value.replace('~', '').replace(' µm', '')) / max) * 100)}%`,
                height: '100%',
                borderRadius: '5px',
                background: 'linear-gradient(90deg, rgba(255,241,45,0.35), #FFF12D)',
              }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{item.value}</span>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1.6rem', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.32)' }}>
        Most hydraulic and lubrication wear begins below the threshold of visibility — which is why filtration standards measure capture efficiency at 4, 6, and 14 µm rather than relying on what can be seen.
      </p>
    </div>
  );
}

export default function StandardsHubPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)', gap: 'clamp(2rem, 5vw, 4rem)', alignItems: 'center' }}>
          <div>
            <Link href="/knowledge-center" style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              display: 'inline-block',
              marginBottom: '2rem',
            }}>
              ← KNOWLEDGE CENTER
            </Link>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                lineHeight: 1.15,
                marginBottom: '1.25rem',
              }}
            >
              Industrial Filtration Standards
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '1.15rem',
                lineHeight: 1.75,
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              ISO, ASTM, SAE, and NAS filtration standards explained with test methodology, acceptance criteria, parameter tables, and industrial application context. Standards are not isolated specifications — each entry explains how the standard functions within a contamination control system.
            </motion.p>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.12 }}>
            <MicronScaleGraphic />
          </motion.div>
        </div>
      </section>

      {/* Standards Grid — grouped by issuing body */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        {GROUPS.map((group, groupIdx) => {
          const color = FAMILY_COLOR[group.family] || DEFAULT_COLOR;
          return (
            <div key={group.family} style={{ marginTop: groupIdx === 0 ? 0 : 'clamp(2.5rem, 5vw, 4rem)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.1rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.1em', color, margin: 0 }}>
                  {group.family}
                </h2>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                  {group.standards.length} standard{group.standards.length === 1 ? '' : 's'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {group.standards.map((std, i) => (
                  <motion.div
                    key={std.slug}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                  >
                    <Link href={`/knowledge-center/standards/${std.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <motion.div
                        whileHover={{ background: 'rgba(255,255,255,0.035)', x: 4 }}
                        style={{
                          background: 'rgba(255,255,255,0.015)',
                          borderRadius: '6px',
                          padding: '1.6rem 1.75rem',
                          display: 'grid',
                          gridTemplateColumns: '180px 1fr auto',
                          gap: '2rem',
                          alignItems: 'center',
                          borderLeft: `3px solid ${color}`,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div>
                          <p style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color,
                            marginBottom: '0.2rem',
                          }}>
                            {std.code}
                          </p>
                          <p style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '0.6rem',
                            color: 'rgba(255,255,255,0.3)',
                          }}>
                            {std.year}
                          </p>
                        </div>

                        <div>
                          <p style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            color: '#fff',
                            marginBottom: '0.35rem',
                            lineHeight: 1.25,
                          }}>
                            {std.title.split('—')[0].trim()}
                          </p>
                          <p style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.4)',
                            lineHeight: 1.5,
                          }}>
                            {std.scope}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '200px' }}>
                          {std.relatedTechnologies.map((tech) => (
                            <span key={tech} style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontWeight: 700,
                              fontSize: '0.64rem',
                              color,
                              background: 'rgba(255,255,255,0.07)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '3px',
                              border: `1px solid ${color}40`,
                              whiteSpace: 'nowrap',
                            }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Industrial Filtration Standards — ELIMFILTERS Knowledge Center',
        description: 'ISO, ASTM, SAE, and NAS filtration standards with methodology, acceptance criteria, and industrial application context.',
        url: 'https://elimfilters.com/knowledge-center/standards',
        publisher: {
          '@type': 'Organization',
          '@id': 'https://elimfilters.com/#organization',
          name: 'ELIMFILTERS',
        },
        hasPart: KC_STANDARDS.map((s) => ({
          '@type': 'TechArticle',
          identifier: s.code,
          headline: s.title,
          url: `https://elimfilters.com/knowledge-center/standards/${s.slug}`,
          description: s.metaDescription,
        })),
      })}} />
    </main>
  );
}
