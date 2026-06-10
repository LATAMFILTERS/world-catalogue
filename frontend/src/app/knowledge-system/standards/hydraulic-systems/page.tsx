'use client';

import Link from 'next/link';
import { Breadcrumb } from '@/components/Breadcrumb';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const STANDARDS = [
  { code: 'ISO 16889', href: '/knowledge-system/standards/iso-16889', desc: '4-digit cleanliness code (16/14/11 minimum for proportional valves) defining particle concentration thresholds for hydraulic system protection.' },
  { code: 'NFPA T2.14', desc: 'Machine tool hydraulic fluids standard specifying ISO 18/16/13 minimum cleanliness for proportional control valve systems.' },
  { code: 'DIN 51524', desc: 'Hydraulic fluid specification defining viscosity grades, oxidation stability, and contamination tolerance limits for industrial systems.' },
  { code: 'ISO 4406', desc: 'Legacy particle count code applicable to older hydraulic equipment and for historical data compatibility.' },
];

const TECHNOLOGIES = [
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Electrostatic synthetic media achieving 99.9% efficiency for proportional valve protection, maintaining ISO 16/14/11 cleanliness under high-flow conditions.' },
  { name: 'SYNTRAX', slug: 'syntrax', role: 'Advanced synthetic fluids with +40% oxidation resistance, providing 4,000+ hour service life while maintaining contamination resistance.' },
  { name: 'MICROKAPPA', slug: 'microkappa', role: 'Precision micro-filtration for coolant and specialty fluid systems addressing proportional control contamination in machine tools.' },
  { name: 'HYDROCORE', slug: 'hydrocore', role: 'Water removal technology preventing hydrolysis and seal degradation in hydraulic systems, maintaining fluid integrity across operating life.' },
];

const IMPACTS = [
  { metric: '+10 - 30%', label: 'System pressure increase from valve spool stiction' },
  { metric: '+5 - 15 kW', label: 'Heat generation increase from internal friction losses' },
  { metric: '+20 - 30°C', label: 'Fluid temperature rise from contamination-induced inefficiency' },
  { metric: '-15 - 30%', label: 'Equipment availability loss from contaminated fluid failures' },
];

const FAQS = [
  {
    q: 'Why do proportional control valves require ISO 16/14/11 cleanliness instead of ISO 17/15/12?',
    a: 'Proportional valves contain spool-in-bore assemblies with internal clearances of 5 to 20 microns - 5 to 10 times tighter than open-loop directional control valves. Valve response precision depends on spool surface finish and clearance geometry. Particles above 4 microns can deposit in spool clearances, creating stiction that reduces proportional response accuracy. ISO 16/14/11 provides 4x lower 4-micron particle concentration than ISO 17/15/12, ensuring spool surfaces remain free of deposits throughout service life.',
  },
  {
    q: 'How does a kidney-loop offline filtration system work in hydraulic applications?',
    a: 'A kidney-loop independently circulates a fraction of hydraulic fluid through a high-efficiency filter (often 2-3 micron) without passing it through the main hydraulic circuit. A typical kidney-loop processes 5-10% of pump flow at low pressure, removing particles and oxidation byproducts continuously. Operating for 48-72 hours of system run time can reduce ISO cleanliness codes by 2 to 4 levels (e.g., from 18/16/13 to 16/14/11). Kidney-loops are essential in systems where main filter specifications cannot achieve target cleanliness alone.',
  },
  {
    q: 'What is the relationship between water content and varnish formation in hydraulic fluids?',
    a: 'Water in hydraulic fluids accelerates oxidation through hydrolysis reactions. Oxidation byproducts form varnish - a sticky polymer deposit - that coats spool surfaces and reduces surface finish smoothness. Even small water concentrations (500-1000 ppm) accelerate varnish formation 3-5x compared to dry fluid. Varnish deposits in spool clearances increase friction and eventually cause stiction. Desiccant breathers and water removal elements are essential to prevent water accumulation above 300 ppm.',
  },
  {
    q: 'At what pressure do seal extrusions occur and how does contamination contribute?',
    a: 'Rod seals in hydraulic cylinders typically extrude when pressure differential exceeds seal design rating - commonly 350 bar for double-acting cylinders. Contamination particles blocking seal gaps cause local pressure spikes that exceed design limits. Additionally, particles scratching seal surfaces during extrusion and re-entry accelerate seal material tearing. Particle contamination above ISO 17/15/12 increases seal extrusion failure risk by 5-10x in high-cycle actuator applications.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'LUBE', title: 'Lube / Oil Systems', href: '/knowledge-system/standards/lube-oil-systems' },
  { code: 'FUEL', title: 'Fuel Systems', href: '/knowledge-system/standards/fuel-systems' },
  { code: 'AIR', title: 'Air Intake Systems', href: '/knowledge-system/standards/air-intake-systems' },
];

export default function HydraulicSystemsPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Breadcrumb />
      <Link href="/knowledge-system/standards" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Titillium Web, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← STANDARDS</Link>

      <section style={{ paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem', background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85 }}>// INDUSTRIAL STANDARDS · HYDRAULIC SYSTEMS</p>
          <h1 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem' }}>Hydraulic Systems</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
            Pressurized fluid system filtration protecting proportional control valves, pumps, and actuators against particle accumulation and water contamination that causes valve stiction, seal degradation, and catastrophic pump failure.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Hydraulic System Filtration Domain</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Hydraulic systems operate at pressures of 70 to 350 bar with component tolerances measured in microns. Unlike oil circulation systems where wear debris recirculates, hydraulic systems cannot tolerate any contamination without risking precision control valve damage. Proportional valves - common in construction, manufacturing, and mobile equipment - require ISO 16/14/11 cleanliness (or tighter) to maintain accuracy within required dead-band tolerances. Hydraulic system contamination control is one of the six critical domains within the <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration systems framework</Link>.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            A typical construction excavator hydraulic system circulates 40 to 100 liters per minute through proportional spools with 5-20 micron clearances. Any particle contamination above ISO 16/14/11 causes speed instability, reduced boom control precision, and eventual valve stiction where the spool locks in position.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination Sources and Failure Modes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Manufacturing Residue', desc: 'New hydraulic systems contain manufacturing debris from hose manufacturing, fittings, and component assembly. Pre-commissioning flushing followed by element installation removes bulk contamination.' },
              { title: 'Seal Degradation Products', desc: 'Rubber seals degrade over 5-10 years, shedding particles into the fluid. Fluid oxidation accelerates seal degradation, creating a cycle where contamination increases seal wear rate.' },
              { title: 'Pump Wear Generation', desc: 'Piston and gear pump internal wear produces ferrous particles that recirculate and accumulate if filters cannot maintain target cleanliness codes.' },
              { title: 'Water and Oxidation Byproducts', desc: 'Water from breather air and seal leakage accelerates oxidation, producing varnish deposits that coat spool surfaces and increase friction in proportional valves.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginTop: '1.5rem' }}>
            Valve stiction, orifice blockage, and pump wear resulting from these contamination sources are examined in detail in the <Link href="/knowledge-system/contamination/hydraulic-system" style={{ color: '#FFF12D', textDecoration: 'underline' }}>hydraulic system contamination analysis</Link>, including swashplate binding and seal extrusion failure modes.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Specifications</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {STANDARDS.map((std) => (
              <div key={std.code} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', alignItems: 'start' }}>
                {std.href ? (
                  <Link href={std.href} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D', textDecoration: 'underline' }}>{std.code}</span>
                  </Link>
                ) : (
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#FFF12D' }}>{std.code}</span>
                )}
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{std.desc}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / OPERATIONAL IMPACT & COST</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Contamination-Driven System Degradation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {IMPACTS.map((impact) => (
              <div key={impact.metric} style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>{impact.metric}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{impact.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Primary Failure Mechanism</h2>
          <Link href="/knowledge-system/contamination/hydraulic-system" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Hydraulic System Contamination</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>Valve spool stiction and proportional control failure are critical concerns. Understand the mechanisms of orifice blockage, swashplate binding, and seal extrusion.</p>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>VIEW ANALYSIS →</span>
            </motion.div>
          </Link>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>06 / ELIMFILTERS® TECHNOLOGIES</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Filtration Systems</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '1rem' }}>
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
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Engineering Factors</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Proportional Valve Cleanliness Requirement', body: 'Proportional control systems require ISO 16/14/11 minimum. Offline kidney-loop filtration may be required to achieve this from standard main-line filters.' },
              { title: 'Pre-Commissioning Flush Procedures', body: 'New systems must be flushed to ISO 16/14/11 before proportional valve installation. Flush flow rates must exceed normal operating flow.' },
              { title: 'Desiccant Breather Usage', body: 'Sealed reservoir breathers prevent water ingress. Breather cartridge replacement schedules depend on ambient humidity and seasonal variations.' },
              { title: 'Fluid Sampling and Analysis', body: 'Quarterly ISO cleanliness codes confirm whether filter specifications are maintaining target cleanliness. Elemental spectroscopy identifies accelerating wear rates.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>08 / FREQUENTLY ASKED QUESTIONS</p>
          <h2 style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Technical Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>// EXPLORE OTHER FILTRATION SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em' }}>{sys.code}</span>
                  <span style={{ fontFamily: 'Titillium Web, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.title}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <RetrievalBlock>
        <p>SEMANTIC_DOMAINS: Hydraulic Efficiency Systems [PRIMARY] | Contamination Control Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: hydraulic, proportional_valve, pump, actuator</p>
        <p>CONCEPT_TAXONOMY: type=control | domain=hydraulic-efficiency | standards=ISO-16889, NFPA-T2.14</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ISO 16889, NFPA T2.14, DIN 51524, ISO 4406</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/hydraulic-system</p>
        <p>&nbsp;&nbsp;Related_Technologies: NANOFORCE, SYNTRAX, MACROCORE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/total-cost-ownership</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/hydraulic-systems</p>
        <p>&nbsp;&nbsp;concept_id: hydraulic-filtration-systems</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </RetrievalBlock>
    </main>
  );
}
