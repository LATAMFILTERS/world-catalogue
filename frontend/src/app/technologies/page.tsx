'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'motion/react';
import { catalogue, getSlug } from '@/lib/catalogue';

const GEO_DEFINITIONS: Record<string, { system: string; metric: string; short: string }> = {
  'aquaguard-series': { system: 'Fuel Cleanliness', metric: '99.8% free water removal', short: 'Heavy-duty turbine fuel filter/water separator. Three-stage protection for high-flow power generation and mining fuel systems.' },
  'aquaguard':        { system: 'Fuel Cleanliness', metric: '99.8% water removal · ASTM D6304', short: 'Hydrophobic water-separation for diesel and turbine fuel at 99.8% efficiency. Protects HPCR injectors from corrosion and cavitation.' },
  'cooltech':         { system: 'Cooling System', metric: 'SCA dosing · liner cavitation prevention', short: 'Supplemental Coolant Additive release technology preventing liner pitting and scale in diesel engine cooling circuits.' },
  'drycore':          { system: 'Compressed Air', metric: 'ISO 8573-1 Class 1–2 dew point', short: 'Molecular sieve desiccant system. Removes moisture from compressed air preventing valve icing, seal degradation, and corrosion.' },
  'duratech':         { system: 'Fleet Maintenance', metric: 'OEM-interchangeable kit system', short: 'Fleet maintenance standardisation consolidating OEM-interchangeable filtration into master kits for mixed-fleet operations.' },
  'intekcore':        { system: 'Air Intake', metric: 'Zero-bypass · radial seal housing', short: 'High-pressure filter housing architecture delivering zero-bypass performance under peak system pressure in heavy-duty machinery.' },
  'macrocore':        { system: 'Air Intake', metric: '99.9–99.98% · ISO 5011 · 62 PSI', short: 'Progressive Density Gradient multi-layer air filtration. Handles dust concentrations up to 10,000 mg/m³ in mining and construction.' },
  'marineclean':      { system: 'Marine / Offshore', metric: 'IMO certified · ASTM B117', short: 'Salt-resistant filtration with epoxy brine-rejection coating for fuel and lube systems aboard vessels and offshore platforms.' },
  'microkappa':       { system: 'Cabin Protection', metric: 'Up to 85% PM2.5 reduction', short: 'Electrostatic cabin air filtration combining HEPA-grade particle capture and activated carbon against diesel exhaust particulate.' },
  'nanoforce':        { system: 'Hydraulic', metric: 'ISO 4406 16/14/11 · 200–450 bar', short: 'Multi-layer hydraulic architecture for high-pressure circuits. Sub-micron contamination interception protecting proportional valves.' },
  'syntepore':        { system: 'Air Intake', metric: 'ISO 5011 · moisture-resistant', short: 'All-synthetic air intake for high-humidity, coastal, and marine environments where cellulose media would degrade.' },
  'syntrax':          { system: 'Lubrication', metric: 'ISO 4406 16/14/11 · soot >2%', short: 'Synthetic lubrication protection maintaining ISO cleanliness codes through extended drain intervals for diesel and dual-fuel engines.' },
};

const SYSTEM_GROUPS = [
  {
    label: 'Air Intake',
    techs: ['macrocore', 'syntepore', 'intekcore'],
  },
  {
    label: 'Fuel Cleanliness',
    techs: ['aquaguard', 'aquaguard-series'],
  },
  {
    label: 'Lubrication',
    techs: ['syntrax'],
  },
  {
    label: 'Hydraulic',
    techs: ['nanoforce'],
  },
  {
    label: 'Compressed Air',
    techs: ['drycore'],
  },
  {
    label: 'Cooling System',
    techs: ['cooltech'],
  },
  {
    label: 'Cabin Protection',
    techs: ['microkappa'],
  },
  {
    label: 'Marine & Offshore',
    techs: ['marineclean'],
  },
  {
    label: 'Fleet Maintenance',
    techs: ['duratech'],
  },
];

function TechCard({ tech, index }: { tech: (typeof catalogue.technologies)[number]; index: number }) {
  const slug = getSlug(tech.name);
  const meta = GEO_DEFINITIONS[slug];
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/technologies/${slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            height: '100%',
            padding: '2rem',
            background: hovered ? 'rgba(255,241,45,0.03)' : '#050505',
            border: `1px solid ${hovered ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.06)'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            transition: 'background 0.3s ease, border-color 0.3s ease',
            cursor: 'pointer',
          }}
        >
          {/* System label */}
          {meta && (
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              color: hovered ? '#FFF12D' : 'rgba(255,241,45,0.45)',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
            }}>
              {meta.system}
            </span>
          )}

          {/* Technology name */}
          <h3 style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 600,
            fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
            margin: 0,
            transition: 'color 0.3s ease',
          }}>
            {tech.title || tech.name}
          </h3>

          {/* Short description */}
          <p style={{
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 400,
            fontSize: '0.82rem',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.45)',
            margin: 0,
            flexGrow: 1,
          }}>
            {meta?.short || tech.description}
          </p>

          {/* Metric chip */}
          {meta?.metric && (
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: 'rgba(255,241,45,0.6)',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: '1rem',
            }}>
              {meta.metric}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: hovered ? '#FFF12D' : 'rgba(255,255,255,0.25)',
              transition: 'color 0.3s ease',
            }}>
              Explore architecture
            </span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke={hovered ? '#FFF12D' : 'rgba(255,255,255,0.25)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transition: 'stroke 0.3s ease, transform 0.3s ease', transform: hovered ? 'translateX(3px)' : 'none' }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function TechnologiesPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the difference between MACROCORE™ and SYNTEPORE™?',
        acceptedAnswer: { '@type': 'Answer', text: 'MACROCORE™ uses Progressive Density Gradient media — multi-layer cellulose-synthetic composite at 99.9–99.98% efficiency (ISO 5011) for dust concentrations up to 10,000 mg/m³. SYNTEPORE™ is all-synthetic for high-humidity, coastal, and marine environments where moisture would degrade cellulose media.' },
      },
      {
        '@type': 'Question',
        name: 'Which architecture protects HPCR diesel injection systems?',
        acceptedAnswer: { '@type': 'Answer', text: 'AQUAGUARD™ delivers 99.8% free water removal and 95% emulsified water reduction for HPCR systems at 1,800–2,500 bar. Injector needle clearances of 1–3 µm make water above 200 ppm the primary failure mechanism.' },
      },
      {
        '@type': 'Question',
        name: 'What ISO standards govern these protection architectures?',
        acceptedAnswer: { '@type': 'Answer', text: 'MACROCORE™/SYNTEPORE™: ISO 5011. AQUAGUARD™: ASTM D6304 / SAE J1488. SYNTRAX™: ISO 4406 cleanliness codes. NANOFORCE™: ISO 16889 Beta ratio / ISO 4406. DRYCORE™: ISO 8573-1 Class 1–2.' },
      },
    ],
  };

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── PAGE HERO ── */}
      <section style={{ padding: '10rem 7% 5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.22em',
            color: 'rgba(255,241,45,0.7)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          Protection architectures · 9 technologies
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
              Nine proprietary<br />
              <span style={{ fontWeight: 600, color: '#FFF12D' }}>protection architectures.</span><br />
              One contamination strategy.
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
              Each ELIMFILTERS technology targets a specific contamination domain — air intake, fuel cleanliness, lubrication, hydraulic, compressed air, cooling, or cabin. Every architecture is defined by its contamination target, failure mechanism it prevents, and the ISO standard it addresses.
            </p>
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {[
                { val: '9', label: 'Architectures' },
                { val: '7', label: 'Domains' },
                { val: 'ISO', label: 'Certified' },
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

      {/* ── TECHNOLOGIES GRID ── */}
      <section style={{ padding: '5rem 7%' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {SYSTEM_GROUPS.map((group) => {
            const techs = catalogue.technologies.filter(t => {
              const slug = getSlug(t.name);
              return group.techs.includes(slug);
            });
            if (techs.length === 0) return null;
            return (
              <div key={group.label} style={{ marginBottom: '4rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.62rem',
                    letterSpacing: '0.2em',
                    color: 'rgba(255,241,45,0.6)',
                    textTransform: 'uppercase',
                  }}>
                    {group.label}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1px',
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  {techs.map((tech, i) => (
                    <TechCard key={tech.name} tech={tech} index={i} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Techs not in any group — catch-all */}
          {(() => {
            const allGrouped = SYSTEM_GROUPS.flatMap(g => g.techs);
            const ungrouped = catalogue.technologies.filter(t => !allGrouped.includes(getSlug(t.name)));
            if (ungrouped.length === 0) return null;
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', letterSpacing: '0.2em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase' }}>Other Systems</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                  {ungrouped.map((tech, i) => <TechCard key={tech.name} tech={tech} index={i} />)}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── COMPARISON QUICK TABLE ── */}
      <section style={{ padding: '5rem 7%', background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '3rem' }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.22em', color: 'rgba(255,241,45,0.7)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Quick reference
            </p>
            <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>
              Architecture comparison
            </h2>
          </motion.div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"Space Grotesk", sans-serif', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,241,45,0.2)' }}>
                  {['Technology', 'Domain', 'Key metric', 'Industries'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'rgba(255,241,45,0.6)', textTransform: 'uppercase', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catalogue.technologies.map((tech, i) => {
                  const slug = getSlug(tech.name);
                  const meta = GEO_DEFINITIONS[slug];
                  return (
                    <tr key={slug} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <Link href={`/technologies/${slug}`} style={{ color: '#fff', fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                          {tech.title || tech.name}
                        </Link>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                        {meta?.system || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,241,45,0.7)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                        {meta?.metric || '—'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {tech.features?.slice(0, 2).join(' · ') || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
