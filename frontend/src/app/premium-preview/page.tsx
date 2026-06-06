'use client';

import { motion } from 'motion/react';

interface Tech {
  system: string;
  name: string;
  subtitle: string;
  spec: string;
  asset: string;
}

const TECHS: Tech[] = [
  {
    system: 'SYSTEM 01 / AIR INTAKE FILTRATION',
    name: 'MACROCORE',
    subtitle: 'Depth-loading cellulose-synthetic composite media engineered for high-dust industrial environments.',
    spec: 'Beta10(c) >= 200 / 18 micron absolute',
    asset: '/assets/logo-macrocore.png',
  },
  {
    system: 'SYSTEM 02 / CABIN AIR FILTRATION',
    name: 'MICROKAPPA',
    subtitle: 'Electrostatic fine-particle media controlling sub-micron dust and aerosols in operator cabins.',
    spec: 'PM2.5 capture > 99% / 0.3 micron efficiency',
    asset: '/assets/logo-microkappa.png',
  },
  {
    system: 'SYSTEM 03 / COMPRESSED AIR SYSTEMS',
    name: 'DRYCORE',
    subtitle: 'Coalescing and adsorption media controlling moisture and oil carryover in compressed air lines.',
    spec: 'Dew point control / ISO 8573-1 compliant',
    asset: '/assets/logo-drycore.png',
  },
  {
    system: 'SYSTEM 04 / AIR INTAKE FILTRATION',
    name: 'INTEKCORE',
    subtitle: 'Multi-stage intake protection architecture engineered for extreme dust-loading operating cycles.',
    spec: 'Dust holding capacity +40% vs commodity media',
    asset: '/assets/logo-intekcore.png',
  },
  {
    system: 'SYSTEM 05 / HYDRAULIC SYSTEMS',
    name: 'HYDROCORE',
    subtitle: 'High-collapse synthetic media controlling particle ingression in proportional valve circuits.',
    spec: 'ISO 16889 validated / Beta1000(c) >= 200',
    asset: '/images/Hihdrocore.avif',
  },
  {
    system: 'SYSTEM 06 / FUEL FILTRATION',
    name: 'SYNTEPORE',
    subtitle: 'Graded-density synthetic depth media controlling particulate and water in modern fuel systems.',
    spec: 'ASTM D6304 aligned / 4 micron nominal',
    asset: '/assets/logo-syntepore.png',
  },
  {
    system: 'SYSTEM 07 / LUBE OIL FILTRATION',
    name: 'SYNTRAX',
    subtitle: 'Active synthetic media construction with high dirt-holding capacity for extended service intervals.',
    spec: 'ISO 4406 target 16/14/11 / dP stability +stage life',
    asset: '/assets/logo-sintrax.png',
  },
  {
    system: 'SYSTEM 08 / LUBE OIL FILTRATION',
    name: 'NANOFORCE',
    subtitle: 'Sub-micron capture layer engineered to remove abrasive wear particles from engine and gearbox oils.',
    spec: 'Beta4(c) >= 1000 / 1 micron efficiency',
    asset: '/assets/logo-nanoforce.png',
  },
  {
    system: 'SYSTEM 09 / THERMAL PROTECTION SYSTEMS',
    name: 'THERMOCORE',
    subtitle: 'Heat-stable filtration architecture maintaining structural integrity across extreme thermal cycles.',
    spec: 'Operating range -40 deg C to 150 deg C',
    asset: '/images/Thermacore.avif',
  },
  {
    system: 'SYSTEM 10 / TURBOCHARGER PROTECTION',
    name: 'TURBOCORE',
    subtitle: 'Pre-compression intake protection layer designed to shield turbocharger assemblies from abrasive ingress.',
    spec: 'Particle ingress reduction / extended turbo service life',
    asset: '/assets/logo-elimfilters.png',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function PremiumPreviewPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* HERO */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 6vw, 4rem) clamp(3rem, 6vw, 5rem)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,241,45,0.06) 0%, transparent 60%)',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            letterSpacing: '0.22em',
            color: '#FFF12D',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}
        >
          // ASSET PROTECTION SYSTEMS - TECHNOLOGY ECOSYSTEM PREVIEW
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(2.2rem, 6vw, 4.2rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
            margin: 0,
          }}
        >
          Ten proprietary technologies. One contamination control architecture.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
            color: 'rgba(255,255,255,0.55)',
            maxWidth: '680px',
            marginTop: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          Each ELIMFILTERS technology is engineered against a specific contamination target,
          validated to ISO/SAE/ASTM standards, and mapped to a defined system in the asset
          protection hierarchy: contamination, asset degradation, standards and measurement,
          protection technologies, product implementation, fleet optimization.
        </motion.p>
      </section>

      {/* TECHNOLOGY GALLERY */}
      <section style={{ padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 6vw, 4rem) clamp(4rem, 8vw, 6rem)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            color: '#FFF12D',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '6px 14px',
            border: '1px solid rgba(255,241,45,0.35)',
            borderRadius: '2px',
            marginBottom: '2rem',
            background: 'rgba(255,241,45,0.04)',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFF12D', display: 'inline-block' }} />
          Technology Ecosystem
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}
        >
          {TECHS.map((tech, i) => (
            <motion.article
              key={tech.name}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp}
              whileHover={{ borderColor: 'rgba(255,241,45,0.35)', y: -4 }}
              transition={{ duration: 0.25 }}
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: '#000',
              }}
            >
              <div
                style={{
                  height: '220px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#000',
                  padding: '12px',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tech.asset}
                  alt={`${tech.name} logo`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: '#000',
                    padding: '12px',
                    opacity: 1,
                  }}
                />
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.65rem',
                    color: '#FFF12D',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                  }}
                >
                  {tech.system}
                </span>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    margin: 0,
                    lineHeight: 1.05,
                  }}
                >
                  {tech.name}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {tech.subtitle}
                </p>
                <span
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    marginTop: 'auto',
                    padding: '6px 14px',
                    background: 'rgba(255,241,45,0.07)',
                    border: '1px solid rgba(255,241,45,0.25)',
                    borderRadius: '3px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.7rem',
                    color: '#FFF12D',
                    letterSpacing: '0.06em',
                  }}
                >
                  {tech.spec}
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ASSET PROTECTION HIERARCHY STRIP */}
      <section
        style={{
          padding: 'clamp(3rem, 6vw, 4rem) clamp(1.5rem, 6vw, 4rem)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            letterSpacing: '0.2em',
            color: '#FFF12D',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}
        >
          // INFORMATION ARCHITECTURE
        </p>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {['Contamination', 'Asset Degradation', 'Standards & Measurement', 'Protection Technologies', 'Product Implementation', 'Fleet Optimization'].map(
            (step, idx, arr) => (
              <span key={step} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    padding: '6px 14px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '3px',
                  }}
                >
                  {step}
                </span>
                {idx < arr.length - 1 && <span style={{ color: '#FFF12D' }}>-&gt;</span>}
              </span>
            )
          )}
        </div>
      </section>

      {/* FOOTER NOTE */}
      <section style={{ padding: 'clamp(3rem, 6vw, 4rem) clamp(1.5rem, 6vw, 4rem)' }}>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.4)',
            maxWidth: '680px',
            lineHeight: 1.6,
          }}
        >
          ELIMFILTERS(R) Industrial Asset Protection - This is a visual preview build of the
          technology ecosystem layout, referencing the approved gallery mockup. Specifications
          shown are representative system targets, not warranty statements.
        </p>
      </section>
    </main>
  );
}
