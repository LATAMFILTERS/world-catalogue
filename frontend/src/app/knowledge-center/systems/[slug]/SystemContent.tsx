'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_SYSTEMS, KC_SYSTEM_DETAILS, KC_TECHNOLOGIES, KCSystemDetail } from '@/lib/knowledge-center-data';

type KCSystem = typeof KC_SYSTEMS[number];

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
  'DIN 71220': 'din-71220',
  'DIN 51524': 'din-51524',
};

export default function SystemContent({ system, detail }: { system: KCSystem; detail: KCSystemDetail | null }) {
  const relatedTechs = KC_TECHNOLOGIES.filter((t) =>
    t.relatedSystems.includes(system.slug)
  );

  const otherSystems = KC_SYSTEMS.filter((s) => s.slug !== system.slug);

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
          <Link href="/knowledge-center/systems" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Systems</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{system.title}</span>
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
              fontSize: '2rem',
              marginBottom: '1rem',
              lineHeight: 1,
            }}
          >
            {system.icon}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              lineHeight: 1.12,
              marginBottom: '0.75rem',
            }}
          >
            {system.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.55)',
              marginBottom: '1.5rem',
              textAlign: 'justify',
              maxWidth: '640px',
              lineHeight: 1.7,
            }}
          >
            {system.description}
          </motion.p>

          {detail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.18 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '1rem 1.25rem',
                maxWidth: '640px',
              }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>
                FAILURE MECHANISM
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                {detail.failureMechanism}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Two-column content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 280px',
        gap: '3rem',
        alignItems: 'start',
      }}>

        {/* Main */}
        <div>
          {detail && detail.keyMetrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1px',
                background: 'rgba(255,241,45,0.08)',
                border: '1px solid rgba(255,241,45,0.15)',
                marginBottom: '3rem',
              }}
            >
              {detail.keyMetrics.map((m) => (
                <div key={m.label} style={{ background: '#000', padding: '1.25rem 1.5rem' }}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                    color: '#FFF12D',
                    marginBottom: '0.25rem',
                    lineHeight: 1,
                  }}>
                    {m.value}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {detail && (
            <>
              {detail.contaminationTarget && (
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>
                    01 /
                  </p>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '0.75rem' }}>
                    Contamination Target
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', textAlign: 'justify' }}>
                    {detail.contaminationTarget}
                  </p>
                  {detail.targetCleanliness && (
                    <div style={{ marginTop: '1rem', padding: '0.875rem 1.25rem', background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.12)' }}>
                      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.35rem' }}>TARGET CLEANLINESS</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>{detail.targetCleanliness}</p>
                    </div>
                  )}
                </motion.section>
              )}

              {detail.sections.map((section, i) => (
                <motion.section
                  key={section.heading}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
                  style={{ marginBottom: '2.5rem' }}
                >
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>
                    {String(i + 2).padStart(2, '0')} /
                  </p>
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>
                    {section.heading}
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', textAlign: 'justify' }}>
                    {section.body}
                  </p>
                  {section.callout && section.callout.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '1px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      marginTop: '1.5rem',
                    }}>
                      {section.callout.map((item) => (
                        <div key={item.label} style={{ background: '#000', padding: '1rem 1.25rem', flex: 1 }}>
                          <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: '#FFF12D', lineHeight: 1, marginBottom: '0.2rem' }}>
                            {item.value}
                          </p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              ))}
            </>
          )}

          {!detail && (
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
                PENDING ENGINEERING DOCUMENTATION
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                Detailed system documentation is being developed. Contact ELIMFILTERS for engineering consultation.
              </p>
            </div>
          )}

          {/* Related Technologies */}
          {relatedTechs.length > 0 && (
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem', marginTop: '1rem' }}>
              <p style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.25rem',
              }}>
                ELIMFILTERS TECHNOLOGIES FOR THIS SYSTEM
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {relatedTechs.map((t) => (
                  <Link key={t.slug} href={`/knowledge-center/technologies/${t.slug}`} style={{ textDecoration: 'none' }}>
                    <motion.div
                      whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                      style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.1rem', transition: 'border-color 0.2s' }}
                    >
                      <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#FFF12D', marginBottom: '0.25rem' }}>{t.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t.tagline}</p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {system.standards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELEVANT STANDARDS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {system.standards.map((std) => {
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

          {system.technologies.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                TECHNOLOGIES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {system.technologies.map((tech) => (
                  <div key={tech} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
              OTHER SYSTEMS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {otherSystems.map((s) => (
                <Link key={s.slug} href={`/knowledge-center/systems/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    style={{ padding: '0.5rem 0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{s.icon}</span>
                    {s.title}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: `${system.title} — ELIMFILTERS Protection System`,
        description: system.description,
        url: `https://elimfilters.com/knowledge-center/systems/${system.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        keywords: [...system.technologies, ...system.standards, ...system.challenges.slice(0, 3)].join(', '),
        about: { '@type': 'Thing', name: system.title, description: system.description },
      })}} />
    </main>
  );
}
