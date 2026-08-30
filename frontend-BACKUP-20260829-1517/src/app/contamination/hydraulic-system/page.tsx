'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function HydraulicSystemContaminationPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
        <Link href="/contamination" style={{ color: '#FFF12D', textDecoration: 'none', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace' }}>
          ← CONTAMINATION
        </Link>
      </motion.div>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} style={{ padding: '4rem 2rem', maxWidth: '860px', margin: '0 auto', borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '1rem', letterSpacing: '2px' }}>
          // CONTAMINATION CASE STUDY · HYDRAULIC SYSTEMS
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.5rem', fontWeight: 700 }}>
          Hydraulic System Contamination
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, textAlign: 'justify' }}>
          Hydraulic systems are 10-100x more sensitive to contamination than lube oil circuits. A single particle 5-10µm can block proportional valve pilot orifices (0.1-0.3 mm), triggering catastrophic system failure within 600 hours of contamination ingress.
        </p>
      </motion.section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            01 / COMPONENT SENSITIVITY
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Critical Tolerances</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            Hydraulic equipment requires much tighter cleanliness targets than engine lube oil because component tolerances are 10-50x smaller:
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #FFF12D' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#FFF12D' }}>Component</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Clearance</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Critical Particle</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>ISO Target</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { comp: 'Proportional Valve', clear: '5-10µm', particle: '> 5µm', iso: 'ISO 15/13/10' },
                  { comp: 'Steering Cylinder', clear: '2-5µm', particle: '> 3µm', iso: 'ISO 16/14/11' },
                  { comp: 'Variable Pump', clear: '10-15µm', particle: '> 8µm', iso: 'ISO 18/16/13' },
                  { comp: 'Hydraulic Motor', clear: '15-25µm', particle: '> 10µm', iso: 'ISO 19/17/14' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{row.comp}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.clear}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D', fontWeight: 600 }}>{row.particle}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.iso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
            <strong>Rule of Thumb:</strong> Hydraulic system requires 2-3 ISO codes tighter than engine lube oil for equivalent reliability.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} style={{ marginBottom: '4rem', padding: '2rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '8px', background: 'rgba(255,241,45,0.03)' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            02 / PROPORTIONAL VALVE DAMAGE MECHANISMS
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Three Failure Modes</h2>

          <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {[
              {
                title: 'Pilot Orifice Blockage',
                desc: 'Particles > 5µm block pilot orifices (Ø 0.1-0.3 mm). Loss of pilot pressure → valve cannot respond to command signal. System "sticks" in previous position.',
              },
              {
                title: 'Stiction (Stick-Slip)',
                desc: 'Varnish film forms on valve spool from oxidative degradation. Solenoid command met with resistance → intermittent response, erratic behavior, system instability.',
              },
              {
                title: 'Spool Seizure',
                desc: 'Sediment accumulation + thermal stress + low flow causes spool to bind. Pressure builds, heat increases, elastomers degrade → complete valve lockup.',
              },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px' }}>
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'rgba(255,100,100,0.1)', borderRadius: '6px', borderLeft: '3px solid #FF3300' }}>
            <p style={{ fontSize: '0.9rem', color: '#FF6600', fontWeight: 600, marginBottom: '0.5rem' }}>
              ⚠️ CRITICAL: Time-to-Failure
            </p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
              Contamination detected (ISO 20/18/15) → Damage begins day 1 → Complete system failure in 600 hours. No safe "degraded operation" mode exists. Failure is binary: works or doesn't.
            </p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            03 / FAILURE CASCADE
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Progressive System Degradation</h2>

          <div
            style={{
              padding: '2rem',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,241,45,0.2)',
              borderRadius: '8px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              lineHeight: 2,
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)' }}>
              Contamination (ISO 20/18/15)
              <br />
              <span style={{ color: 'rgba(255,241,45,0.6)' }}>↓ 50 horas</span>
              <br />
              Daño incipiente válvula proporcional
              <br />
              <span style={{ color: 'rgba(255,241,45,0.6)' }}>↓ 200 horas</span>
              <br />
              Erosión de asiento válvula
              <br />
              <span style={{ color: 'rgba(255,241,45,0.6)' }}>↓ 300 horas</span>
              <br />
              Pérdida de estanqueidad, fuga interna
              <br />
              <span style={{ color: 'rgba(255,241,45,0.6)' }}>↓ 400 horas</span>
              <br />
              Generación de calor, degradación de sellos
              <br />
              <span style={{ color: 'rgba(255,241,45,0.6)' }}>↓ 500 horas</span>
              <br />
              Liberación de partículas de sello = cascada
              <br />
              <span style={{ color: '#FF3300' }}>↓ 600 horas</span>
              <br />
              <span style={{ color: '#FF3300', fontWeight: 600 }}>FALLO CATASTRÓFICO - Presión cae a 0</span>
            </p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            04 / BYPASS & PRESSURE CONSIDERATIONS
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Filter By-Pass Risk</h2>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              {
                title: 'Bypass Valve Function',
                desc: 'Opens when filter clogs (pressure differencial > 3-5 bar). Protects pump. Problem: unfiltered fluid flows to system.',
              },
              {
                title: 'Pressure Effects',
                desc: 'Higher system pressure (150 → 250 → 350 bar) increases wear rate exponentially. 250 bar = 4x desgarre vs 50 bar.',
              },
              {
                title: 'Prevention',
                desc: 'Select filter with bypass > 5 bar. Monitor pressure differential. Change preventively @ 3 bar (NOT at bypass threshold).',
              },
            ].map((item, idx) => (
              <motion.div key={idx} whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }} style={{ padding: '1.5rem', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '6px', background: 'rgba(255,241,45,0.03)' }}>
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,241,45,0.05)', border: '1px solid rgba(255,241,45,0.15)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#FFF12D', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            CASE STUDY
          </p>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Automatic Lifting Systems - 18-Month Failure Cycle</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1rem', textAlign: 'justify' }}>
            <strong>Problem:</strong> Fleet of 50 automatic lifts (parking lot gates, scissor lifts) failed every 18-24 months. Proportional valve replacement: $1,500 per unit. Downtime: 500-1,000 hours/year.
          </p>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
            <strong>Solution:</strong> Implemented Beta 1000 @ 10µm filtration on all pressure lines. Kidney-loop offline maintains ISO 16/14/11. Quarterly fluid analysis.
          </p>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
            <strong>Result:</strong> Zero proportional valve failures in 60+ months (5+ years) post-installation. Maintenance reduced to preventive filter changes only. Saved $75,000+ in prevented repairs and downtime.
          </p>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} style={{ marginBottom: '4rem', padding: '2rem', background: 'rgba(255,241,45,0.03)', border: '2px solid rgba(255,241,45,0.25)', borderRadius: '8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
          <h3 style={{ color: '#FFF12D', marginBottom: '1rem' }}>📚 External Research Integration</h3>
          <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.8)' }}>
            <p>
              <strong>DEFINITION</strong>
              <br />
              Hydraulic system contamination occurs when particle concentration exceeds system-specific tolerance levels (ISO 17/15/12 typical), enabling proportional valve orifice blockage, spool stiction, and catastrophic pressure loss.
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>SYSTEMS_AFFECTED</strong>
              <br />
              Proportional directional control valves, steering cylinders, variable displacement pumps, closed-loop control systems
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>FAILURE_IMPACT</strong>
              <br />
              Particles &gt; 5µm block pilot orifices (0.1-0.3mm) → valve unresponsive to solenoid commands | Varnish accumulation → stiction and erratic response | Spool seizure → complete loss of pressure and system lockup. Measured: 600-hour failure cascade from detection to complete system failure.
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>RELATED_STANDARDS</strong>
              <br />
              ISO 16889: Beta Ratio filter testing | ISO 4406: Cleanliness code | NFPA T2.14: Hydraulic system contamination control | ISO 17/15/12: Target cleanliness for proportional systems
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>RELATED_TECHNOLOGIES</strong>
              <br />
              NANOFORCE: Beta 1000 @ 3µm pressure line filtration | Kidney-loop offline: Continuous low-flow cleaning
            </p>

            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic',
              }}
            >
              source: elimfilters.com/contamination/hydraulic-system
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
                q: 'Why is hydraulic contamination more critical than engine oil?',
                a: 'Valve component tolerances are 10-50x tighter than engine bearings. A 10µm particle can completely block a 0.1-0.3 mm pilot orifice. Engine oil can tolerate some particles; hydraulic systems cannot. Failure is binary: works perfectly or fails completely (no degraded mode).',
              },
              {
                q: 'Should I wait until pressure differential reaches bypass setting to change filter?',
                a: 'NO. Waiting until bypass means unfiltered fluid is already in the system. Best practice: change preventively at 3 bar differential (50% of bypass threshold). Proactive maintenance avoids catastrophic failure.',
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
              { title: 'Particle Wear in Engines', href: '/contamination/particle-wear', desc: 'Bearing wear acceleration from oil contamination' },
              { title: 'Diesel Water Contamination', href: '/contamination/diesel-water', desc: 'Microbial growth and HPCR injector damage' },
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
