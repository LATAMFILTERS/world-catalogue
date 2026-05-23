'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

const STANDARDS = [
  { code: 'ASTM D6304', desc: 'Karl Fischer titration method for water content measurement in diesel fuel, providing quantitative water concentration in ppm for contamination verification.' },
  { code: 'ASTM D975', desc: 'Standard specification for diesel fuel, defining upper limits on water, sediment, and contamination levels acceptable for engine fuel systems.' },
  { code: 'ISO 12937', desc: 'Determination of water content in petroleum products by Karl Fischer method, complementing ASTM D6304 for international compliance.' },
  { code: 'ISO 4406', href: '/knowledge-system/standards/iso-4406', desc: 'Particle count classification for fuel system cleanliness, providing legacy cleanliness codes applicable to diesel and biodiesel systems.' },
];

const TECHNOLOGIES = [
  { name: 'NANOFORCE', slug: 'nanoforce', role: 'Electrostatic synthetic media removing sub-10 micron water droplets and particles from fuel before injection, achieving 99.9% efficiency.' },
  { name: 'AQUAGUARD', slug: 'aquaguard', role: 'Superabsorbent polymer cores extracting 99.2% of free water from fuel, preventing injector stiction and microbial growth in storage tanks.' },
];

const IMPACTS = [
  { metric: '+3 - 8%', label: 'Fuel consumption increase from injector spray pattern degradation' },
  { metric: '+5 - 15 sec', label: 'Hard-start time increase from injector precision drift' },
  { metric: '2000 - 3000 hrs', label: 'Injector cleaning frequency increase above 500 ppm water threshold' },
  { metric: '-12 - 18%', label: 'Equipment availability loss from microbial blockages in fuel systems' },
];

const FAQS = [
  {
    q: 'What is the difference between free, emulsified, and sedimentary water in diesel fuel?',
    a: 'Free water sits as liquid droplets in the tank and can be removed by simple settlement or gravity separation. Emulsified water is suspended as sub-micron droplets dispersed throughout the fuel, requiring coalescence media or centrifugal separation for removal. Sedimentary water is water absorbed into particulates and tank corrosion byproducts. Only free and emulsified water is measurable by Karl Fischer titration. Sedimentary water bound to particles may not appear in titration results but still enters fuel systems and accelerates injector damage.',
  },
  {
    q: 'Why does water contamination cause injector stiction?',
    a: 'Modern fuel injectors operate at pressures of 1,600 to 2,500 bar with internal tolerances of 1 to 3 microns. Water droplets entering the injector body create corrosion products - iron oxide, aluminum oxide - that deposit in control valve spool clearances. These deposits create friction that locks the spool in its current position, preventing needle lift response to electrical command. A stiction-locked injector delivers fuel at wrong timing and quantity, causing hard starts and rough idle.',
  },
  {
    q: 'How does biodiesel increase water absorption compared to petroleum diesel?',
    a: 'Biodiesel esters have hygroscopicity 3 to 5 times higher than petroleum diesel. Biodiesel blends above B10 (10% biodiesel) absorb atmospheric moisture at measurable rates during storage, especially in tropical climates with high ambient humidity. Water saturation at the fuel-air interface in the fuel tank becomes a chronic condition rather than episodic. Storage tanks for biodiesel blends require sealed lids and desiccant breathers. Filter elements must have higher water absorption capacity and more frequent drain schedules in warm, humid regions.',
  },
  {
    q: 'At what water concentration does microbial growth become visible as tank sludge?',
    a: 'Bacteria and fungi require water to reproduce. Above 500 ppm water concentration in fuel, microbial colonies establish at the fuel-water interface in tanks. At 1,000 ppm water, visible biomass accumulation occurs within days to weeks. Bacterial colonies produce acids that corrode tank walls and accelerate oxidation of surrounding fuel. Fungal growth produces filaments that block fuel system filters independent of particle contamination. Complete tank cleaning and fuel replacement becomes necessary after severe microbial contamination.',
  },
];

const RELATED_SYSTEMS = [
  { code: 'LUBE', title: 'Lube / Oil Systems', href: '/knowledge-system/standards/lube-oil-systems' },
  { code: 'AIR', title: 'Air Intake Systems', href: '/knowledge-system/standards/air-intake-systems' },
  { code: 'HYD', title: 'Hydraulic Systems', href: '/knowledge-system/standards/hydraulic-systems' },
];

export default function FuelSystemsPage() {
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
        paddingTop: 'clamp(5rem, 10vw, 8rem)', paddingBottom: '4rem',
        background: 'linear-gradient(180deg, rgba(255,241,45,0.04) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ maxWidth: '720px', margin: '0 auto', padding: '0 2rem' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
            letterSpacing: '0.18em', color: '#FFF12D', marginBottom: '1rem', opacity: 0.85,
          }}>// INDUSTRIAL STANDARDS · FUEL SYSTEMS</p>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.2rem)',
            fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.15, marginBottom: '1.5rem',
          }}>Fuel Filtration Systems</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '1rem',
            color: 'rgba(255,255,255,0.5)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7,
          }}>
            Diesel and fuel system filtration protecting injection precision against water contamination, particle loading, and microbial growth that degrade fuel delivery accuracy and equipment availability.
          </p>
        </motion.div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>01 / SYSTEM OVERVIEW</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Fuel Filtration Domain</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1rem' }}>
            Fuel systems are unique in that they carry two distinct contamination types: particles that cause injector mechanical damage and water that triggers corrosion and microbial growth. A fuel filter must simultaneously address both threats while maintaining flow rates sufficient for engine power output.
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Two-stage fuel filtration (coarse primary + fine secondary) is standard in heavy equipment. Primary stages remove bulk sediment and free water. Secondary stages provide final cleanliness protection. In marine and agricultural applications, separator elements that remove free water are equally critical as particle removal elements.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>02 / CONTAMINATION CHALLENGES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Water and Particle Ingestion Sources</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { title: 'Atmospheric Water Breathing', desc: 'Fuel tanks breathe during thermal cycling - warm fuel expands and pushes air out, cool fuel contracts and draws air in. Humid air entering the tank deposits moisture that condenses on tank walls. Over weeks, this produces measurable water accumulation independent of fuel quality at delivery.' },
              { title: 'Storage Corrosion Byproducts', desc: 'Ferrous tanks develop internal corrosion that produces iron oxide particles and water-soluble corrosion products. These particles damage injector spray orifices (100-200 micron diameter) while water content accelerates corrosion rate exponentially.' },
              { title: 'Fuel Transfer Contamination', desc: 'Transfer from bulk storage to equipment tanks introduces particles and water if transfer hoses and filler caps are not properly managed. Gravity settling alone cannot remove emulsified water before fuel is used.' },
              { title: 'Microbial Tank Proliferation', desc: 'Bacteria and fungi establish colonies at the fuel-water interface above 500 ppm water concentration. Biomass production blocks filters and produces acids that corrode tanks and accelerate fuel oxidation.' },
            ].map((item) => (
              <div key={item.title} style={{ borderLeft: '2px solid rgba(255,241,45,0.2)', paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{item.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginTop: '1.5rem' }}>
            Water contamination is the dominant fuel system failure pathway. The corrosion mechanisms, microbial proliferation chain, and injector damage progression are examined in detail in the <Link href="/knowledge-system/contamination/diesel-water" style={{ color: '#FFF12D', textDecoration: 'underline' }}>diesel water contamination case study</Link>.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>03 / ASSOCIATED STANDARDS</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Applicable Specifications</h2>
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
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Fuel Contamination Cost Impact</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {IMPACTS.map((impact) => (
              <div key={impact.metric} style={{ background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.3rem', fontWeight: 700, color: '#FFF12D', marginBottom: '0.5rem' }}>{impact.metric}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{impact.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8 }}>
            Fuel system contamination directly reduces equipment availability and increases unplanned maintenance costs. Fleet operators managing contamination proactively through two-stage filtration and water separation can extend injector service intervals 3-5x. For fleet-level strategies on reducing fuel-related downtime, see the <Link href="/knowledge-system/fleet/fuel-efficiency" style={{ color: '#FFF12D', textDecoration: 'underline' }}>filtration and fuel efficiency optimization guide</Link>.
          </p>
        </motion.section>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '3.5rem' }} />

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: '#FFF12D', opacity: 0.7, marginBottom: '0.75rem' }}>05 / RELATED CONTAMINATION MODES</p>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>Primary Failure Mechanism</h2>
          <Link href="/knowledge-system/contamination/diesel-water" style={{ textDecoration: 'none' }}>
            <motion.div whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 600, color: '#fff', margin: 0 }}>Diesel Water Contamination</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>Water is the dominant contamination challenge in fuel systems. Explore the three water states (free, emulsified, sedimentary), corrosion pathways, and microbial proliferation mechanisms.</p>
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
              { title: 'Two-Stage Filtration Requirement', body: 'Coarse primary (25-40 micron) removes bulk contaminant. Fine secondary (2-5 micron absolute) provides final protection before injection circuits.' },
              { title: 'Water Separator Integration', body: 'Free water removal via coalescence or gravity separation prevents water from reaching injectors. Separator bowl drainage intervals depend on storage conditions and climate.' },
              { title: 'Tank Breather Desiccation', body: 'Sealed fuel tanks with desiccant breathers prevent atmospheric moisture ingress during thermal cycling.' },
              { title: 'Microbial Prevention Strategy', body: 'Keeping water content below 300 ppm prevents bacterial and fungal colony establishment in fuel tanks.' },
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

      {/* Retrieval Summary Block — machine-readable knowledge index */}
      <section style={{
        background: 'rgba(255,241,45,0.02)',
        border: '1px solid rgba(255,241,45,0.12)',
        borderRadius: '4px',
        padding: '2rem',
        margin: '2rem auto',
        maxWidth: '860px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.7rem',
        lineHeight: 1.8,
        color: 'rgba(255,255,255,0.35)',
      }}>
        <p style={{ color: 'rgba(255,241,45,0.6)', marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>// RETRIEVAL SUMMARY BLOCK</p>
        <p>SEMANTIC_DOMAINS: Diesel Fuel Integrity Systems [PRIMARY] | Contamination Control Systems [SECONDARY]</p>
        <p>SYSTEMS_AFFECTED: fuel, injector, pump, storage_tank</p>
        <p>CONCEPT_TAXONOMY: type=control | domain=fuel-integrity | standards=ASTM-D6304, ISO-12937</p>
        <p>RELEVANCE_LEVELS: industrial, fleet, technical</p>
        <p style={{ marginTop: '0.75rem' }}>INTERNAL_REFERENCES:</p>
        <p>&nbsp;&nbsp;Related_Standards: ASTM D6304, ISO 12937, ISO 4406, ASTM D975</p>
        <p>&nbsp;&nbsp;Related_Contamination: /knowledge-system/contamination/diesel-water</p>
        <p>&nbsp;&nbsp;Related_Technologies: AQUAGUARD, MACROCORE, NANOFORCE</p>
        <p>&nbsp;&nbsp;Related_Fleet: /knowledge-system/fleet/fuel-efficiency</p>
        <p style={{ marginTop: '0.75rem' }}>CITATION_METADATA:</p>
        <p>&nbsp;&nbsp;source_uri: elimfilters.com/knowledge-system/standards/fuel-systems</p>
        <p>&nbsp;&nbsp;concept_id: diesel-fuel-filtration-systems</p>
        <p>&nbsp;&nbsp;version: 1.0</p>
        <p>&nbsp;&nbsp;last_updated: 2026-05-23</p>
      </section>
    </main>
  );
}
