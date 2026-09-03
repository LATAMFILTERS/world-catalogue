'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_TECHNOLOGIES, KCTechnology } from '@/lib/knowledge-center-data';
import { getTechSidebarData } from '@/lib/knowledge-center/navigation-index';
import { TECHNICAL_REVIEWER } from '@/lib/technical-reviewer';

const TECHS = KC_TECHNOLOGIES;

const STD_SLUG_MAP: Record<string, string> = {
  'ISO 16889': 'iso-16889',
  'ISO 5011': 'iso-5011',
  'ISO 4406': 'iso-4406',
  'NAS 1638': 'nas-1638',
  'ISO 29463': 'iso-29463',
  'SAE J1858': 'sae-j1858',
  'ISO 11171': 'iso-11171',
  'ISO 8573-1': 'iso-8573-1',
  'SAE J1539': 'sae-j1539',
  'ISO 12937': 'iso-12937',
  'NFPA T2.14': 'nfpa-t2-14',
  'ISO 11155': 'iso-11155-1',
  'ISO 11155-1': 'iso-11155-1',
  'ASTM D6304': 'astm-d6304',
  'ISO 16332': 'iso-16332',
  'DIN 71460': 'din-71460',
  'DIN 51524': 'din-51524',
};

const SYSTEM_LABELS: Record<string, string> = {
  'air-intake-protection': 'Air Intake Protection',
  'fuel-cleanliness-protection': 'Fuel Cleanliness Protection',
  'lubrication-protection': 'Engine Lubrication Protection',
  'hydraulic-protection': 'Hydraulic System Protection',
  'cooling-system-protection': 'Cooling System Protection',
  'cabin-air-protection': 'Cabin Air Protection',
};

const INDUSTRY_LABELS: Record<string, string> = {
  'mining': 'Mining',
  'construction': 'Construction',
  'agriculture': 'Agriculture',
  'truck-fleets': 'Truck Fleets',
  'marine': 'Marine',
  'oil-gas': 'Oil & Gas',
  'manufacturing': 'Manufacturing',
  'power-generation': 'Power Generation',
  'railway': 'Railway',
  'waste-municipal': 'Waste & Municipal',
};

export default function TechContent({ tech }: { tech: KCTechnology }) {
  const relatedTechs = TECHS.filter(
    (t) => t.slug !== tech.slug && tech.worksWith.some((w) => w === t.name)
  );
  const { referencingArticles } = getTechSidebarData(tech.slug);

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0.875rem clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <Link href="/knowledge-center/technologies" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Technologies</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{tech.name}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #080808 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#FFF12D',
              marginBottom: '1.25rem',
              textTransform: 'uppercase',
            }}
          >
            {tech.domain}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: 1.1,
              textAlign: 'justify',
              marginBottom: '0.75rem',
              color: '#FFF12D',
              letterSpacing: '0.01em',
            }}
          >
            {tech.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1.5rem',
            }}
          >
            {tech.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.8,
              textAlign: 'justify',
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '660px',
            }}
          >
            {tech.engineeringPrinciple}
          </motion.p>
        </div>
      </section>

      {/* Two-column: content + sidebar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '3rem',
        alignItems: 'start',
      }}>

        {/* Main content */}
        <div>
          {/* Performance Specs */}
          {tech.performanceSpecs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1px',
                background: 'rgba(255,241,45,0.08)',
                border: '1px solid rgba(255,241,45,0.15)',
                marginBottom: '3rem',
              }}
            >
              {tech.performanceSpecs.map((spec) => (
                <div key={spec.label} style={{ background: '#000', padding: '1.25rem 1.5rem' }}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                    color: '#FFF12D',
                    marginBottom: '0.3rem',
                    lineHeight: 1.1,
                    textAlign: 'justify',
                  }}>
                    {spec.value}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, textAlign: 'justify' }}>
                    {spec.label}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Contamination Modes */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: 'rgba(255,241,45,0.6)',
              marginBottom: '0.6rem',
            }}>
              01 /
            </p>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '1.3rem',
              color: '#fff',
              marginBottom: '1rem',
            }}>
              Contamination Modes Controlled
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tech.contamination.map((c, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', marginTop: '0.1rem', flexShrink: 0 }}>→</span>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, textAlign: 'justify' }}>{c}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>02 /</p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>Application Selection</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.66)', textAlign: 'justify', marginBottom: '1.25rem' }}>{tech.selectionGuidance}</p>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>Evidence Boundary</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.66)', textAlign: 'justify' }}>{tech.evidenceBoundary}</p>
          </motion.section>

          <section aria-label="Technical review" style={{ marginBottom: '3rem', padding: '1.1rem 1.25rem', border: '1px solid rgba(255,241,45,0.16)', background: 'rgba(255,241,45,0.025)' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: '#FFF12D', marginBottom: '0.5rem' }}>TECHNICAL REVIEW &amp; PUBLISHING GOVERNANCE</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.62)', margin: 0 }}>Reviewed by <Link href="/about/leadership/" style={{ color: '#FFF12D' }}>Víctor Abreu</Link>, Founder &amp; CEO of ELIMFILTERS. Product-level ratings and application decisions remain subject to verified technical evidence.</p>
          </section>

          {/* Protected Systems */}
          {tech.relatedSystems.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ marginBottom: '3rem' }}
            >
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,241,45,0.6)',
                marginBottom: '0.6rem',
              }}>
                02 /
              </p>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '1.3rem',
                color: '#fff',
                marginBottom: '1rem',
              }}>
                Protection Systems
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {tech.relatedSystems.map((sys) => (
                  <Link key={sys} href={`/knowledge-center/systems/${sys}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1rem 1.25rem', transition: 'border-color 0.2s' }}
                    >
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '0.2rem' }}>
                        {SYSTEM_LABELS[sys] || sys}
                      </p>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#FFF12D' }}>VIEW SYSTEM →</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Industry Applications */}
          {tech.relatedIndustries.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{ marginBottom: '3rem' }}
            >
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,241,45,0.6)',
                marginBottom: '0.6rem',
              }}>
                03 /
              </p>
              <h2 style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '1.3rem',
                color: '#fff',
                marginBottom: '1rem',
              }}>
                Industry Applications
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {tech.relatedIndustries.map((ind) => (
                  <Link key={ind} href={`/knowledge-center/industries/${ind}`} style={{ textDecoration: 'none' }}>
                    <motion.span
                      whileHover={{ background: 'rgba(255,241,45,0.1)', borderColor: 'rgba(255,241,45,0.3)', color: '#FFF12D' }}
                      style={{
                        display: 'inline-block',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.6)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '0.35rem 0.75rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      {INDUSTRY_LABELS[ind] || ind}
                    </motion.span>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Works With */}
          {relatedTechs.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.25rem',
              }}>
                COMPLEMENTARY TECHNOLOGIES
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {relatedTechs.map((t) => (
                  <Link key={t.slug} href={`/knowledge-center/technologies/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.1rem', transition: 'border-color 0.2s' }}
                    >
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#FFF12D', marginBottom: '0.25rem' }}>{t.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t.domain}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {tech.standards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                GOVERNING STANDARDS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {tech.standards.map((std) => {
                  const href = STD_SLUG_MAP[std] ? `/knowledge-center/standards/${STD_SLUG_MAP[std]}` : null;
                  return href ? (
                    <Link key={std} href={href} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ background: 'rgba(255,241,45,0.06)' }}
                        style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, color: '#FFF12D', transition: 'background 0.2s' }}
                      >
                        {std}
                      </motion.div>
                    </Link>
                  ) : (
                    <div key={std} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,241,45,0.7)' }}>
                      {std}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
              ALL TECHNOLOGIES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {KC_TECHNOLOGIES.map((t) => (
                <Link key={t.slug} href={`/knowledge-center/technologies/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.75rem',
                      color: t.slug === tech.slug ? '#FFF12D' : 'rgba(255,255,255,0.45)',
                      fontWeight: t.slug === tech.slug ? 700 : 400,
                      borderLeft: t.slug === tech.slug ? '2px solid #FFF12D' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.name}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {referencingArticles.length > 0 && (
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                REFERENCING ARTICLES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {referencingArticles.slice(0, 6).map((a) => (
                  <Link key={a.permanentId} href={`/knowledge-center/engineering/${a.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.65)' }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.73rem',
                        color: 'rgba(255,255,255,0.4)',
                        lineHeight: 1.4,
                        borderLeft: '2px solid transparent',
                        transition: 'all 0.15s',
                      }}
                    >
                      {a.title}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: `${tech.name} — ${tech.domain}`,
        description: tech.tagline,
        url: `https://elimfilters.com/knowledge-center/technologies/${tech.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        reviewedBy: TECHNICAL_REVIEWER,
        keywords: [tech.domain, ...tech.standards, ...tech.contamination.slice(0, 3)].join(', '),
        about: {
          '@type': 'Thing',
          name: tech.name,
          description: tech.engineeringPrinciple,
        },
      })}} />
    </main>
  );
}
