'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { KC_INDUSTRIES } from '@/lib/knowledge-center-data';

const DUST_COLORS: Record<string, string> = {
  'Extreme': '#ff4444',
  'High': '#ff8c00',
  'Moderate': '#FFF12D',
  'Low': '#44ff88',
};

export default function IndustriesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <Link href="/knowledge-center/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>← KNOWLEDGE CENTER</Link>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '1rem' }}>04 / INDUSTRY APPLICATIONS</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.15, textAlign: 'justify', marginBottom: '1.25rem' }}>Industrial Application Profiles</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }} style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', lineHeight: 1.75, textAlign: 'justify', color: 'rgba(255,255,255,0.6)', maxWidth: '650px' }}>
            Twelve technical industry profiles connect operating environment, contamination exposure, protected systems, ELIMFILTERS technologies and application evidence across the full market portfolio — including Automotive &amp; Light Duty and Bus &amp; Coach.
          </motion.p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '1rem', color: 'rgba(255,255,255,0.45)', maxWidth: '650px' }}>
            For commercial positioning, equipment applications and product pathways, see the complete <Link href="/industries/" style={{ color: '#FFF12D', textDecoration: 'underline', textUnderlineOffset: '0.2em' }}>ELIMFILTERS Industries portfolio</Link>.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {KC_INDUSTRIES.map((industry, i) => (
          <motion.div key={industry.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
            <Link href={`/knowledge-center/industries/${industry.slug}/`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.25)', background: 'rgba(255,255,255,0.015)' }} style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.75rem', transition: 'border-color 0.2s, background 0.2s', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{industry.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, color: DUST_COLORS[industry.dust] || '#FFF12D', background: `${DUST_COLORS[industry.dust] || '#FFF12D'}15`, border: `1px solid ${DUST_COLORS[industry.dust] || '#FFF12D'}30`, padding: '0.2rem 0.5rem', letterSpacing: '0.05em' }}>{industry.dust.toUpperCase()} EXPOSURE</span>
                </div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.15rem', color: '#fff', marginBottom: '0.65rem', lineHeight: 1.2, textAlign: 'justify' }}>{industry.title}</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.65, textAlign: 'justify', color: 'rgba(255,255,255,0.5)' }}>{industry.description}</p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </section>

      <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.1)', padding: '1.5rem 2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>APPLICATION EVIDENCE BOUNDARY</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, textAlign: 'justify' }}>
            Industry context identifies the operating environment; it does not by itself prove a product fit. Final service intervals, performance requirements and part selection must remain tied to validated equipment, protected system, duty cycle, OEM reference, dimensions and application evidence.
          </p>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Industrial Application Profiles — ELIMFILTERS Knowledge Center',
        description: 'Twelve technical industry profiles covering the canonical ELIMFILTERS operating-market portfolio.',
        url: 'https://elimfilters.com/knowledge-center/industries/',
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: KC_INDUSTRIES.length,
          itemListElement: KC_INDUSTRIES.map((industry, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `https://elimfilters.com/knowledge-center/industries/${industry.slug}/`,
            name: industry.title,
          })),
        },
        isPartOf: { '@type': 'WebSite', '@id': 'https://elimfilters.com/#website' },
        publisher: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
      })}} />
    </main>
  );
}
