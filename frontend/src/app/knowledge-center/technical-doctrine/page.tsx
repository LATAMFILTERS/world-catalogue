'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const ENGINEERING_PILLARS = [
  {
    id: '01',
    title: 'Asset Protection Engineering',
    description: 'Engineering discipline that prioritizes equipment reliability through contamination control system design — not product selection, but system design. Every decision traces from contamination source through asset degradation mechanism to protection technology.',
  },
  {
    id: '02',
    title: 'Contamination Control',
    description: 'Applied science of identifying, measuring, and preventing ingestion, generation, and transmission of contaminants in mechanical systems. Contamination classified by type: particulate, moisture, chemical, biological, thermal.',
  },
  {
    id: '03',
    title: 'Reliability Engineering',
    description: 'FMEA applied to filtration systems. Contamination control as the primary lever for extending MTBF. The relationship between ISO cleanliness code and bearing life: a system at ISO 16/14/11 achieves 3–5× the bearing life of the same system at ISO 19/17/14.',
  },
];

const TECHNOLOGY_REGISTRY = [
  { name: 'MACROCORE™', domain: 'Air Intake Protection', standards: 'ISO 5011 · SAE J726', target: 'Airborne particulate — silica, carbon, grain dust', efficiency: '≥99.5% gravimetric' },
  { name: 'MICROKAPPA™', domain: 'Cabin Air Protection', standards: 'ISO 11155-1/2 · DIN 71220 · ISO 16890', target: 'PM₂.₅, PM₁.₀, VOCs, NO₂', efficiency: '≥95% at PM₂.₅' },
  { name: 'SYNTEPORE™', domain: 'Fuel Cleanliness — HPCR', standards: 'ASTM D6304 · ISO 12937 · ISO 16332', target: 'Particles >4 µm threatening injector needles', efficiency: 'β₄(c) ≥ 200' },
  { name: 'SYNTRAX™', domain: 'Lubrication Protection', standards: 'ISO 16889 · ISO 4406 · ISO 4548-12', target: 'Metallic wear debris, silica, soot in engine oil', efficiency: 'β₁₀(c) ≥ 200' },
  { name: 'NANOFORCE™', domain: 'Hydraulic Protection', standards: 'ISO 16889 · NFPA T2.14 · ISO 4406', target: 'Particles 5–15 µm causing valve spool stiction', efficiency: 'β₁₀(c) ≥ 200' },
  { name: 'THERMACORE™', domain: 'Cooling System SCA', standards: 'ASTM D6210 · ASTM D3306', target: 'Silicate depletion, cavitation erosion, corrosion', efficiency: 'Linear SCA release at rated flow' },
  { name: 'HYDROCORE™', domain: 'Fuel Water Separation', standards: 'ASTM D6304 · ISO 12937 · ISO 16332', target: 'Free and emulsified water in diesel fuel', efficiency: '≥96% water separation (ISO 16332)' },
  { name: 'DRYCORE™', domain: 'Compressed Air Systems', standards: 'ISO 8573-1/2/3 · ISO 12500 · ISO 7183', target: 'Liquid water, oil aerosol, oil vapor, particles', efficiency: 'Per ISO 8573-1 class specification' },
  { name: 'INTEKCORE™', domain: 'Air Intake Housing', standards: 'ISO 5011 · SAE J1042', target: 'System integration, pre-cleaning, restriction monitoring', efficiency: 'Application-specific' },
];

const PROTECTION_SYSTEMS = [
  {
    id: '01',
    name: 'Air Intake Protection',
    threat: 'Airborne particulate — silica (7 Mohs hardness) causes abrasive cylinder liner wear at >5 µm',
    target: '≥99.5% gravimetric efficiency (ISO 5011)',
    standards: ['ISO 5011', 'SAE J726'],
    technology: 'MACROCORE™',
  },
  {
    id: '02',
    name: 'Fuel Cleanliness Protection',
    threat: 'Hard particles >4 µm and free water in HPCR fuel damage injector needle seats (0.5–2 µm clearance)',
    target: 'ISO 12/10/8 cleanliness target',
    standards: ['ASTM D6304', 'ISO 12937', 'ISO 16332'],
    technology: 'SYNTEPORE™ + HYDROCORE™ + TURBOCORE™',
  },
  {
    id: '03',
    name: 'Lubrication Protection',
    threat: 'Particles 5–40 µm cause abrasive bearing wear, reducing life from 15,000+ hours to 2,000–3,000 hours',
    target: 'ISO 16/14/11 cleanliness code',
    standards: ['ISO 16889', 'ISO 4406'],
    technology: 'SYNTRAX™',
  },
  {
    id: '04',
    name: 'Hydraulic Protection',
    threat: 'Particles 5–15 µm cause proportional valve spool stiction and servo valve instability',
    target: 'ISO 16/14/11 to ISO 14/12/9 (valve-dependent)',
    standards: ['ISO 16889', 'NFPA T2.14', 'ISO 4406'],
    technology: 'NANOFORCE™',
  },
  {
    id: '05',
    name: 'Cooling System Protection',
    threat: 'Silicate depletion → scale → hot spots → head gasket failure; cavitation erosion in wet-liner engines',
    target: 'SCA nitrite 1,500–2,500 ppm; pH 8.5–10.5',
    standards: ['ASTM D6210', 'ASTM D3306'],
    technology: 'THERMACORE™',
  },
  {
    id: '06',
    name: 'Cabin Air Protection',
    threat: 'Respirable silica (OEL 0.025 mg/m³), PM₂.₅, VOCs, NO₂ threatening operator health',
    target: '≥95% PM₂.₅ efficiency (ISO 11155-1)',
    standards: ['ISO 11155-1', 'ISO 11155-2', 'DIN 71220'],
    technology: 'MICROKAPPA™',
  },
  {
    id: '07',
    name: 'Compressed Air Protection',
    threat: 'Liquid water, oil aerosol, oil vapor causing pneumatic valve failure and process contamination',
    target: 'ISO 8573-1 Class per application (typically 1:4:1)',
    standards: ['ISO 8573-1', 'ISO 8573-2', 'ISO 8573-3'],
    technology: 'DRYCORE™',
  },
];

const TESTING_STANDARDS = [
  { code: 'ISO 16889', scope: 'Hydraulic filter multi-pass Beta ratio test. Determines β_x(c) filtration ratio for fluid filter elements.' },
  { code: 'ISO 5011', scope: 'Air intake filter performance: efficiency (gravimetric), dust holding capacity, initial and terminal restriction.' },
  { code: 'SAE J1858', scope: 'Cabin air filter performance test using ASHRAE dust, KCl aerosol, and biological challenge aerosols.' },
  { code: 'ISO 4406', scope: 'Three-number particle cleanliness code for hydraulic and lubricating fluids: ≥4 µm(c) / ≥6 µm(c) / ≥14 µm(c).' },
  { code: 'NAS 1638', scope: 'Aerospace-origin contamination classification by five particle size ranges per 100 mL. Persists in legacy industrial specifications.' },
  { code: 'ISO 29463', scope: 'HEPA/ULPA filter classification (H10–U17) and sodium flame test at most penetrating particle size (MPPS).' },
  { code: 'ISO 11171', scope: 'Calibration of automatic particle counters using NIST-traceable reference material. Sizes denoted µm(c).' },
];

const FAILURE_MODES = [
  { mode: 'Collapse', consequence: 'Effective filtration area → zero', cause: 'ΔP exceeds collapse rating — overdue service, bypass valve failure, pressure spike without adequate liner' },
  { mode: 'Bypass (unintended)', consequence: 'Zero filtration despite intact element', cause: 'Seal extrusion, missing seal, cracked housing, double-gasket installation' },
  { mode: 'Improper Installation', consequence: 'Variable — from partial to full bypass', cause: 'Cross-threading, incorrect torque, inverted element, wrong part application' },
  { mode: 'Seal Failure', consequence: 'Contamination bypass at seal interface', cause: 'Extrusion, compression set, chemical attack, rolled or pinched seal' },
  { mode: 'Media Failure', consequence: 'Particle bypass at failure point', cause: 'Pressure spike, chemical attack, delamination, manufacturing pinhole' },
  { mode: 'Water Ingress', consequence: 'Microbial growth, injector damage, bearing corrosion, emulsification', cause: 'Condensation, tank venting, coolant cross-contamination, fuel water content' },
];

const INDUSTRIES = [
  { name: 'Mining', exposure: 'EXTREME', systems: 'Air · Fuel · Hydraulic · Cabin', tech: 'MACROCORE™ · SYNTEPORE™ · NANOFORCE™ · MICROKAPPA™' },
  { name: 'Construction', exposure: 'HIGH', systems: 'Air · Hydraulic · Lube Oil', tech: 'MACROCORE™ · NANOFORCE™ · SYNTRAX™' },
  { name: 'Agriculture', exposure: 'HIGH seasonal', systems: 'Air · Cabin · Hydraulic', tech: 'MACROCORE™ · MICROKAPPA™ · NANOFORCE™' },
  { name: 'Manufacturing', exposure: 'MEDIUM', systems: 'Compressed Air · Hydraulic', tech: 'DRYCORE™ · NANOFORCE™' },
  { name: 'Marine', exposure: 'MEDIUM-HIGH', systems: 'Fuel · Hydraulic · Lube Oil', tech: 'HYDROCORE™ · SYNTEPORE™ · NANOFORCE™' },
  { name: 'Truck Fleets', exposure: 'HIGH vocational', systems: 'Lube Oil · Fuel · Air', tech: 'SYNTRAX™ · SYNTEPORE™ · MACROCORE™' },
  { name: 'Oil & Gas', exposure: 'HIGH', systems: 'Compressed Air · Hydraulic · Lube Oil', tech: 'DRYCORE™ · NANOFORCE™ · SYNTRAX™' },
  { name: 'Power Generation', exposure: 'HIGH', systems: 'Air · Lube Oil · Fuel', tech: 'MACROCORE™ · SYNTRAX™ · HYDROCORE™' },
];

const EXPOSURE_COLORS: Record<string, string> = {
  'EXTREME': '#ef4444',
  'HIGH': '#f97316',
  'HIGH seasonal': '#f97316',
  'HIGH vocational': '#f97316',
  'MEDIUM-HIGH': '#eab308',
  'MEDIUM': '#84cc16',
};

export default function TechnicalDoctrinePage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem clamp(1.5rem, 4vw, 4rem)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/knowledge-center" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Knowledge Center</Link>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>Technical Doctrine</span>
        </div>
      </div>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(160deg, #060a08 0%, #000 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '1rem' }}>
            TECHNICAL DOCTRINE · v1.0 · 2026-06-28
          </motion.p>

          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}
            style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            ELIMFILTERS® Technical<br />Doctrine Master v1.0
          </motion.h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
            style={{ borderLeft: '3px solid #FFF12D', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '1.05rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.85)' }}>
              The engineering foundation of the ELIMFILTERS® ecosystem. Defines contamination control principles, technology specifications, system design requirements, and validation standards across all protection domains.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
            style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>VAULT REFERENCE</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>elimfilters-vault/technical/ELIMFILTERS_TECHNICAL_DOCTRINE_MASTER.md</p>
            </div>
            <div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>CROSS-REFERENCE</p>
              <Link href="/knowledge-center/commercial-doctrine" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', textDecoration: 'none' }}>
                Commercial Architecture Master v2.0 →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Engineering Decision Hierarchy */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem' }}>
            00 / ENGINEERING DECISION HIERARCHY
          </p>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {[
              'Contamination Source',
              'Asset Degradation Mechanism',
              'Measurement Standard',
              'Protection Technology',
              'Product Implementation',
              'Validation',
              'Field Monitoring',
            ].map((step, i, arr) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  style={{
                    background: i === 0 ? 'rgba(255,241,45,0.12)' : 'rgba(255,255,255,0.03)',
                    border: i === 0 ? '1px solid rgba(255,241,45,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    padding: '0.6rem 0.9rem',
                    textAlign: 'center',
                  }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.2rem' }}>{String(i + 1).padStart(2, '0')}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: i === 0 ? '#FFF12D' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{step}</p>
                </motion.div>
                {i < arr.length - 1 && (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', padding: '0 0.3rem', flexShrink: 0 }}>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 4rem)' }}>

        {/* Engineering Philosophy */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            02 / ENGINEERING PHILOSOPHY
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {ENGINEERING_PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                style={{ background: '#000', padding: '2rem', borderTop: '3px solid #FFF12D' }}
              >
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: '#FFF12D', marginBottom: '0.5rem' }}>{pillar.id}</p>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: '0.75rem', lineHeight: 1.3 }}>{pillar.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textAlign: 'justify' }}>{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technology Registry */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            16 / TECHNOLOGY REGISTRY
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '0.5rem' }}>
            {TECHNOLOGY_REGISTRY.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{
                  border: '1px solid rgba(255,255,255,0.07)',
                  padding: '1.25rem 1.5rem',
                  background: 'rgba(255,255,255,0.01)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#FFF12D' }}>{tech.name}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textAlign: 'right', maxWidth: '120px', lineHeight: 1.4 }}>{tech.domain}</p>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{tech.target}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,241,45,0.5)' }}>{tech.efficiency}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)' }}>{tech.standards.split(' · ')[0]}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Protection Systems */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            15 / SYSTEMS ENGINEERING — 7 PROTECTION DOMAINS
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
            {PROTECTION_SYSTEMS.map((sys, i) => (
              <motion.div
                key={sys.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                style={{
                  background: '#000',
                  padding: '1.25rem 1.75rem',
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr',
                  gap: '1.5rem',
                  alignItems: 'start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: '#FFF12D', opacity: 0.6 }}>{sys.id}</span>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{sys.name}</p>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{sys.threat}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.25rem' }}>TARGET</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#FFF12D' }}>{sys.target}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                    {sys.standards.map((s) => (
                      <span key={s} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.07)', padding: '0.15rem 0.4rem' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.25rem' }}>TECHNOLOGY</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.7)', lineHeight: 1.5 }}>{sys.technology}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testing Standards + Failure Modes (two-column) */}
        <section style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '3rem' }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              14 / TESTING & VALIDATION STANDARDS
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {TESTING_STANDARDS.map((std) => (
                <motion.div key={std.code}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                  style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem 1rem', display: 'flex', gap: '0.875rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', fontWeight: 700, color: '#FFF12D', whiteSpace: 'nowrap', paddingTop: '0.05rem' }}>{std.code}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>{std.scope}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
              10 / FAILURE ANALYSIS — 6 MODES
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {FAILURE_MODES.map((fm, i) => (
                <motion.div key={fm.mode}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                  style={{ border: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.82rem', color: '#fff' }}>{fm.mode}</p>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.1rem 0.35rem', alignSelf: 'flex-start' }}>CRITICAL</span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, marginBottom: '0.25rem' }}>
                    <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Effect:</strong> {fm.consequence}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Cause:</strong> {fm.cause}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Matrix */}
        <section style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            17 / INDUSTRY ENGINEERING — 8 VERTICALS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
            {INDUSTRIES.map((ind, i) => (
              <motion.div
                key={ind.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '1.25rem 1.5rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{ind.name}</p>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.55rem',
                    color: EXPOSURE_COLORS[ind.exposure] || '#fff',
                    border: `1px solid ${EXPOSURE_COLORS[ind.exposure] || '#fff'}40`,
                    padding: '0.15rem 0.4rem',
                    whiteSpace: 'nowrap',
                  }}>{ind.exposure}</span>
                </div>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>SYSTEMS</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem' }}>{ind.systems}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', marginBottom: '0.2rem' }}>TECHNOLOGIES</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,241,45,0.55)', lineHeight: 1.6 }}>{ind.tech}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ISO Cleanliness Reference */}
        <section style={{ marginBottom: '4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
            06 / FLUID CLEANLINESS — ISO 4406 TARGET CODES
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.4rem' }}>
            {[
              { system: 'HPCR Fuel Injectors', target: '12/10/8', note: 'Needle clearance 0.5–2 µm' },
              { system: 'Hydraulic Servo Valves', target: '14/12/9', note: 'Highest sensitivity' },
              { system: 'Hydraulic Proportional Valves', target: '16/14/11', note: 'Spool clearance 5–15 µm' },
              { system: 'Engine Lube (System Approach)', target: '16/14/11', note: 'ELIMFILTERS® target' },
              { system: 'Engine Lube (Standard)', target: '19/17/14', note: 'Industry typical' },
              { system: 'Fixed Hydraulic (Gear Pump)', target: '18/16/13', note: 'Tolerant geometry' },
              { system: 'Marine Diesel Lube', target: '17/15/12', note: 'Per ISO 8217' },
              { system: 'Turbine Oil (Servo Governor)', target: '14/12/9', note: 'Speed regulation critical' },
            ].map((item) => (
              <div key={item.system} style={{ display: 'flex', flexDirection: 'column', padding: '0.875rem 1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.3rem' }}>{item.system}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.2rem' }}>{item.target}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Governance */}
        <section style={{
          background: 'rgba(255,241,45,0.03)',
          border: '1px solid rgba(255,241,45,0.12)',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.75rem' }}>
            19 / ENGINEERING DOCTRINE GOVERNANCE
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', textAlign: 'justify', marginBottom: '1rem' }}>
            Changes to this doctrine require a formal change request, technical review, cross-reference audit, impact assessment, Engineering Leadership authorization, version increment, and distribution to all stakeholders within 30 days. The company does not make engineering claims that exceed validated technical capability.
          </p>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)' }}>
            Source: elimfilters-vault/technical/ELIMFILTERS_TECHNICAL_DOCTRINE_MASTER.md · v1.0 · 2026-06-28
          </p>
        </section>

        {/* Cross-links */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/knowledge-center/engineering', label: 'ENGINEERING ARTICLES →' },
            { href: '/knowledge-center/standards', label: 'STANDARDS REFERENCE →' },
            { href: '/knowledge-center/systems', label: 'PROTECTION SYSTEMS →' },
            { href: '/knowledge-center/industries', label: 'INDUSTRY PROFILES →' },
            { href: '/knowledge-center/commercial-doctrine', label: 'COMMERCIAL DOCTRINE →' },
            { href: '/knowledge-center/search', label: 'KNOWLEDGE SEARCH →' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
                style={{ border: '1px solid rgba(255,255,255,0.07)', padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', transition: 'border-color 0.2s' }}>
                {label}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: 'ELIMFILTERS® Technical Doctrine Master v1.0 — Engineering Reference',
        description: 'Master technical doctrine defining contamination control engineering principles, technology specifications, system design requirements, validation standards, and industry engineering for all ELIMFILTERS® protection domains.',
        url: 'https://elimfilters.com/knowledge-center/technical-doctrine',
        author: { '@type': 'Organization', '@id': 'https://elimfilters.com/#organization', name: 'ELIMFILTERS' },
        about: { '@type': 'Thing', name: 'Industrial Filtration Engineering', description: 'Contamination control system design for air intake, fuel, lubrication, hydraulic, cooling, cabin, and compressed air protection.' },
        mentions: {
          standards: ['ISO 16889', 'ISO 5011', 'ISO 4406', 'NAS 1638', 'ISO 29463', 'SAE J1858', 'ISO 11171', 'ISO 8573-1', 'ASTM D6304', 'ISO 12937', 'DIN 71220'],
          technologies: ['MACROCORE', 'MICROKAPPA', 'SYNTEPORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE', 'HYDROCORE', 'DRYCORE', 'INTEKCORE'],
          industries: ['Mining', 'Construction', 'Agriculture', 'Manufacturing', 'Marine', 'Truck Fleets', 'Oil & Gas', 'Power Generation'],
        },
      })}} />
    </main>
  );
}
