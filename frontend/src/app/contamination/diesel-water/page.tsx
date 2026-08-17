'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function DieselWaterContaminationPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}
      >
        <Link
          href="/contamination"
          style={{
            color: '#FFF12D',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          ← CONTAMINATION
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          padding: '4rem 2rem',
          maxWidth: '860px',
          margin: '0 auto',
          borderBottom: '1px solid rgba(255,241,45,0.1)',
        }}
      >
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.75rem',
            color: '#FFF12D',
            marginBottom: '1rem',
            letterSpacing: '2px',
          }}
        >
          // CONTAMINATION CASE STUDY · FUEL SYSTEMS
        </p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '1.5rem', fontWeight: 700 }}>
          Diesel Water Contamination
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, textAlign: 'justify' }}>
          Water ingress in diesel fuel systems accelerates corrosion of High-Pressure Common Rail (HPCR) injectors, enables exponential microbial growth, and causes catastrophic engine failure within 500-1,000 operating hours if left uncontrolled.
        </p>
      </motion.section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>
        {/* Section 1: Ingress Routes */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '4rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            01 / WATER INGRESS PATHWAYS
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Routes of Water Entry</h2>

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              marginBottom: '2rem',
            }}
          >
            {[
              { title: 'Tank Condensation', desc: 'Temperature fluctuation ±10-15°C daily creates condensation at tank bottom. Accumulates 50-200 ppm in 3-6 months without control.' },
              { title: 'Seal Defects', desc: 'Deteriorated O-rings, cracked filler cap, loose return line connections. Can introduce 200+ ppm in days.' },
              { title: 'Supplier Contamination', desc: 'Refinery residual water (200-500 ppm) or fraudulent diesel/water mixtures from low-quality sources.' },
              { title: 'Transfer Line Condensation', desc: 'Exposed piping with thermal cycling (especially in transports). Contributes 10-50 ppm additional.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  background: 'rgba(255,241,45,0.03)',
                }}
              >
                <h3 style={{ color: '#FFF12D', fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Section 2: Microbial Growth */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            marginBottom: '4rem',
            padding: '2rem',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            background: 'rgba(255,241,45,0.03)',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            02 / MICROBIAL CONTAMINATION MECHANISM
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Growth at Water-Diesel Interface</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            When water concentration exceeds 200 ppm, a water-diesel interface forms at the tank bottom—an ideal habitat for microorganisms:
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>Bacterial Proliferation</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
              <strong>Bacillus</strong> (aerobic bacteria) metabolizes diesel, generating corrosive organic acids. <strong>Clostridium</strong> (anaerobic) grows without oxygen and is more aggressive. Both double every 4-8 hours at 25-30°C, creating exponential growth curves. A single contaminated fuel sample can reach 1,000,000 CFU/mL in 3-5 days.
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>Biofilm Formation</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
              Polysaccharide matrix + bacteria colonies adhere to tank walls, forming brown/black sediment visible in 2-4 weeks. This biofilm is metabolically active, producing acids that corrode steel at 10-50 mg/year → 100-500 mg/year with microbial activity.
            </p>
          </div>

          <div>
            <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>Acid Generation & Corrosion</h3>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
              Bacteria produce acetate, butyrate, and other organic acids, lowering pH from 5.5 to 4.5 (highly corrosive). Iron oxide particles float, settling into fuel filters and HPCR injectors, causing mechanical damage and flow restrictions.
            </p>
          </div>
        </motion.section>

        {/* Section 3: HPCR Injector Damage */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ marginBottom: '4rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            03 / HPCR INJECTOR FAILURE MODES
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Corrosion & Mechanical Damage</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            HPCR injectors operate at 1,600-2,200 bar with 0.05-0.1 mm seat tolerances and 0.1-0.15 mm orifices. Three failure modes dominate:
          </p>

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {[
              { title: 'Pitting Corrosion', desc: 'Acidic water + iron oxides create microscopic pits (0.01-0.1 mm deep) on valve seat stainless steel. Loss of sealing surface → fuel bypass.' },
              { title: 'Orifice Erosion', desc: 'Sediment + acid erodes injection orifice edges. Diameter increases 0.12 → 0.15 mm. Atomization pattern degrades → +15-25% fuel consumption.' },
              { title: 'Orifice Blockage', desc: 'Iron oxide sediment settles in orifice entrance. Complete blockage possible. Cylinder receives no injection → 30-50% power loss.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ transform: 'translateY(-2px)' }}
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                }}
              >
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Progression Table */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#FFF12D', marginBottom: '1rem', fontWeight: 600 }}>
              Progressive Failure Timeline
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: '2px solid #FFF12D' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#FFF12D' }}>Stage</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Water (ppm)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', color: '#FFF12D' }}>Symptoms</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D' }}>Time to Fail</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { stage: '1', water: '100-200', sym: 'None visible', time: '3-4 wks' },
                    { stage: '2', water: '200-500', sym: '+5% fuel consumption', time: '2-3 wks' },
                    { stage: '3', water: '500-1000', sym: 'White smoke, power loss', time: '1 wk' },
                    { stage: '4', water: '> 1000', sym: 'Rough idle, no start', time: '2-5 days' },
                    { stage: '5', water: '> 2000', sym: 'Complete failure', time: 'Immediate' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,241,45,0.1)' }}>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{row.stage}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                        {row.water}
                      </td>
                      <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{row.sym}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center', color: '#FFF12D', fontWeight: 600 }}>
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Section 4: Karl Fischer Testing */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginBottom: '4rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            04 / MEASUREMENT & CONTROL
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Karl Fischer Testing (ASTM D6304)</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            Standard titration method determines water content with ±5 ppm precision. Uses iodine + SO₂ in methanol reagent. Sample size: 5-10 mL per test.
          </p>

          <div style={{ background: 'rgba(255,241,45,0.05)', padding: '1.5rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '1rem' }}>Action Thresholds</h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {[
                { range: '< 100 ppm', action: 'OK', color: '#00AA00' },
                { range: '100-200 ppm', action: 'Monitor, improve sealing', color: '#FFaa00' },
                { range: '200-300 ppm', action: 'Enhanced filtration, manual draining', color: '#FF6600' },
                { range: '300-500 ppm', action: 'Immediate drain + offline filtration', color: '#FF3300' },
                { range: '> 500 ppm', action: 'Discard fuel, clean tank completely', color: '#CC0000' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)' }}>{item.range}</span>
                  <span style={{ fontSize: '0.85rem', color: item.color, fontWeight: 600 }}>{item.action}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Section 5: Prevention Strategies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ marginBottom: '4rem' }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            05 / PREVENTION & REMEDIATION
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Multi-Layer Control Strategy</h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>1. Tank Sealing & Breather</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                Hermetic filler cap with desiccant. Breather tube with molecular sieve (silica gel) prevents humidity ingress. Reduces condensation rate 80-90%.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>2. Water/Fuel Separator</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                Coalescent media captures water droplets before injector system. 95%+ water separation efficiency. Change every 1,000-2,000 hours or when indicator activates.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>3. Water Absorber Additive</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                Ethylene glycol or poliol synthetic absorbs dissolved water (not water-free). Dosage: 100-200 mL per 1,000 L fuel. Prevents microbial growth by suspending absorbed water.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>4. Preventive Draining</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                Manual drain of bottom 10-20% of tank every 6-12 months (where water sediments). Dry climate: quarterly. Tropical: monthly.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ borderColor: 'rgba(255,241,45,0.3)' }}
              style={{
                padding: '1.5rem',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
              }}
            >
              <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>5. Supplier Certification</h3>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                Require supplier Karl Fischer certificate (max 50 ppm water at source). Audit refinery quality control. Establish delivery chain that minimizes exposure.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Case Study */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            marginBottom: '4rem',
            padding: '2rem',
            background: 'rgba(255,241,45,0.05)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
          }}
        >
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.75rem',
              color: '#FFF12D',
              marginBottom: '0.5rem',
              letterSpacing: '1px',
            }}
          >
            CASE STUDY
          </p>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '1.5rem' }}>Tropical Fleet Operations - 6-Month Turnaround</h2>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            <strong>Problem:</strong> Bus fleet in humid tropical environment averaged 500 ppm water after 6 months, with 3 buses experiencing complete HPCR injector failure costing $7,200 per event.
          </p>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '1.5rem', textAlign: 'justify' }}>
            <strong>Solution:</strong> Installed kidney-loop offline filtration + high-efficiency water separator on all vehicles. Added water absorber additive at each fill-up. Established monthly Karl Fischer testing.
          </p>

          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'justify' }}>
            <strong>Result:</strong> Fuel water stabilized at 150-200 ppm (control range). Zero injector failures in subsequent 18 months. Saved $50,000+ in prevented repairs and extended equipment lifespan by 3+ years.
          </p>
        </motion.section>

        {/* External Research Integration */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
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
              Diesel water contamination at concentrations &gt; 200 ppm enables exponential microbial growth (bacteria, fungi) at the water-diesel interfase, producing corrosive organic acids that damage HPCR injector seats and orifices, leading to catastrophic failure within 500-1,000 operating hours.
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>SYSTEMS AFFECTED</strong>
              <br />
              Common rail diesel engines, HPCR fuel injectors, fuel filtration circuits, storage tanks
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>FAILURE IMPACT</strong>
              <br />
              Water ingress → sediment accumulation → microbial colonization → acid production → pitting corrosion of valve seats and injection orifices → loss of fuel atomization and injector stiction → engine power loss 30-50% or complete no-start condition | Operational Impact: Downtime 500+ hours/year per vehicle, injector replacement cost $1,200-2,400 per unit
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>RELATED STANDARDS</strong>
              <br />
              ASTM D6304: Water in Diesel Fuel (Karl Fischer method) | ASTM D4378: Microbiological Examination of Fuel | EN 14274: Fuel Contamination Classification | ISO 12937: Water Content in Petroleum
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>CONTROL TECHNOLOGIES</strong>
              <br />
              TURBOCORE: Water separator coalescent media, rated for the approved application | SYNTAPORE: Synthetic diesel-fuel particulate filtration media | Kidney-loop offline: Continuous low-flow fuel cleaning, maintains target purity indefinitely
            </p>

            <p style={{ marginTop: '1rem' }}>
              <strong>INDUSTRIAL ROLE</strong>
              <br />
              Water contamination is the fastest path to HPCR injector failure (500-1,000 hours vs 5,000+ with particle control only). Prevention through water separation and additive treatment is economically critical for fleet operations in humid climates.
            </p>

            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic',
              }}
            >
              source: elimfilters.com/contamination/diesel-water
              <br />
              concept: Diesel Water Contamination
              <br />
              version: 1.0
              <br />
              last_updated: 2026-08-01
            </p>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          style={{ marginBottom: '4rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '2rem' }}>Frequently Asked Questions</h2>

          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {[
              {
                q: 'What is the fastest indicator of water contamination in fuel?',
                a: 'Karl Fischer titration (ASTM D6304) is the standard method, providing ±5 ppm precision. A single test takes 5-10 minutes and costs $50-200. Visual inspection (color, sediment) is unreliable until contamination is severe (> 500 ppm). For field assessment, water-reactive test papers (humidity strips) provide qualitative indication but are not laboratory-grade.',
              },
              {
                q: 'Can water absorber additive alone prevent microbial growth?',
                a: 'Partially. Additive (etilenglycol-based) absorbs dissolved water, keeping it suspended so bacteria cannot proliferate at the water-diesel interface. However, it does NOT remove water-free particles or prevent water ingress. Best practice: additive + physical water separator + tank sealing = comprehensive control.',
              },
              {
                q: 'How quickly does HPCR injector damage progress after water contamination begins?',
                a: 'Timeline depends on water level. 100-200 ppm: 3-4 weeks before operational symptoms. 200-500 ppm: 2-3 weeks, with +5% fuel consumption visible. 500-1,000 ppm: 1 week, with power loss and white smoke. > 1,000 ppm: 2-5 days to complete failure. Prevention (water removal) must begin immediately upon detection.',
              },
              {
                q: 'Is microbial contamination reversible without tank cleaning?',
                a: 'No. Once biofilm establishes (brown/black sediment), it requires mechanical removal. Water absorber additive prevents FUTURE growth but cannot kill existing colonies. Tank cleaning involves complete drainage, rinse with diesel, vacuum of sediment, and refill with clean ISO 15/13/10 fuel. Cost: $2,000-5,000 per tank.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                whileHover={{ backgroundColor: 'rgba(255,241,45,0.06)' }}
                style={{
                  padding: '1.5rem',
                  border: '1px solid rgba(255,241,45,0.15)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <h3 style={{ color: '#FFF12D', fontSize: '0.95rem', marginBottom: '0.8rem' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, textAlign: 'justify' }}>
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Related Contamination */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          style={{ borderTop: '1px solid rgba(255,241,45,0.1)', paddingTop: '4rem' }}
        >
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Related Contamination Studies</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              { title: 'Particle Wear in Engines', href: '/contamination/particle-wear', desc: 'Abrasive and adhesive wear mechanisms from particle contamination' },
              { title: 'Hydraulic System Contamination', href: '/contamination/hydraulic-system', desc: 'Proportional valve damage and system failure cascades' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
              >
                <Link
                  href={item.href}
                  style={{
                    display: 'block',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,241,45,0.15)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
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
