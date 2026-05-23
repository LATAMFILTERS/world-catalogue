'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ISO 8573-1', desc: 'Compressed air purity classes (0-9) defining maximum particle, water, and oil content limits for different industrial applications.' },
  { code: 'ISO 8573-2', desc: 'Measurement methods for water content (dew point) in compressed air using electrochemical sensors and Karl Fischer titration.' },
  { code: 'ISO 8573-3', desc: 'Measurement methods for oil content and oil vapor in compressed air using gravimetric and chromatographic analysis.' },
];

const FAQS = [
  { q: 'What is the difference between dew point and water content ppm in compressed air?', a: 'Dew point is the temperature at which air becomes saturated with moisture and water condenses. Compressed air dew point typically ranges from -40°C (ISO Class 2) to +3°C (ISO Class 7). Dew point specification is more critical than ppm because compressed air warms as it travels through distribution systems, and warm air can hold more moisture without condensation. A -40°C dew point air will remain dry throughout most industrial systems without condensation risk.' },
  { q: 'Why do pneumatic instruments require ISO Class 4 compressed air instead of Class 7?', a: 'Pneumatic control instruments (proportional solenoid valves, precision regulators) require tight tolerances (10-20 micron clearances) similar to hydraulic proportional valves. Class 4 compressed air (16 micron particles, -25°C dew point, 0.1 mg/m³ oil) prevents valve stiction and spool deposits. Class 7 air (40 micron particles, +3°C dew point) allows water condensation under temperature changes, causing corrosion and valve freezing in cold climates.' },
  { q: 'How does oil vapor contamination enter compressed air systems?', a: 'Rotary screw and reciprocating compressors inject oil into the compression chamber for lubrication. Oil is emulsified in compressed air discharge. Oil separator elements remove 99% of liquid oil, but oil vapor (5-10 mg/m³) passes through separators. Only activated carbon filters achieve Class 2 oil vapor limits. High-quality separators with coalescent elements reduce oil to 1-2 mg/m³, acceptable for most industrial pneumatics.' },
  { q: 'What maintenance is required for compressed air dryers and filters?', a: 'Dryer cartridge replacement typically occurs every 12 months in normal industrial environments, more frequently in humid climates. Filter element service intervals depend on compressor air flow and ambient dust contamination - typically 3000-5000 service hours. Both dryness and particle content must be monitored via periodic purity sampling to verify system compliance with ISO classification targets.' },
];

const RELATED_SYSTEMS = [
  { code: 'HYD', title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
];

export default function CompressedAirSystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      <section style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85 }}>// INDUSTRIAL STANDARDS · COMPRESSED AIR</p>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem' }}>Compressed Air Systems</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
            Pneumatic system filtration and drying protecting instrument precision against particle contamination, water condensation, and oil vapor that cause valve stiction and performance degradation in control and automation systems.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Compressed Air Purity Systems</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Compressed air systems transport power and control signals throughout industrial facilities. Unlike hydraulic and fuel systems that are closed-loop circuits, compressed air systems exhaust to atmosphere, creating continuous filtration demand. Compressed air leaving the compressor contains particles, water vapor, and oil vapor that must be removed to specified ISO purity classes before reaching precision pneumatic instruments.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            ISO 8573 defines 10 purity classes ranging from 0 (ultra-pure research grade) to 9 (unfiltered compressor discharge). Most industrial pneumatics operate at Class 4 (particle/water/oil specified) to Class 7. Control instruments and proportional solenoid valves require Class 3-4 air to avoid stiction and reliability issues.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION SOURCES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination Pathways in Pneumatics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Compressor Oil Carryover', desc: 'Rotary screw and reciprocating compressors inject oil for lubrication, creating 5-10 mg/m³ oil in discharge air. Oil separators remove 99% of liquid oil; activated carbon captures oil vapor.' },
              { title: 'Water Vapor Condensation', desc: 'Compressed air exits the compressor saturated with water vapor. As air travels through cooler distribution pipes, water condenses and pools in low points, corroding pipes and freezing valve spools in winter.' },
              { title: 'Atmospheric Dust Ingestion', desc: 'Air intake filters on compressors remove large particles but allow 1-5 micron particles to pass through and be concentrated 10x by compression ratio.' },
              { title: 'Pipe Corrosion Byproducts', desc: 'Rust and scale from corroded carbon steel pipes become particulate contaminants, depositing in valve spools and blocking precision orifices.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'start' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D' }}>{std.code}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / SYSTEM DESIGN CONSIDERATIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Three-Stage Treatment', body: 'Coarse filter (5-10 micron) removes large particles, water separator removes free water, fine filter (1-3 micron) provides final particle protection before dryer.' },
              { title: 'Desiccant Dryer Selection', body: 'Regenerative desiccant dryers achieve -40°C dew point via silica gel or molecular sieve regeneration. Refrigerant dryers achieve -3°C to +3°C dew point via chilling. Instrument applications typically use regenerative for reliability.' },
              { title: 'Condensation Management', body: 'Distribution pipes should slope toward drains and low-point ball drains should be installed to prevent water pooling and pipe corrosion.' },
              { title: 'Purity Verification', body: 'Annual ISO 8573 purity audits via particle counting, dew point measurement, and oil content testing verify system compliance with application requirements.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>// EXPLORE OTHER FILTRATION SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em' }}>{sys.code}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.title}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
