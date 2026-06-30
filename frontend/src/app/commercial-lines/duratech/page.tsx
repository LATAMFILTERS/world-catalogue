'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function DuratechPage() {
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
          backgroundImage: 'url(/assets/Duratech.avif)',
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
              DURATECH™
            </h1>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '560px',
              textAlign: 'justify',
            }}>
              Fleet master kit system for on-road and off-road operations. One kit per vehicle platform.
              All filtration elements per service cycle — oil, fuel, air, and cabin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 6vw, 4rem)' }}>

        {/* Section 01 */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.25rem' }}>Fleet Maintenance Master Kits</h2>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '1rem' }}>
            DURATECH™ is a fleet maintenance standardisation system that consolidates OEM-interchangeable filtration components into master kits. Designed for mixed-fleet operations in mining, construction, and agriculture, DURATECH™ reduces parts inventory complexity, lowers procurement cost, and ensures every service event uses the correct filter specification for each asset.
          </p>
          <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, textAlign: 'justify' }}>
            Each kit is platform-specific — one DURATECH™ kit covers a complete vehicle service: oil filter, fuel filter, air filter, and cabin filter. Eliminates wrong-element installations in mixed-model fleets and converts filter inventory to a predictable kit-based structure with a single order per service cycle.
          </p>
        </motion.section>

        {/* Section 02 — Kit structure */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.5rem' }}>What Each Kit Contains</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Oil Filter', body: 'SYNTRAX™ lubrication protection element — correct viscosity grade and capacity for the specific engine platform.' },
              { title: 'Fuel Filter', body: 'HYDROCORE™ or SYNTEPORE™ fuel cleanliness element matched to injection system pressure specification.' },
              { title: 'Air Filter', body: 'MACROCORE™ or SYNTEPORE™ air intake element specified to the engine air circuit and operating environment.' },
              { title: 'Cabin Filter', body: 'MICROKAPPA™ cabin air element for operator protection — included where platform cabin filtration is installed.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.6rem', color: '#FFF12D' }}>{f.title}</h3>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'justify' }}>{f.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Section 03 — Fleet applications */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', marginBottom: '1.5rem' }}>On-Road & Off-Road Operations</h2>
          {[
            { sector: 'Trucks & Fleets', desc: 'On-road commercial transport fleets with mixed makes and models — long-haul trucks, regional distribution, and last-mile delivery vehicles.' },
            { sector: 'Mining & Construction', desc: 'Off-road heavy equipment fleets — excavators, loaders, haul trucks, and drill rigs operating across multiple equipment brands.' },
            { sector: 'Agriculture', desc: 'Agricultural machinery fleets — tractors, harvesters, and self-propelled sprayers across seasonal maintenance cycles.' },
          ].map(a => (
            <div key={a.sector} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{a.sector}</h3>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'justify' }}>{a.desc}</p>
            </div>
          ))}
        </motion.section>

        {/* Canonical Knowledge Block */}
        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'rgba(255,241,45,0.04)', border: '1px solid rgba(255,241,45,0.15)',
            padding: '2rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem',
            lineHeight: 1.8, color: 'rgba(255,255,255,0.65)',
            textAlign: 'justify',
          }}>
            <p style={{ color: '#FFF12D', fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              CANONICAL KNOWLEDGE BLOCK: DURATECH™
            </p>
            <p><strong>DEFINITION</strong><br />
            DURATECH™ is a fleet maintenance standardisation system that consolidates OEM-interchangeable filtration components into platform-specific master kits. Each kit contains the correct oil, fuel, air, and cabin filter for a specific vehicle model. Designed for mixed-fleet operations in trucks, mining, construction, and agriculture.</p>
            <p style={{ marginTop: '1rem' }}><strong>KIT_CONTENTS</strong><br />
            Oil Filter: SYNTRAX™ lubrication protection element | Fuel Filter: HYDROCORE™ or SYNTEPORE™ fuel cleanliness element | Air Filter: MACROCORE™ or SYNTEPORE™ air intake element | Cabin Filter: MICROKAPPA™ cabin air element (where installed)</p>
            <p style={{ marginTop: '1rem' }}><strong>OPERATIONAL_BENEFITS</strong><br />
            Eliminates wrong-element installations in mixed-model fleets | Converts filter inventory to predictable kit-based structure | Single order per service cycle — reduces procurement complexity | Platform-specific kits — one kit per vehicle model | OEM-interchangeable specifications</p>
            <p style={{ marginTop: '1rem' }}><strong>FLEET_APPLICATIONS</strong><br />
            Trucks & Fleets: on-road commercial transport — long-haul, regional distribution, last-mile | Mining & Construction: off-road heavy equipment — excavators, loaders, haul trucks, drill rigs | Agriculture: tractors, harvesters, self-propelled sprayers across seasonal maintenance cycles</p>
            <p style={{ marginTop: '1rem' }}><strong>CLASSIFICATION</strong><br />
            Commercial product line (fleet service kit system). Not a filtration technology. Bundles existing ELIMFILTERS® protection technologies into platform-specific service kits. Listed under /commercial-lines/, not /technologies/.</p>
            <p style={{ marginTop: '1rem' }}><strong>CITATION_REFERENCE</strong><br />
            source: elimfilters.com/commercial-lines/duratech | concept: DURATECH Commercial Line | version: 1.0 | last_updated: 2026-06-24</p>
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
        name: 'DURATECH™',
        description: 'Fleet maintenance standardisation system consolidating oil, fuel, air, and cabin filtration into OEM-interchangeable master kits. Platform-specific kits for mixed-model fleets in trucks, mining, construction, and agriculture.',
        brand: { '@type': 'Brand', name: 'ELIMFILTERS®' },
        manufacturer: { '@type': 'Organization', name: 'Kleo Technologies LLC', url: 'https://elimfilters.com' },
        url: 'https://elimfilters.com/commercial-lines/duratech/',
        category: 'Industrial Filtration — Fleet Maintenance',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Compatibility', value: 'OEM-interchangeable' },
          { '@type': 'PropertyValue', name: 'Sourcing', value: 'Single-source per service cycle' },
          { '@type': 'PropertyValue', name: 'Coverage', value: 'On-road and off-road mixed-model fleets' },
          { '@type': 'PropertyValue', name: 'Elements per Kit', value: 'Oil · Fuel · Air · Cabin' },
        ],
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ELIMFILTERS®', item: 'https://elimfilters.com' },
            { '@type': 'ListItem', position: 2, name: 'Commercial Lines', item: 'https://elimfilters.com/commercial-lines/' },
            { '@type': 'ListItem', position: 3, name: 'DURATECH™', item: 'https://elimfilters.com/commercial-lines/duratech/' },
          ],
        },
      }) }} />

      <Footer />
    </main>
  );
}
