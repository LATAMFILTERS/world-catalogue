'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function MarinecleanPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Navigation />

      {/* Hero */}
      <section style={{
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 'clamp(6rem, 10vw, 9rem) clamp(1.5rem, 6vw, 4rem) clamp(3rem, 5vw, 4rem)',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/assets/MARINECLEAN.avif)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.18,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #000 40%, transparent 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Link href="/commercial-lines" style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem',
              letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none', textTransform: 'uppercase',
              display: 'inline-block', marginBottom: '1.5rem',
            }}>← COMMERCIAL LINES</Link>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem',
              letterSpacing: '0.25em', color: 'rgba(255,241,45,0.7)',
              textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              // MARINE · OFFSHORE · COASTAL INFRASTRUCTURE
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 1,
              letterSpacing: '-0.03em', textTransform: 'uppercase',
              marginBottom: '1rem',
            }}>
              MARINECLEAN™
            </h1>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '560px',
            }}>
              Salt-resistant filtration line for commercial marine, offshore, and coastal operations.
              IMO certified for continuous saltwater aerosol exposure.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem)' }}>

        {/* Section 01 */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.5)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>01 / PRODUCT LINE</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.25rem' }}>Marine-Grade Asset Protection</h2>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '1rem' }}>
            MARINECLEAN™ is a salt-resistant filtration line that applies epoxy brine-rejection coating to housings and elements in marine environments. Meeting IMO (International Maritime Organization) certification standards, MARINECLEAN™ prevents salt-accelerated corrosion in fuel and lubrication systems aboard commercial vessels, offshore platforms, and coastal industrial equipment.
          </p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
            Standard industrial filtration degrades rapidly in marine environments — salt aerosol penetrates seals, corrodes housings, and compromises element integrity within months. MARINECLEAN™ is engineered from the ground up for wet-dry cycling in harbor, offshore, and deep-sea operating environments.
          </p>
        </motion.section>

        {/* Section 02 — Key specifications */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.5)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>02 / ENGINEERING FEATURES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.5rem' }}>Construction & Certification</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Epoxy Barrier Coating', body: 'Marine-grade epoxy coating on all external housing surfaces prevents salt-accelerated oxidation and corrosion in continuous saltwater aerosol environments.' },
              { title: 'Brine Rejection Geometry', body: 'Internal flow geometry engineered to reject brine ingress at the element interface, preventing salt contamination of protected fuel and hydraulic fluids.' },
              { title: 'Corrosion-Shield Internals', body: 'All internal metal components use corrosion-resistant alloys and coatings rated for the wet-dry cycling experienced in harbor and offshore operations.' },
              { title: 'IMO Certification', body: 'Certified to IMO (International Maritime Organization) standards for commercial marine use across fuel filtration and hydraulic protection systems.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.6rem', color: '#FFF12D' }}>{f.title}</h3>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 03 — Applications */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.5)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>03 / APPLICATIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.5rem' }}>Operational Contexts</h2>
          {[
            { sector: 'Commercial Vessels', desc: 'Main engine fuel filtration, hydraulic steering and deck machinery, lube oil circuits aboard cargo ships, ferries, and workboats.' },
            { sector: 'Offshore Platforms', desc: 'Diesel generator fuel systems, hydraulic BOP and wellhead control circuits, crane hydraulics in permanent and semi-submersible platforms.' },
            { sector: 'Coastal Infrastructure', desc: 'Port machinery, coastal construction equipment, and shore-based industrial operations subject to continuous salt aerosol exposure.' },
          ].map(a => (
            <div key={a.sector} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{a.sector}</h3>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{a.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* Back link */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <Link href="/commercial-lines" style={{
            fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.75rem',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)', textDecoration: 'none',
          }}>
            ← Back to Commercial Lines
          </Link>
        </div>

      </div>
      <Footer />
    </main>
  );
}
