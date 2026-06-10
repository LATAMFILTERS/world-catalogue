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
                margin: '0 0 0.75rem',
              }}>
                {industry.name}
              </h3>

              {/* Copy — slides in on hover */}
              <div style={{
                overflow: 'hidden',
                maxHeight: hovered ? '80px' : '0',
                opacity: hovered ? 1 : 0,
                transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease',
                marginBottom: hovered ? '1.25rem' : '0',
              }}>
                <p style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 400,
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.65)',
                  margin: 0,
                }}>
                  {meta.copy}
                </p>
              </div>

              {/* CTA row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  fontWeight: 500,
                  fontSize: '0.72rem',
                  letterSpacing: '0.1em',
                  color: hovered ? '#FFF12D' : 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  transition: 'color 0.3s ease',
                }}>
                  View filtration systems
                </span>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke={hovered ? '#FFF12D' : 'rgba(255,255,255,0.3)'}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition: 'stroke 0.3s ease, transform 0.3s ease', transform: hovered ? 'translateX(4px)' : 'none' }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
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

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      <style>{`
        @media (max-width: 768px) {
          .industries-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 1024px) {
          .industries-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── PAGE HERO ── */}
      <section style={{
        padding: '10rem 7% 5rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
      }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: 'rgba(255,241,45,0.7)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          Sectors served · 12 industries
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1200px', alignItems: 'end' }}>
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
              }}
            >
              Every industry has a<br />
              <span style={{ fontWeight: 600, color: '#FFF12D' }}>contamination problem.</span><br />
              We solve it.
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              margin: '0 0 1.5rem',
            }}>
              From open-pit mining to offshore platforms, from harvest combines to municipal fleets — contamination is the single largest cause of unplanned equipment failure. ELIMFILTERS engineers asset protection systems calibrated to your sector&apos;s specific contamination profile and ISO cleanliness targets.
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

      {/* ── WHY IT MATTERS ── */}
      <section style={{ padding: '6rem 7%', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '5rem', alignItems: 'start' }}>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
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
