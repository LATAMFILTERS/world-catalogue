'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_INDUSTRIES, KC_INDUSTRY_DETAILS, KC_TECHNOLOGIES, KCIndustryDetail } from '@/lib/knowledge-center-data';

type KCIndustry = typeof KC_INDUSTRIES[number];

const STD_SLUG_MAP: Record<string, string> = {
  'ISO 16889': 'iso-16889',
  'ISO 5011': 'iso-5011',
  'ISO 4406': 'iso-4406',
  'NAS 1638': 'nas-1638',
  'ISO 29463': 'iso-29463',
  'SAE J1858': 'sae-j1858',
  'ISO 11171': 'iso-11171',
};

const TECH_SLUG_MAP: Record<string, string> = {
  'MACROCORE™': 'macrocore',
  'SYNTRAX™': 'syntrax',
  'NANOFORCE™': 'nanoforce',
  'SYNTEPORE™': 'syntepore',
  'HYDROCORE™': 'hydrocore',
  'THERMACORE™': 'thermacore',
  'DRYCORE™': 'drycore',
  'INTEKCORE™': 'intekcore',
  'MICROKAPPA™': 'microkappa',
};

const DUST_COLORS: Record<string, string> = {
  'Extreme': '#ff4444',
  'High': '#ff8c00',
  'Moderate': '#FFF12D',
  'Low': '#44ff88',
};

export default function IndustryContent({ industry, detail }: { industry: KCIndustry; detail: KCIndustryDetail | null }) {
  const otherIndustries = KC_INDUSTRIES.filter((ind) => ind.slug !== industry.slug);
  const dustColor = DUST_COLORS[industry.dust] || '#FFF12D';

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
          <Link href="/knowledge-center/industries" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Industries</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>{industry.title}</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #080808 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
          >
            <span style={{ fontSize: '2rem', lineHeight: 1 }}>{industry.icon}</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.6rem',
              fontWeight: 700,
              color: dustColor,
              background: `${dustColor}15`,
              border: `1px solid ${dustColor}30`,
              padding: '0.25rem 0.6rem',
              letterSpacing: '0.08em',
            }}>
              {industry.dust.toUpperCase()} CONTAMINATION EXPOSURE
            </span>
          </motion.div>

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
            {industry.title}
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
            {industry.description}
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
                CONTAMINATION ENVIRONMENT
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>
                {detail.contaminationEnvironment}
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
                background: `${dustColor}15`,
                border: `1px solid ${dustColor}30`,
                marginBottom: '3rem',
              }}
            >
              {detail.keyMetrics.map((m) => (
                <div key={m.label} style={{ background: '#000', padding: '1.25rem 1.5rem' }}>
                  <p style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 700,
                    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                    color: dustColor,
                    marginBottom: '0.25rem',
                    lineHeight: 1.2,
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

          {detail && detail.primaryRisks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              style={{ marginBottom: '2.5rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>
                01 /
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>
                Primary Contamination Risks
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {detail.primaryRisks.map((risk, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: dustColor, marginTop: '0.1rem', flexShrink: 0 }}>→</span>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{risk}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {detail && detail.serviceIntervalNote && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.16 }}
              style={{ marginBottom: '2.5rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>
                02 /
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '0.75rem' }}>
                Service Interval Guidance
              </h2>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                  {detail.serviceIntervalNote}
                </p>
              </div>
            </motion.section>
          )}

          {detail && detail.sections.map((section, i) => (
            <motion.section
              key={section.heading}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
              style={{ marginBottom: '2.5rem' }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.6)', marginBottom: '0.6rem' }}>
                {String(i + 3).padStart(2, '0')} /
              </p>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.3rem', color: '#fff', marginBottom: '1rem' }}>
                {section.heading}
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.7)', textAlign: 'justify' }}>
                {section.body}
              </p>
            </motion.section>
          ))}

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
                Detailed industry documentation is being developed. Contact ELIMFILTERS for application-specific engineering consultation.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '4rem' }}>
          {detail && detail.technologies.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                ELIMFILTERS TECHNOLOGIES
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {detail.technologies.map((tech) => {
                  const slug = TECH_SLUG_MAP[tech];
                  return slug ? (
                    <Link key={tech} href={`/knowledge-center/technologies/${slug}`} style={{ textDecoration: 'none' }}>
                      <motion.div
                        whileHover={{ background: 'rgba(255,241,45,0.06)' }}
                        style={{ border: '1px solid rgba(255,241,45,0.15)', padding: '0.6rem 0.875rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, color: '#FFF12D', transition: 'background 0.2s' }}
                      >
                        {tech}
                      </motion.div>
                    </Link>
                  ) : (
                    <div key={tech} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 0.875rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
                      {tech}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {detail && detail.standards.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                RELEVANT STANDARDS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {detail.standards.map((std) => {
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

          {detail && detail.systems.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                PROTECTION SYSTEMS
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {detail.systems.map((sys) => (
                  <div key={sys} style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '0.5rem 0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {sys}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
              OTHER INDUSTRIES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {otherIndustries.map((ind) => (
                <Link key={ind.slug} href={`/knowledge-center/industries/${ind.slug}`} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    style={{ padding: '0.5rem 0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{ind.icon}</span>
                    {ind.title}
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
        headline: `${industry.title} — ELIMFILTERS Industrial Application Profile`,
        description: industry.description,
        url: `https://elimfilters.com/knowledge-center/industries/${industry.slug}`,
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        keywords: [industry.title, industry.dust + ' contamination exposure', ...(detail?.technologies ?? [])].join(', '),
        about: { '@type': 'Thing', name: industry.title + ' Filtration', description: industry.description },
        mentions: {
          technologies: detail?.technologies ?? [],
          standards: detail?.standards ?? [],
          systems: detail?.systems ?? [],
        },
      })}} />
    </main>
  );
}
