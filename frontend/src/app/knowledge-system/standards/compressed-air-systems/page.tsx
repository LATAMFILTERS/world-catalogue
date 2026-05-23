'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ISO 8573-1', desc: 'Compressed air purity classification system (Classes 0-9) defining maximum particle concentration, water content (dew point), and oil content for different industrial applications.' },
  { code: 'ISO 8573-2', desc: 'Measurement methods for water vapor content and dew point in compressed air systems using electrochemical sensors, chilled mirror hygrometers, and Karl Fischer titration.' },
  { code: 'ISO 8573-3', desc: 'Measurement methods for oil content and oil vapor concentration in compressed air using gravimetric analysis and flame ionization detection (FID) chromatography.' },
  { code: 'ISO 8573-4', desc: 'Particle measurement methods for compressed air including particle counters and gravimetric mass concentration measurement in accordance with purity classification procedures.' },
];

const TECHNOLOGIES = [
  {
    name: 'NANOFORCE',
    slug: 'nanoforce',
    role: 'Nano-fiber coalescent media achieving ISO 8573-1 Class 1-2 particle removal at rated flow conditions, capturing sub-micron aerosols and oil mist before downstream instrumentation.',
  },
  {
    name: 'AQUAGUARD',
    slug: 'aquaguard-series',
    role: 'Coalescing element technology engineered for water and oil aerosol separation in compressed air distribution, achieving bulk liquid removal and maintaining dew point stability across operating pressure ranges.',
  },
];

const OPERATIONAL_IMPACTS = [
  { metric: 'ISO 0-2', unit: 'Purity', label: 'Target air class for precision pneumatic instruments and proportional solenoid valves' },
  { metric: '5-10', unit: 'mg/m3', label: 'Oil carryover from unfiltered rotary screw compressor discharge' },
  { metric: '-40°C', unit: 'Dew Point', label: 'Dew point target for Class 2 instrument-grade compressed air' },
  { metric: '10-20', unit: 'micron', label: 'Proportional valve clearances vulnerable to particle contamination and stiction' },
];

const FAQS = [
  {
    q: 'What is the difference between dew point and water content ppm in compressed air?',
    a: 'Dew point is the temperature at which air becomes saturated with moisture and water begins condensing. Compressed air dew point ranges from -70°C (ISO Class 1) to +10°C (ISO Class 9, unprocessed). Water content expressed as ppm by volume is mathematically derived from dew point and operating pressure. Dew point specification is more operationally relevant because compressed air warms as it travels from compressor to end-use point - and warming air can carry more moisture without condensing. A -40°C dew point compressed air supply will remain dry throughout most industrial distribution systems even when supply pipes reach ambient temperature, while a -3°C dew point supply will condense water in any distribution pipe below 0°C ambient.',
  },
  {
    q: 'Why do pneumatic instruments require ISO Class 3-4 air while general pneumatics use Class 6-7?',
    a: 'Pneumatic control instruments (proportional solenoid valves, precision regulators, electro-pneumatic positioners) have spool and bore clearances of 10-20 microns - similar to hydraulic proportional valves. Class 4 compressed air (particle limit: 15 microns, dew point: -3°C, oil: 5 mg/m3) prevents valve stiction and spool deposits. Class 7 air (40 micron particles, +10°C dew point, 25 mg/m3 oil) allows water condensation in temperature-cycled environments, causing internal corrosion and freeze-sticking of valve spools during cold weather. A single valve failure in a proportional control system can shut down an entire process line, making the cost differential for Class 3-4 filtration trivial relative to unplanned downtime.',
  },
  {
    q: 'How does oil vapor contamination enter compressed air systems if separators are installed?',
    a: 'Rotary screw compressors inject oil into the compression chamber at 1-3 bar oil pressure. Compressed discharge air exits at 5-15 bar with emulsified oil at 5-10 mg/m3. Integrated oil separator elements (coalescing design) remove 99% of liquid oil droplets and bulk oil mist, reducing residual to 1-3 mg/m3. However, oil vapor that has evaporated into true vapor phase cannot be captured by coalescing filters - vapor molecules are smaller than filter media pores. Only activated carbon adsorption achieves vapor-phase oil removal below 0.01 mg/m3 (ISO Class 1 oil content). Most industrial instrument applications require activated carbon filtration downstream of coalescent filtration for full ISO Class 2-3 compliance.',
  },
  {
    q: 'What maintenance is required to maintain ISO 8573-1 compliance over time?',
    a: 'Compressed air purity degrades progressively as filter elements load with oil, water, and particles. Coalescing filter elements typically require replacement every 8000-12000 service hours (or annually) depending on compressor oil carryover rate and operating conditions. Activated carbon beds saturate based on oil vapor load - typically 6-12 months at industrial compressor discharge levels. Desiccant dryer beds lose capacity as silica gel or molecular sieve adsorption sites fill with water over regeneration cycles. ISO 8573 compliance should be verified by third-party purity testing at 12-month intervals using the measurement methods defined in ISO 8573-2 through ISO 8573-6 for each contaminant class.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'HYD', title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
  { code: 'LUBE', title: 'Lube / Oil Systems', href: '/knowledge-system/standards/lube-oil-systems' },
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

      <section style={{
        paddingTop: '8rem', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>// INDUSTRIAL STANDARDS · COMPRESSED AIR</p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>Compressed Air Systems</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Pneumatic system filtration and drying protecting precision instruments, actuators, and control valves from particle contamination, water condensation, and oil vapor that cause stiction, corrosion, and reliability failures in industrial automation systems.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Compressed Air Purity Domain</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Compressed air systems transport power and control signals throughout industrial facilities using pressurized air at 6-10 bar as the medium. Unlike hydraulic and fuel systems that operate as closed loops, compressed air systems discharge to atmosphere at each actuator cycle, requiring continuous atmospheric air intake and creating permanent contamination entry points. Air entering the compressor carries ambient particles, humidity, and atmospheric dust that concentrate approximately 7-10 times during compression, delivering elevated contamination to all downstream components.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            ISO 8573-1 defines 10 purity classes ranging from Class 0 (ultra-pure, customer-specified) to Class 9 (unprocessed compressor discharge). The standard separates particle content, water content (expressed as dew point), and oil content into independent classification axes - a system may meet Class 2 particle purity while only achieving Class 4 oil purity depending on treatment equipment. Industrial pneumatics commonly require Class 3-5 across all three axes; precision instruments and proportional control valves require Class 1-3.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination Pathways in Pneumatics</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                title: 'Compressor Oil Carryover',
                desc: 'Rotary screw and reciprocating compressors inject lubrication oil into the compression chamber, producing 5-10 mg/m3 oil in discharge air. Integrated separators remove bulk liquid oil, but oil vapor at 1-3 mg/m3 persists in the discharge stream and requires activated carbon downstream treatment to meet Class 1-2 oil limits.',
              },
              {
                title: 'Water Vapor Condensation',
                desc: 'Atmospheric air enters the compressor at 40-80% relative humidity. Compression raises dew point proportionally to compression ratio. At 7 bar (8:1 compression), atmospheric air at 20°C/60% RH exits the compressor with a dew point near +15°C. As this air cools in distribution pipes below 15°C, water condenses and accumulates in pipe low points, corroding distribution networks and freeze-sticking valve components.',
              },
              {
                title: 'Particulate Concentration',
                desc: 'Atmospheric dust entering the compressor intake concentrates 7-10 times during compression. Ambient air at 0.5 mg/m3 particle loading exits the compressor at 3.5-5 mg/m3. Sub-micron particles from compressor wear (carbon ring debris, valve seat particles) add metallic contamination that accelerates valve seat erosion in precision instruments.',
              },
              {
                title: 'Distribution Network Corrosion',
                desc: 'Carbon steel compressed air distribution pipes corrode internally when water condensate accumulates in low points without adequate auto-drain valves. Iron oxide and pipe scale particles dislodge during demand surges, delivering spikes of coarse metallic contamination that block precision orifices and damage valve seats.',
              },
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
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / OPERATIONAL IMPACT & COST</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination-Driven Failure Parameters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {OPERATIONAL_IMPACTS.map((impact) => (
              <div key={impact.metric} style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.4rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>{impact.metric}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.6)', marginBottom: '0.5rem' }}>{impact.unit}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{impact.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Proportional solenoid valves controlling process positioning and flow regulation are the highest-value components in compressed air distribution systems. A single proportional valve operating with Class 6-7 air when Class 3-4 is specified will experience oil deposit accumulation within 200-500 operating hours, causing positioning drift and eventually complete spool seizure. In continuous process facilities, a single stuck proportional valve triggers unplanned production shutdown with costs that exceed an entire facility's annual compressed air filtration maintenance budget.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Fluid Contamination Analysis</h2>
          <Link href="/knowledge-system/contamination/hydraulic-system" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Hydraulic System Contamination</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>Proportional valve contamination mechanisms in compressed air systems mirror hydraulic valve failure modes. The same particle sizing and valve spool clearance analysis used in hydraulic cleanliness specification directly informs compressed air purity class selection for pneumatic proportional controls.</p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>VIEW ANALYSIS →</span>
            </motion.div>
          </Link>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>06 / ELIMFILTERS TECHNOLOGIES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Filtration Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech) => (
              <Link key={tech.slug} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', height: '100%' }}>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D', marginBottom: '0.6rem' }}>{tech.name}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{tech.role}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>07 / SYSTEM DESIGN CONSIDERATIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              {
                title: 'Three-Stage Treatment Architecture',
                body: 'Standard compressed air treatment requires three sequential stages: coarse filtration (5-10 micron) for bulk particle removal, refrigerant or desiccant drying for water vapor control, and fine coalescing filtration (1-3 micron) for residual particle and oil removal. Applications requiring Class 1-2 oil purity add activated carbon as a fourth stage. Each stage must be sized for rated flow at operating pressure; undersized elements cause excessive pressure drop that increases compressor energy consumption.',
              },
              {
                title: 'Dryer Technology Selection',
                body: 'Refrigerant dryers achieve -3°C to +3°C pressure dew point by chilling air below dew point and draining condensate. They are energy-efficient but cannot achieve better than -3°C. Regenerative desiccant dryers (heatless or heated-purge) achieve -40°C to -70°C dew point using silica gel or molecular sieve. Instrument-quality air applications (Class 2) require regenerative desiccant dryers. Regenerative dryers consume 15-25% of compressed air flow for purge unless equipped with heated regeneration.',
              },
              {
                title: 'Auto-Drain Installation',
                body: 'Compressed air filter bowls collect liquid water and oil that must be discharged without allowing contaminated liquid to re-enter the air stream. Timer-operated or demand-sensing electronic drains prevent accumulation-induced contamination carryover. Solenoid drain valves should be tested monthly to verify free operation - a blocked drain is typically invisible until condensate carryover damages downstream instrumentation.',
              },
              {
                title: 'Point-of-Use Filtration',
                body: 'Distribution networks develop internal contamination independent of central filtration. Pipe corrosion, check valve wear, and condensate accumulation deliver particle spikes to instruments regardless of central treatment quality. Point-of-use filters (1-5 micron) installed at each instrument supply connection protect precision valves from distribution network contamination regardless of upstream system condition.',
              },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>08 / FREQUENTLY ASKED QUESTIONS</p>
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
