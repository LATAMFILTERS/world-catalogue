'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const PRINCIPLES = [
  {
    num: '01',
    title: 'Protect the asset, not only the filter.',
    desc: 'The filter is an engineering tool, not the final product. Success is measured by extension of critical component life, not filter longevity.',
  },
  {
    num: '02',
    title: 'Contamination is the problem.',
    desc: '70-80% of hydraulic and engine lubrication failures are initiated by micro-abrasion. We design systems to eliminate the root cause, not just react to failure.',
  },
  {
    num: '03',
    title: 'Engineering comes before marketing.',
    desc: 'We refuse generic statements and commercial clichés. Every performance claim must be backstopped by international standards and repeatable metrology.',
  },
  {
    num: '04',
    title: 'Every protection system deserves its own solution.',
    desc: 'Different protection systems have distinct contamination profiles. A single multi-purpose media cannot protect complex engines, hydraulics, and fuel lines.',
  },
  {
    num: '05',
    title: 'Standards guide decisions.',
    desc: 'ISO 4406, ISO 16889, ISO 5011, and ASTM methodologies are the legal constitution of our engineering department. We design to match or exceed certified metrics.',
  },
  {
    num: '06',
    title: 'Knowledge creates better maintenance decisions.',
    desc: 'We publish our internal documentation and metrology frameworks. A customer who understands contamination is a customer who chooses engineered protection.',
  },
  {
    num: '07',
    title: 'Reliability is the objective.',
    desc: 'Contamination control is reliability engineering. Eliminating micronic wear is the only pathway to achieving design life and avoiding catastrophic field stops.',
  },
];

export default function OurPhilosophyPage() {
  const schemaOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ELIMFILTERS',
    legalName: 'Kleo Technologies LLC',
    url: 'https://elimfilters.com',
    logo: 'https://elimfilters.com/assets/logo-elimfilters.png',
    email: 'info@elimfilters.com',
    areaServed: 'Worldwide',
    description: 'ELIMFILTERS is an industrial asset protection company protecting critical equipment through contamination control, proprietary filtration technologies, and system-level engineering frameworks.',
  };

  const schemaPhilosophyPage = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Our Philosophy — ELIMFILTERS Engineering Doctrine',
    description: 'The official engineering philosophy of ELIMFILTERS. Guided by contamination science, international metrology standards, and system-level asset protection principles.',
    url: 'https://elimfilters.com/about/philosophy',
    author: { '@type': 'Organization', name: 'ELIMFILTERS' },
    dateModified: '2026-07-03',
  };

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com' },
      { '@type': 'ListItem', position: 2, name: 'About', item: 'https://elimfilters.com/about' },
      { '@type': 'ListItem', position: 3, name: 'Philosophy', item: 'https://elimfilters.com/about/philosophy' },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaPhilosophyPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      {/* Navigation */}
      <div style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', gap: '0.5rem'
      }}>
        <Link href="/about"
          className="back-nav-btn" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#fff', textDecoration: 'none',
          backdropFilter: 'blur(8px)',
        }}>← ABOUT US</Link>
        <Link href="/"
          className="back-nav-btn" style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
          backdropFilter: 'blur(8px)',
        }}>HOME</Link>
      </div>

      {/* HERO */}
      <header style={{ position: 'relative', height: 'clamp(350px, 50vh, 600px)', overflow: 'hidden' }}>
        <img
          src="/images/grupo-filters.avif"
          alt="ELIMFILTERS Engineering Philosophy"
          fetchPriority="high"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.4) 100%)' }} />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        >
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', letterSpacing: '0.15em', marginBottom: '1rem' }}>
            ENGINEERING DOCTRINE
          </span>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            maxWidth: '800px',
          }}>
            Our Engineering Philosophy
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '650px',
            lineHeight: 1.8,
            textAlign: 'justify',
          }}>
            ELIMFILTERS does not design generic aftermarket replacements. We engineer contamination control systems designed to preserve heavy industrial machinery. Our work is governed strictly by the physical laws of tribology and verified international standards.
          </p>
        </motion.div>
      </header>

      {/* CONTENT GRID */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          
          {/* Section 1 & 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))', gap: '3.5rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                1. Why ELIMFILTERS Exists
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                Heavy-duty machinery is built to work in extreme conditions, yet it is vulnerable to invisible micronic clearances. Conventional filtration relies on commodity filter elements that capture large particles while letting the smaller, highly abrasive particles pass through. These particles circulate through hydraulic valves, turbochargers, and common rail injectors, creating friction and wear. ELIMFILTERS exists to build a defensive shield that stops this wear cycle and extends the service life of critical assets.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                2. What We Believe
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                We believe that asset protection is an exact engineering science, not a branding exercise. A filter is not just a commodity consumable meant to be replaced as cheaply as possible; it is a system-level component that directly influences the thermodynamic efficiency and mechanical integrity of the entire machine. By controlling contamination, we restore equipment reliability to its design potential.
              </p>
            </motion.div>
          </div>

          {/* Section 3 & 4 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))', gap: '3.5rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                3. Our Engineering Philosophy
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                Our philosophy centers on precision multi-layer interception. We refuse single-layer bypass-prone designs. Instead, we structure filtration media with multi-density synthetic fibers, hydrophobic membranes, and zero-bypass radial sealing interfaces. Our engineering focuses entirely on the critical clearances of modern systems—such as high-pressure common rail (HPCR) common clearances of 1–5 µm—ensuring targeted particle capture where it matters most.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                4. How We Make Engineering Decisions
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                We make decisions using empirical, testable data. Every technology we build is tested under strict laboratory and field conditions to verify performance against international standards: ISO 16889 for lube oil multi-pass efficiency, ISO 5011 for air intake capacity, and ISO 4406 for target fluid cleanliness codes. If a design cannot be measured, certified, and validated in service, it does not leave our laboratory.
              </p>
            </motion.div>
          </div>

          {/* Section 5 & 6 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(450px, 100%), 1fr))', gap: '3.5rem' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                5. Why We Developed Proprietary Technologies
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                Standard off-the-shelf filters cannot provide adequate protection for high-value industrial machinery operating in extreme conditions. We developed specialized, proprietary technologies like MACROCORE™, SYNTEPORE™, and NANOFORCE™ because each system domain exhibits unique contamination profiles and failure pathways. Our proprietary structures allow us to optimize media configuration for specific fluids, pressures, and contaminants.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFF12D', marginBottom: '1.25rem' }}>
                6. Our Commitment to Customers
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.68)', lineHeight: 1.8, textAlign: 'justify' }}>
                We commit to delivering transparency, verification, and engineering support. We do not hide behind sales slogans. We provide full access to our Knowledge System, engineering data sheets, and certification records. We believe that empowering our customers with contamination control knowledge is just as important as the physical products we deliver.
              </p>
            </motion.div>
          </div>

        </div>
      </section>

      {/* PRINCIPLES */}
      <section style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.5rem, 5vw, 4rem)', background: 'rgba(255,241,45,0.01)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3.5rem', textAlign: 'center' }}
          >
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: '#FFF12D', letterSpacing: '0.12em' }}>
              7 GUIDING PRINCIPLES
            </span>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.02em', marginTop: '0.5rem' }}>
              The ELIMFILTERS Engineering Principles
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1.5rem' }}>
            {PRINCIPLES.map((pr, i) => (
              <motion.div
                key={pr.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                style={{
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '2rem 1.75rem',
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#FFF12D', fontWeight: 700 }}>
                  {pr.num}
                </span>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.08rem', fontWeight: 600, lineHeight: 1.3, color: '#fff' }}>
                  {pr.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, textAlign: 'justify', margin: 0 }}>
                  {pr.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
