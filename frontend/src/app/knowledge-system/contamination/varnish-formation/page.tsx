'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

const STANDARDS = [
  { code: 'ASTM D7527', desc: 'Membrane Patch Colorimetry (MPC) — measures dissolved varnish precursor concentration in hydraulic and lube fluids by optical delta-E; primary early-warning method before visible deposit formation.' },
  { code: 'ASTM D7214', desc: 'Oxidation stability test for hydraulic fluids measuring resistance to thermal degradation under accelerated oxidation conditions.' },
  { code: 'ISO 4406', desc: 'Particle cleanliness codes for hydraulic fluid monitoring — varnish agglomerates generate particles measurable by ISO 11500 particle counting.' },
  { code: 'DIN 51524', desc: 'Hydraulic fluid specification including oxidation stability and thermal performance requirements for mineral and synthetic hydraulic fluids.' },
];

const CHALLENGE_IMPACTS = [
  { metric: '1–5 µm', label: 'Varnish deposit thickness causing proportional valve spool stiction at 1–3 µm clearance tolerances' },
  { metric: '20–60%', label: 'Reduction in flow control accuracy when varnish partially restricts proportional valve spool movement' },
  { metric: '1,000–3,000 hrs', label: 'Time from fluid thermal stress onset to first valve stiction events without MPC monitoring' },
  { metric: '$3,000–$15,000', label: 'Proportional valve replacement cost per unit when varnish causes permanent spool seizure' },
];

const TECHNOLOGIES = [
  { name: 'SYNTRAX', slug: 'syntrax', role: 'High-capacity synthetic media targeting varnish precursor particle capture in hydraulic return and kidney-loop circuits, removing agglomerated oxidation products before thermal cycling bakes them onto spool surfaces.' },
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Sub-micron filtration removing 0.1–3µm oxidation products — the particle size range responsible for varnish deposit nucleation on hot servo valve surfaces at 120–180°C.' },
  { name: 'THERMACORE', slug: 'thermacore', role: 'Thermal management for hydraulic systems maintaining fluid below 60°C — the temperature threshold above which oxidation rate doubles for each 10°C increase.' },
];

const FAQS = [
  {
    q: 'How does varnish form in hydraulic systems and why does it target servo valve spools?',
    a: 'Varnish forms through thermal oxidation of hydraulic fluid hydrocarbons above 60°C. At elevated temperatures, oxygen dissolved in the fluid reacts with hydrocarbon chains to produce polar oxidation products — aldehydes, organic acids, and resins. These polar compounds are initially dissolved in the fluid (measurable by ASTM D7527 MPC delta-E) but precipitate as the fluid cools between operating cycles. Servo valve spools operate at surface temperatures of 120–180°C during high-frequency actuation — well above the bulk fluid temperature. This temperature differential concentrates precipitation directly onto spool surfaces. The 1–3µm spool clearance geometry traps deposits: each layer slightly raises local temperature, accelerating further deposition in a self-reinforcing cycle. Critical point: visible fluid color change from amber to dark brown lags deposit formation by 200–500 operating hours. By the time color change is observable, significant spool deposits have already formed.',
  },
  {
    q: 'What is Membrane Patch Colorimetry (MPC) and how early does it detect varnish risk?',
    a: 'ASTM D7527 MPC extracts a fluid sample through a membrane filter at elevated temperature, then measures the optical delta-E (color difference) of the deposit left on the membrane. Delta-E below 25 indicates low varnish potential; 25–40 indicates moderate risk requiring fluid change planning; above 40 indicates severe risk with imminent valve stiction within 200–500 hours. Unlike standard particle counting (ISO 11500), MPC detects dissolved varnish precursors before they precipitate as particles — providing 200–500 hour advance warning of deposit formation. Testing interval: every 250–500 service hours for critical servo valve and proportional control circuits. MPC testing cost is $25–$60 per sample versus $3,000–$15,000 per valve replacement. A single MPC sample taken at the correct interval prevents 50–500x its own cost in reactive maintenance.',
  },
  {
    q: 'Can varnish deposits be removed from servo valves without replacement?',
    a: 'Soft varnish deposits (early stage): kidney-loop flushing with ISO VG 32 mineral oil at elevated temperature (50–55°C) and high flow velocity can dissolve and remove soft polar deposits over 100–200 hours of circulation. Success rate: 40–60% when initiated at MPC delta-E 25–35. Moderate deposits: electrostatic oil cleaning (EOC) removes sub-micron soft varnish particles from bulk fluid, reducing new deposit formation; does not dissolve existing deposits but slows progression. Severe hard deposits: valve cartridge removal, 24-hour soak in approved hydraulic system cleaner, mechanical spool cleaning. If spool actuation force exceeds 5 bar differential after cleaning, replacement required. Cost comparison: MPC monitoring + fluid changeout at delta-E 25 = $200–$600. Chemical flushing at delta-E 35–40 = $1,500–$4,000. Valve replacement at seizure = $3,000–$15,000 per valve, plus 8–24 hours downtime. Prevention is 15–75x cheaper than any reactive treatment option.',
  },
  {
    q: 'Which hydraulic systems are most susceptible to varnish and how should monitoring be prioritized?',
    a: 'Highest risk: high-cycle proportional and servo valve circuits operating above 55°C fluid temperature in injection molding, die casting, steel mill hydraulics, and machine tool circuits. Continuous-duty systems accumulate oxidation stress faster than intermittent-duty equipment. Risk factors: fluid age above 3,000 operating hours, iron contamination above 100 ppm (catalyzes oxidation 3–5x), fluid temperature peaks above 70°C, long idle periods between operation (dissolved water from condensation accelerates oxidation on restart). Monitoring priority matrix: (1) Continuous-duty servo valve circuits — MPC every 250 hours; (2) High-temperature circuits above 60°C — MPC every 250–500 hours; (3) Standard industrial hydraulics below 55°C — MPC every 500–1,000 hours; (4) Mobile equipment with low annual hours — MPC annually or at fluid change. Machines with no varnish history operating under 55°C can extend to 1,000-hour MPC intervals. Start at 250-hour intervals for any system with prior varnish deposits or high iron contamination.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'HYD', title: 'Hydraulic Systems Standard', href: '/knowledge-system/standards/hydraulic-systems' },
  { code: 'HYDCON', title: 'Hydraulic Contamination', href: '/knowledge-system/contamination/hydraulic-system' },
  { code: 'TCO', title: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership' },
  { code: 'ISO4406', title: 'ISO 4406 Cleanliness Codes', href: '/knowledge-system/standards/iso-4406' },
];

export default function VarnishFormationPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/contamination" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← CONTAMINATION</Link>

      {/* Hero */}
      <section style={{
        paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>// CONTAMINATION CASE STUDY · VARNISH FORMATION</p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em',
            marginBottom: '1.25rem',
          }}>Varnish Formation in Hydraulic Systems</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
            color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, maxWidth: '600px', margin: '0 auto',
          }}>
            Thermal oxidation of hydraulic fluid produces insoluble polar compounds that deposit as varnish on servo valve spools, heat exchangers, and pump surfaces — detectable 200–500 hours before failure via ASTM D7527 Membrane Patch Colorimetry.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 Contamination Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / CONTAMINATION MECHANISM</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.01em' }}>How Varnish Forms</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '1rem' }}>
            Varnish forms through thermal oxidation of hydraulic fluid hydrocarbons above 60°C. Oxygen dissolved in the fluid reacts with hydrocarbon chains producing polar oxidation products — aldehydes, organic acids, and high-molecular-weight resins. These products are initially dissolved in the fluid (invisible), but precipitate as the fluid cools during equipment shutdowns. Temperature cycling between operating temperature (70–85°C) and ambient (20–30°C) accelerates precipitation with each cycle.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: '1rem' }}>
            Three catalysts accelerate varnish formation: (1) Iron contamination above 100 ppm from wear debris catalyzes oxidation 3–5×; (2) Water ingress above 200 ppm destabilizes fluid additive packages; (3) Fluid age above 3,000 operating hours depletes antioxidant additives, leaving base oil unprotected.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
            The critical failure pathway: servo valve spools operate at surface temperatures of 120–180°C during high-frequency actuation — far above the 60°C bulk fluid temperature. This temperature differential concentrates precipitation directly onto spool surfaces. The 1–3µm spool clearance geometry traps deposits in a self-reinforcing cycle that is invisible to particle counters until advanced stages.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 02 Operational Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / OPERATIONAL IMPACT</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Quantified Failure Consequences</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {CHALLENGE_IMPACTS.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
                borderLeft: '2px solid rgba(255,241,45,0.25)', paddingLeft: '1.25rem',
              }}>
                <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFF12D', minWidth: '80px', lineHeight: 1.2 }}>{item.metric}</span>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0 }}>{item.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 03 Standards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / MEASUREMENT STANDARDS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Detection and Monitoring Standards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '1rem' }}>
            {STANDARDS.map((s, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{s.code}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 04 Technologies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }} style={{ marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>04 / PROTECTION TECHNOLOGIES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>ELIMFILTERS® Technologies</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TECHNOLOGIES.map((tech, i) => (
              <Link key={i} href={`/technologies/${tech.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                  style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem' }}
                >
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>{tech.name}™</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{tech.role}</p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.5rem' }}>EXPLORE →</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        {/* 05 FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}
        >
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / TECHNICAL QUESTIONS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.85rem', lineHeight: 1.5 }}>{faq.q}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Related Systems */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>// EXPLORE RELATED SYSTEMS</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1rem' }}>
            {RELATED_SYSTEMS.map((sys) => (
              <Link key={sys.code} href={sys.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                  style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                >
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: '#FFF12D', opacity: 0.6, letterSpacing: '0.1em' }}>{sys.code}</span>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{sys.title}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', color: 'rgba(255,241,45,0.4)', marginTop: '0.25rem' }}>EXPLORE →</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

      </div>


      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        'headline': 'Varnish Formation in Hydraulic Systems — Contamination Case Study',
        'description': 'Thermal oxidation of hydraulic fluid above 60°C produces varnish deposits on servo valve spools, causing spool stiction and flow control failure. ASTM D7527 MPC monitoring provides 200–500 hour advance warning.',
        'author': { '@type': 'Organization', 'name': 'ELIMFILTERS' },
        'keywords': ['varnish formation', 'ASTM D7527', 'membrane patch colorimetry', 'servo valve stiction', 'hydraulic fluid oxidation', 'MPC delta-E'],
        'about': { '@type': 'Thing', 'name': 'Varnish Formation', 'description': 'Thermal oxidation mechanism producing insoluble deposits on hydraulic servo valve surfaces' },
        'mentions': {
          'standards': ['ASTM D7527', 'ASTM D7214', 'ISO 4406', 'DIN 51524'],
          'technologies': ['SYNTRAX', 'NANOFORCE', 'THERMACORE'],
          'contaminationModes': ['thermal oxidation', 'spool stiction', 'varnish deposits', 'hydraulic fluid degradation']
        }
      })}} />
    </main>
  );
}
