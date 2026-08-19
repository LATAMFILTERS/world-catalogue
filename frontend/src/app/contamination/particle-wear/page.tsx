'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function ParticleWearPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/contamination" style={{ color: '#FFF12D', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
          ← CONTAMINATION
        </Link>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ padding: '4rem 2rem', maxWidth: '860px', margin: '0 auto', borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '1rem', letterSpacing: '2px' }}>
          // CONTAMINATION CASE STUDY · LUBE OIL SYSTEMS
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.5rem', fontWeight: 700 }}>
          Particle Wear in Engines
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, textAlign: 'justify' }}>
          Particle contamination in engine lube oil accelerates both abrasive and adhesive wear mechanisms, reducing bearing lifespan 60-80%. Oil cleanliness targets (ISO 4406) directly correlate with equipment life extension and total cost of ownership.
        </p>
      </motion.section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            01 / THREE WEAR MECHANISMS
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Abrasive, Adhesive, and Oxidative Wear</h2>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              {
                title: 'Two-Body Abrasive Wear',
                desc: 'Hard particles (silica 50-100µm, oxides) trapped between bearing surface and rolling element. Creates parallel micro-surcos 0.5-5µm deep per contact cycle. Accumulation increases bearing clearance.',
              },
              {
                title: 'Three-Body Wear (Adhesive)',
                desc: 'Occurs when lubricant film fails (ISO > 20/18/15). Bare metal contact causes cold-welding and violent material spallation. 10-50x faster than abrasive wear. Irreversible cascade failure.',
              },
              {
                title: 'Varnish & Oxidation',
                desc: 'Thermal and oxidative degradation of oil produces carbon deposits on piston rings, valve stems, cylinder walls. Reduces efficiency 20-50%, increases friction, accelerates wear.',
              },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px', background: 'rgba(255,241,45,0.03)' }}>
                <h3 style={{ color: '#FFF12D', fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '4rem', padding: '2rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '8px', background: 'rgba(255,241,45,0.03)' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            02 / CLEANLINESS IMPACT ON BEARING LIFE
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>ISO 4406 Code Correlation</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            Bearing manufacturers (SKF, FAG, Timken) document that each step of oil cleanliness degradation reduces bearing life 30-50%:
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FFF12D' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#FFF12D' }}>ISO 4406</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Cleanliness</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Expected Life</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Degradation/Step</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { iso: '14/12/09', clean: 'OPTIMAL', life: '25,000+ hrs', deg: '—' },
                  { iso: '16/14/11', clean: 'EXCELLENT', life: '15,000-20,000', deg: '-40%' },
                  { iso: '18/16/13', clean: 'GOOD', life: '10,000-15,000', deg: '-35%' },
                  { iso: '20/18/15', clean: 'COMMERCIAL', life: '5,000-8,000', deg: '-50%' },
                  { iso: '22/20/17', clean: 'POOR', life: '2,000-3,000', deg: '-60%' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
                    <td style={{ padding: '0.75rem', color: '#FFF12D', fontWeight: 600 }}>{row.iso}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.clean}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.life}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D', fontWeight: 600 }}>{row.deg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
            <strong>Practical implication:</strong> Diesel engine with ISO 16/14/11 (optimal) operates 15,000-20,000 hours before bearing failure. Same engine with ISO 20/18/15 (commodity spec) fails at 5,000-8,000 hours (+250% extended life with optimization).
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            03 / FAILURE OF COMMODITY APPROACH
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Why "OEM Specification" is Insufficient</h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                title: 'Problem 1: Spec ≠ Reality',
                desc: 'OEM says "Use ISO VG 32, change every 500 hours." This specifies fluid grade and interval. It does NOT specify ISO 4406 cleanliness target during operation. Result: Correct fluid, uncontrolled contamination.',
              },
              {
                title: 'Problem 2: Filter Bypass',
                desc: 'Commodity filter (Beta 200 @ 25µm) captures only 99.5% of particles > 25µm. Leaves 99% of particles 4-25µm (where bearing damage occurs). Requires Beta 1000 @ 10µm for ISO 16/14/11 maintenance.',
              },
              {
                title: 'Problem 3: No Feedback Loop',
                desc: 'Degraded components generate wear particles, which contaminate the oil. Without kidney-loop or monitoring, ISO cleanliness degrades 1 level every 500-1,000 hours. Cycle accelerates until catastrophic failure.',
              },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px', background: 'rgba(255,241,45,0.05)' }}>
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: '2rem',
              padding: '2rem',
              background: 'rgba(255,241,45,0.05)',
              border: '1px solid rgba(255,241,45,0.15)',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ color: '#FFF12D', fontSize: '1.05rem', marginBottom: '1rem' }}>Case Study: Diesel Truck Fleet (10 years)</h3>

            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
              {[
                { scenario: 'COMMODITY', cost: '$25,500', overhauls: '3x' },
                { scenario: 'SYSTEM', cost: '$8,250', overhauls: '1x' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '1rem', backgroundColor: idx === 0 ? 'rgba(255,51,0,0.1)' : 'rgba(0,170,0,0.1)', borderRadius: '6px' }}>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>Approach</p>
                  <p style={{ fontSize: '1.1rem', color: '#FFF12D', fontWeight: 600, marginBottom: '0.5rem' }}>{item.scenario}</p>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                    Motor overhauls: <span style={{ fontWeight: 600 }}>{item.overhauls}</span>
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#FFF12D', fontWeight: 600 }}>Total cost: {item.cost}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
              <strong>Savings with system approach:</strong> $17,250 per truck (67% reduction) through extended bearing lifespan, reduced overhaul frequency, and eliminated premature component replacement.
            </p>
          </motion.div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            04 / PROTECTION TECHNOLOGIES
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Multi-Layer Bearing Protection</h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                tech: 'MACROCORE',
                role: 'Air Intake Filtration',
                desc: 'Captures 95%+ environmental particles before motor. ISO 5011 @ 3-10µm. Reduces load on oil filtration system.',
              },
              {
                tech: 'SYNTRAX',
                role: 'Synthetic Lube Oil Media',
                desc: 'Synthetic gradient media engineered for high dirt-holding capacity in engine lube oil circuits, supporting the cleanliness target specified for the approved application.',
              },
              {
                tech: 'DURATECH',
                role: 'Integrated Fleet Maintenance',
                desc: 'Complete kit: filtration + fluid + monitoring. Standardizes protection across fleet. Eliminates supply chain risk.',
              },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem' }}>{item.tech}</p>
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.role}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            marginBottom: '4rem',
            padding: '2rem',
            background: 'rgba(255,241,45,0.03)',
            border: '2px solid rgba(255,241,45,0.25)',
            borderRadius: '8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
          }}
        >
          <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>📚 External Research Integration</h3>
          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong>
              <br />
              Particle wear in bearings is accelerated by oil contamination above cleanliness targets (ISO 4406), with abrasive wear from hard particles (silica, oxides) at 50-100µm and adhesive wear from loss of lubricant film at ISO codes &gt; 20/18/15.
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>FAILURE_IMPACT</strong>
              <br />
              Particle accumulation in bearing races → micro-cutting and material removal → bearing clearance reduction → friction increase → temperature rise → bearing seizure. Measured impact: bearing life reduction from 15,000+ hours (ISO 16/14/11) to 2,000-3,000 hours (ISO 22/20/17).
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>RELATED_STANDARDS</strong>
              <br />
              ISO 4406: Particle cleanliness code | ISO 16889: Beta ratio filter testing | SAE J1211: Crankcase ventilation | ISO 12922: Oil specification
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>RELATED_TECHNOLOGIES</strong>
              <br />
              SYNTRAX: Synthetic gradient lube oil media, supports the cleanliness target specified for the approved application | MACROCORE: Air intake filtration at 3-10µm, reduces particle source
            </p>

            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic',
              }}
            >
              source: elimfilters.com/contamination/particle-wear
              <br />
              version: 1.0 | last_updated: 2026-08-01
            </p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '2rem' }}>Technical Questions</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                q: 'How do I know if bearing wear is accelerating in my fleet?',
                a: 'Trend analysis of ISO 4406 codes via quarterly oil sampling. If codes degrade faster than expected (e.g., 16/14/11 → 18/16/13 in 2 months instead of 8 months), wear is accelerating. Parallel indicator: Increased ferrous particles in oil analysis (ICP-OES).',
              },
              {
                q: 'What is the ROI of upgrading from commodity to premium bearing protection?',
                a: 'Typical: $8-10 per liter of synthetic oil + $50-100 per premium filter = $200-300 per oil change. Over 10 years, prevents 2-3 motor overhauls @ $8,500 each = $17,000-25,500 saved. Payback in first year.',
              },
            ].map((faq, idx) => (
              <motion.div key={idx} whileHover={{ backgroundColor: 'rgba(255,241,45,0.06)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px' }}>
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} style={{ borderTop: '1px solid rgba(255,241,45,0.1)', paddingTop: '4rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Related Contamination Studies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Diesel Water Contamination', href: '/contamination/diesel-water', desc: 'Microbial growth and HPCR injector corrosion' },
              { title: 'Hydraulic System Contamination', href: '/contamination/hydraulic-system', desc: 'Proportional valve sensitivity and bypass risks' },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}>
                <Link href={item.href} style={{ display: 'block', padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px', textDecoration: 'none', color: 'inherit' }}>
                  <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
