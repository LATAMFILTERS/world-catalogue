'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useState } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

// Map each industry to its background image and a sharp commercial tagline
const INDUSTRY_META: Record<string, { img: string; tag: string; copy: string }> = {
  Agriculture: {
    img: '/images/agriculture.avif',
    tag: 'Harvest-critical filtration',
    copy: 'Protect engines operating 18-hour harvesting cycles in dust concentrations up to 8,000 mg/m³. Zero unplanned downtime during harvest windows.',
  },
  Automotive: {
    img: '/images/autos-02.avif',
    tag: 'Precision engine protection',
    copy: 'High-volume engine assembly and fleet servicing demand ISO 16889 Beta-rated filtration at every oil, fuel and hydraulic circuit.',
  },
  'Bus Coach': {
    img: '/images/bus-hero.avif',
    tag: 'Passenger fleet reliability',
    copy: 'Cabin air quality (ISO 11155) and engine protection systems for high-utilisation public transport fleets operating 24/7.',
  },
  Construction: {
    img: '/images/construccion.avif',
    tag: 'Heavy machinery endurance',
    copy: 'Hydraulic excavators, cranes and earthmovers face extreme dust, vibration and thermal cycling. System-level filtration prevents premature valve wear and hydraulic failure.',
  },
  Manufacturing: {
    img: '/images/manufacture.avif',
    tag: 'Process continuity assurance',
    copy: 'Compressed air purity (ISO 8573-1), coolant filtration and hydraulic circuit protection for continuous production lines with zero-tolerance for unplanned stops.',
  },
  Marine: {
    img: '/images/marine-hero.avif',
    tag: 'Offshore and vessel protection',
    copy: 'Salt-mist corrosion, seawater contamination and high-load marine diesel systems demand filtration rated to ASTM B117 and ATEX environments.',
  },
  Mining: {
    img: '/images/mineria.avif',
    tag: 'Extreme environment durability',
    copy: 'Open-pit and underground operations face silica dust, diesel fumes and hydraulic contamination. One filtration failure can idle a $4M excavator.',
  },
  'Oil Gas': {
    img: '/images/oil&gas.avif',
    tag: 'Upstream and midstream reliability',
    copy: 'Gas compressors, pump drives and wellhead equipment run in H2S, CO2 and salt-mist environments where standard filters fail within weeks.',
  },
  'Power Generation': {
    img: '/images/turbinas-hero.avif',
    tag: 'Turbine and gen-set protection',
    copy: 'Gas turbines, diesel generators and wind-power hydraulics require sub-micron filtration to protect bearings, seals and fuel injector systems.',
  },
  Railway: {
    img: '/images/trenes.avif',
    tag: 'Traction system integrity',
    copy: 'Locomotive diesel engines, hydraulic couplings and brake systems demand contaminant-free circuits to maintain regulatory uptime and safety compliance.',
  },
  'Trucks Fleets': {
    img: '/images/trucks-1.avif',
    tag: 'Long-haul fleet optimisation',
    copy: 'Extended drain intervals, reduced fuel consumption and lower maintenance cost per km through calibrated filtration across oil, fuel, air and cabin circuits.',
  },
  'Waste Municipal': {
    img: '/images/wasted.avif',
    tag: 'High-cycle vehicle protection',
    copy: 'Refuse collection vehicles operate in the harshest urban environments. Hydraulic, cabin and engine circuits require contamination control matched to daily duty cycles.',
  },
};

function IndustryCard({
  industry,
  index,
}: {
  industry: (typeof catalogue.industries)[number];
  index: number;
}) {
  const slug = getSlug(industry.name);
  const meta = INDUSTRY_META[industry.name] ?? {
    img: '/images/operador1_converted.avif',
    tag: 'Industrial filtration',
    copy: industry.description,
  };
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/industries/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            height: '380px',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          {/* Background image with zoom on hover */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${meta.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
              filter: hovered ? 'brightness(0.55)' : 'brightness(0.45)',
            }}
          />

          {/* Base gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 100%)',
          }} />

          {/* Yellow left border — appears on hover */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: '3px',
            background: '#FFF12D',
            transform: hovered ? 'scaleY(1)' : 'scaleY(0)',
            transformOrigin: 'bottom',
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />

          {/* Content */}
          <div style={{
            position: 'absolute', inset: 0,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                color: 'rgba(255,255,255,0.3)',
              }}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.58rem',
                letterSpacing: '0.15em',
                color: hovered ? '#FFF12D' : 'rgba(255,241,45,0.55)',
                textTransform: 'uppercase',
                transition: 'color 0.3s ease',
              }}>
                {meta.tag}
              </span>
            </div>

            {/* Bottom content */}
            <div>
              <h3 style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 600,
                fontSize: 'clamp(1.2rem, 2.2vw, 1.55rem)',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: '#fff',
                textTransform: 'uppercase',
              }}
            >
              View Asset Protection Systems →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function IndustriesPage() {
  const industriesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Industrial Filtration Systems by Industry',
    url: 'https://elimfilters.com/industries/',
    itemListElement: catalogue.industries.map((industry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${industry.name} Filtration Systems`,
      url: `https://elimfilters.com/industries/${getSlug(industry.name)}`,
      description: industry.description,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://elimfilters.com/' },
      { '@type': 'ListItem', position: 2, name: 'Industries', item: 'https://elimfilters.com/industries/' },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Industrial Filtration Systems by Industry',
    description: 'ELIMFILTERS serves 12 critical industries with engineered asset protection filtration systems engineered to ISO and SAE specification.',
    url: 'https://elimfilters.com/industries/',
    datePublished: '2026-01-15',
    dateModified: '2026-05-25',
    author: {
      '@type': 'Organization',
      name: 'ELIMFILTERS',
      url: 'https://elimfilters.com',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What industries require industrial filtration systems?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is asset protection filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does mining filtration differ from standard industrial filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal (H2O intrusion from rain and humidity), and hydraulic system contamination control for high-pressure hoist and crush systems.',
        },
      },
      {
        '@type': 'Question',
        name: 'What filtration standards does ELIMFILTERS comply with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ELIMFILTERS systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety). Specific certifications vary by industry and circuit type.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does ELIMFILTERS serve offshore oil and gas platforms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. ELIMFILTERS marine and offshore systems protect against salt-mist corrosion (ASTM B117), H2S and CO2 contamination, high-pressure fuel injection systems, and seawater-based cooling circuits. All systems are rated for ATEX/IECEx hazardous-area environments where applicable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the typical equipment lifespan extension from system-level filtration?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'System-level filtration targeting ISO 16/14/11 cleanliness codes (vs. commodity approaches at 19/17/14) extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.',
        },
      },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/"
        className="back-nav-btn" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}>← HOME</Link>

      {/* ── PAGE HERO ── */}
      <section style={{
        minHeight: '72vh',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Hero background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/operador1_converted.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.18,
          zIndex: 0,
        }} />
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 2rem 4rem', position: 'relative', zIndex: 1, width: '100%' }}>
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.25em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            // INDUSTRIES
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              lineHeight: 1.1,
              marginBottom: '3rem',
            }}
          >
            Industrial Asset Protection by Industry
          </motion.h1>

          {/* Tagline — Change 2 */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
              color: '#fff',
              lineHeight: 1.25,
              marginBottom: '1.5rem',
            }}
          >
            Every industry has contamination risks.<br />
            <span style={{ color: '#FFF12D' }}>Every asset deserves protection.</span>
          </motion.h2>

          {/* Direct Answer Block — GEO Optimization */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.95rem',
              fontFamily: 'Outfit, sans-serif',
              marginBottom: '2rem',
              maxWidth: '820px',
            }}
          >
            <p style={{ margin: '0 0 1.5rem' }}>
              From open-pit mining to offshore platforms, from harvest combines to municipal fleets — contamination is the single largest cause of unplanned equipment failure. ELIMFILTERS engineers asset protection systems calibrated to your sector's specific contamination profile and ISO cleanliness targets.
            </p>
            {/* Change 3 — new positioning paragraphs */}
            <p style={{ margin: '0 0 0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Industries do not buy filters.
            </p>
            <p style={{ margin: '0 0 1.25rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Industries protect assets.
            </p>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)' }}>
              Every ELIMFILTERS solution begins by identifying the assets at risk, understanding the contamination threats affecting them, and deploying the protection systems required to maintain operational continuity.
            </p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[
                { val: '12', label: 'Sectors' },
                { val: '50+', label: 'Countries' },
                { val: '20k+', label: 'OEM refs' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, fontSize: '1.5rem', color: '#FFF12D', lineHeight: 1 }}>{stat.val}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '0.3rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── INDUSTRIES GRID ── */}
      <section style={{ padding: '0' }}>
        <div
          className="industries-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {catalogue.industries.map((industry, i) => (
            <IndustryCard key={industry.name} industry={industry} index={i} />
          ))}
        </div>
      </section>

      {/* Cost of Contamination — Changes 5 & 6 */}
      <section style={{ padding: '5rem 2rem', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              // The cost of contamination
            </p>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#fff', lineHeight: 1.25, marginBottom: '3rem' }}>
              Asset protection is not a maintenance cost.<br />
              <span style={{ color: '#FFF12D' }}>It is operational insurance.</span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              {
                stat: '70%',
                desc: 'of all hydraulic and engine failures are caused by contamination — particles you cannot see with the naked eye.',
              },
              {
                stat: '3–5×',
                desc: 'asset component life extension when ISO cleanliness targets are consistently maintained.',
              },
              {
                stat: '1–5%',
                desc: 'of total asset ownership cost is filtration. The remaining 95% is determined by how well that 1–5% performs.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: '-40px' }}
                style={{ borderLeft: '3px solid #FFF12D', paddingLeft: '1.5rem' }}
              >
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFF12D', lineHeight: 1, marginBottom: '0.75rem' }}>
                  {item.stat}
                </p>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section — GEO High-Impact */}
      <section style={{ padding: '5rem 2rem', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-100px' }}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#fff',
              marginBottom: '2.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Frequently Asked Questions
          </motion.h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                q: 'What industries require industrial filtration systems?',
                a: 'Every heavy-equipment and process industry requires filtration. Mining, agriculture, marine, oil & gas, power generation, construction, manufacturing, transportation, and waste management all depend on asset protection filtration to prevent contamination-related failures in engines, hydraulic systems, fuel circuits, and pneumatic systems.',
              },
              {
                q: 'What is asset protection filtration?',
                a: 'Asset protection filtration is a system-level approach that targets contamination control via ISO and SAE standards, not product commodity selection. It maintains measurable cleanliness codes (ISO 4406, ISO 16889) across all fluid circuits—oil, fuel, hydraulic, coolant, and air—to extend equipment lifespan 30-50% and reduce unplanned downtime.',
              },
              {
                q: 'How does mining filtration differ from standard industrial filtration?',
                a: 'Mining environments expose equipment to dust concentrations exceeding 5,000 mg/m³—far above ISO 5011 test standards. Mining filtration systems must handle bypass-protected air intakes, fuel circuit water removal (H2O intrusion from rain and humidity), and hydraulic system contamination control for high-pressure hoist and crush systems.',
              },
              {
                q: 'What filtration standards does ELIMFILTERS comply with?',
                a: 'ELIMFILTERS systems are engineered to ISO 16889 (Beta ratio filter testing), ISO 4406 (cleanliness codes), ISO 5011 (air filter testing), SAE J1539 (air filter performance), ASTM D6304 (fuel water removal), and ISO 11155 (cabin air safety). Specific certifications vary by industry and circuit type.',
              },
              {
                q: 'Does ELIMFILTERS serve offshore oil and gas platforms?',
                a: 'Yes. ELIMFILTERS marine and offshore systems protect against salt-mist corrosion (ASTM B117), H2S and CO2 contamination, high-pressure fuel injection systems, and seawater-based cooling circuits. All systems are rated for ATEX/IECEx hazardous-area environments where applicable.',
              },
              {
                q: 'What is the typical equipment lifespan extension from system-level filtration?',
                a: 'System-level filtration targeting ISO 16/14/11 cleanliness codes (vs. commodity commodity approaches at 19/17/14) extends bearing and engine component life 3-5x. In mining equipment, this translates to 15,000-25,000 operational hours vs. 2,000-3,000 hours under poor contamination control.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-50px' }}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.2em',
                  color: 'rgba(255,241,45,0.7)',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                The cost of contamination
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 600,
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  margin: 0,
                }}
              >
                Filtration is not a maintenance cost.<br />
                <span style={{ color: '#FFF12D' }}>It is equipment insurance.</span>
              </motion.h2>
            </div>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {[
                {
                  stat: '70%',
                  text: 'of all hydraulic and engine failures are caused by contamination — particles you cannot see with the naked eye.',
                },
                {
                  stat: '3–5×',
                  text: 'equipment bearing lifespan extension when ISO 16/14/11 cleanliness targets are maintained versus commodity filtration at 19/17/14.',
                },
                {
                  stat: '1–5%',
                  text: 'of total asset ownership cost is filtration. The remaining 95% is determined by how well that 1–5% performs.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'flex-start',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    color: '#FFF12D',
                    lineHeight: 1,
                    minWidth: '90px',
                  }}>
                    {item.stat}
                  </div>
                  <p style={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    color: 'rgba(255,255,255,0.55)',
                    margin: 0,
                    paddingTop: '0.2rem',
                  }}>
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(industriesSchema) }} />
    </main>
  );
}
