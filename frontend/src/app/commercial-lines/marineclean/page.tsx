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

        {/* Canonical Knowledge Block */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.15)',
            padding: '2rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem',
            lineHeight: 1.8, color: 'rgba(255,255,255,0.65)',
          }}>
            <p style={{ color: '#FFF12D', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              CANONICAL KNOWLEDGE BLOCK: MARINECLEAN™
            </p>
            <p><strong>DEFINITION</strong><br />
            MARINECLEAN™ is a salt-resistant commercial filtration line applying epoxy brine-rejection coating to housings and elements for marine environments. IMO certified. Protects diesel fuel filtration, hydraulic circuits, and lube oil systems against saltwater aerosol ingress, brine penetration, and corrosion from wet-dry cycling.</p>
            <p style={{ marginTop: '1rem' }}><strong>SYSTEMS</strong><br />
            Diesel fuel filtration · Hydraulic steering and deck machinery · Lube oil circuits · Marine generator fuel systems · Hydraulic BOP and wellhead control circuits</p>
            <p style={{ marginTop: '1rem' }}><strong>CONTAMINATION_TARGETS</strong><br />
            Saltwater aerosol ingress through housing seals | Brine penetration at element interface | Accelerated corrosion from wet-dry cycling | Seawater intrusion into fuel and hydraulic circuits</p>
            <p style={{ marginTop: '1rem' }}><strong>ENGINEERING_FEATURES</strong><br />
            Epoxy barrier coating: marine-grade, continuous saltwater aerosol rated | Brine rejection geometry: prevents salt ingress at element interface | Corrosion-shield internals: corrosion-resistant alloys for wet-dry cycling | IMO certification: International Maritime Organization commercial marine standard</p>
            <p style={{ marginTop: '1rem' }}><strong>CLASSIFICATION</strong><br />
            Commercial product line (marine-rated housing and element system). Not a filtration technology. Integrates ELIMFILTERS® protection technologies (fuel, hydraulic, lube) into marine-rated assemblies. Listed under /commercial-lines/, not /technologies/.</p>
            <p style={{ marginTop: '1rem' }}><strong>CITATION_REFERENCE</strong><br />
            source: elimfilters.com/commercial-lines/marineclean | concept: MARINECLEAN Commercial Line | version: 1.0 | last_updated: 2026-06-24</p>
          </div>
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
      {/* JSON-LD structured data */}
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'MARINECLEAN™',
        description: 'Salt-resistant filtration line for commercial marine, offshore, and coastal operations. Epoxy barrier coating, brine rejection geometry, and corrosion-shield internals. IMO certified for diesel fuel, hydraulic, and lube oil systems.',
        brand: { '@type': 'Brand', name: 'ELIMFILTERS®' },
        manufacturer: { '@type': 'Organization', name: 'Kleo Technologies LLC', url: 'https://elimfilters.com' },
        url: 'https://elimfilters.com/commercial-lines/marineclean/',
        category: 'Industrial Filtration — Marine',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Certification', value: 'IMO (International Maritime Organization)' },
          { '@type': 'PropertyValue', name: 'Coating', value: 'Marine-grade epoxy barrier' },
          { '@type': 'PropertyValue', name: 'Systems Protected', value: 'Diesel fuel · Hydraulic · Lube oil' },
          { '@type': 'PropertyValue', name: 'Environments', value: 'Harbor · Offshore · Deep-sea' },
        ],
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ELIMFILTERS®', item: 'https://elimfilters.com' },
            { '@type': 'ListItem', position: 2, name: 'Commercial Lines', item: 'https://elimfilters.com/commercial-lines/' },
            { '@type': 'ListItem', position: 3, name: 'MARINECLEAN™', item: 'https://elimfilters.com/commercial-lines/marineclean/' },
          ],
        },
      }) }} />

      <Footer />
    </main>
  );
}
