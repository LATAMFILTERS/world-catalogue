'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function RegionalFleetStrategiesPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-center/fleet-optimization" style={{
        display: 'inline-block',
        padding: '1rem 2rem',
        color: '#FFF12D',
        textDecoration: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        margin: '2rem 2rem 0',
      }}>
        ← FLEET OPTIMIZATION
      </Link>

      <section style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              color: '#FFF12D',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}>
              FLEET OPTIMIZATION · DEPLOYMENT
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
            }}>
              Regional Fleet Strategies & Deployment Optimization
            </h1>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.65)',
              maxWidth: '640px',
              textAlign: 'justify',
            }}>
              Equipment operating in desert mining requires different contamination control than coastal marine environments. Regional climate, geography, and operational intensity determine filtration strategies. Desert dust demands multi-stage MACROCORE air intake with high bypass thresholds. Tropical humidity requires aggressive TURBOCORE water separation. Coastal salt air necessitates enhanced cabin MICROKAPPA filtration to protect operator health. Matching filtration systems to regional environmental stressors extends equipment life 2–4× compared to one-size-fits-all commodity approaches.
            </p>
          </motion.div>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            01 / ENVIRONMENTAL CONTAMINATION PROFILES BY REGION
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Climate and Geography Determine Filtration Needs
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem',
          }}>
            {[
              {
                region: 'Desert Mining (Sahara, Middle East, Australia)',
                challenges: 'Massive dust loading 500–1000 µm particles/100 mL; silica, iron oxide, sand abrasion',
                waterRisk: 'Low (arid); seasonal flash floods introduce sudden water spikes',
                strategy: 'Dual-stage MACROCORE air intake (99.9% @ 5µm + high bypass 150 mbar); offline NANOFORCE kidney-loop 24/7 during operating season; fuel polishing to remove silica contamination',
              },
              {
                region: 'Tropical Agriculture (Southeast Asia, Sub-Saharan Africa)',
                challenges: 'High moisture 80%+ humidity; microbial growth in fuel/hydraulic; water ingress 200–500 ppm',
                waterRisk: 'Critical (monsoons, high humidity); bacterial contamination in fuel tanks; hydraulic fluid oxidation',
                strategy: 'TURBOCORE fuel water separator (maintains ≤100 ppm water); SYNTRAX kidney-loop to inhibit bacterial growth in oil',
              },
              {
                region: 'Coastal/Marine (North Sea, Mediterranean, Pacific)',
                challenges: 'Salt air corrosion; moisture intrusion; engine compartment spray exposure; cabin air quality for crew health',
                waterRisk: 'Extreme (salt water spray, high humidity); corrosion of injectors, sensors, electrical connectors',
                strategy: 'MARINECLEAN hydraulic/diesel filtration (salt-resistant media); MICROKAPPA cabin filtration rated to the ISO 11155 target specified for the approved application for operator respiratory protection; extended drain intervals with premium synthetic oils',
              },
              {
                region: 'Cold Climate (Northern Europe, Canada, Russia)',
                challenges: 'Fuel gelling (−15°C to −40°C); viscosity changes 100× between summer/winter; water ingress from melting snow',
                waterRisk: 'High (snow melt, condensation in fuel tanks); fuel filter ice blockage; hydraulic fluid sluggishness',
                strategy: 'Winter-grade synthetic hydraulic fluid (ISO VG 46 AW with pour point <−30°C); heated fuel filters for heavy-duty trucks; aggressive water separation (TURBOCORE) to prevent fuel filter icing',
              },
              {
                region: 'Urban Construction (Dense Cities, Limited Parking)',
                challenges: 'High-frequency stop-start operation; idling in traffic; poor air quality (exhaust particulates); frequent short runs',
                waterRisk: 'Moderate (fuel dilution from incomplete combustion); crankcase blowby; engine oil sludge formation',
                strategy: 'High-efficiency cabin filters (MICROKAPPA) to protect operator from city pollution; short-interval lube oil changes (500–800 hrs) despite high idle time; fuel system water separation to prevent injector carbon buildup',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,241,45,0.06)',
                border: '1px solid rgba(255,241,45,0.15)',
                borderRadius: '6px',
                padding: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#FFF12D', fontSize: '0.9rem' }}>
                  {item.region}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  <strong>Contamination challenges:</strong> {item.challenges}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
                  <strong>Water/corrosion risk:</strong> {item.waterRisk}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFF12D' }}>
                  <strong>Regional strategy:</strong> {item.strategy}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            02 / MULTI-REGION FLEET STANDARDIZATION
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Operational Efficiency Through Standardized Platform
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            Global fleets operating across multiple regions face inventory complexity: desert trucks carry different filters than tropical trucks. Standardizing on a modular system (MACROCORE for air, SYNTRAX for lube, NANOFORCE for hydraulic, TURBOCORE for fuel) reduces parts inventory 40% while allowing regional customization through kidney-loop configurations and monitoring intervals. Desert operation runs kidney-loop continuously (full contamination control). Tropical operation runs seasonal (monsoon months only). Coastal operation runs moderate (6 months/year). Same core filtration platform; different deployment intensity based on regional exposure.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: '3rem' }}
        >
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            color: 'rgba(255,241,45,0.5)',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            03 / CASE STUDY: GLOBAL MINING COMPANY, 8 REGIONS, 400 VEHICLES
          </p>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '1.2rem',
            marginBottom: '1rem',
          }}>
            Regional Deployment Results
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.93rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.68)',
            textAlign: 'justify',
            marginBottom: '1.5rem',
          }}>
            A global mining company operated 400 heavy-duty dump trucks across 8 regions: Australia (desert), Indonesia (tropical), Chile (high-altitude desert), Zambia (tropical bush), Canada (cold), South Africa (dry savanna), Papua New Guinea (extreme tropical), Russia (arctic). Previously, each region purchased commodity filters independently, with zero standardization. Implementation of ELIMFILTERS regional strategy: standardized core platform (MACROCORE air, SYNTRAX oil, NANOFORCE hydraulic, TURBOCORE fuel) with regional kidney-loop intensity adjustments. Within 5 years: fleet-wide equipment lifespan increased from 4,800 hours to 12,500 hours (2.6× improvement). Equipment replacement budget dropped from $18M/year to $5.2M/year (71% reduction). Unplanned failures dropped 87% (from 8 incidents/truck/year to 1 incident/truck/year). Total 5-year savings: $64.8M. Regional variations: desert region achieved highest lifespan (13,500 hrs) with aggressive offline kidney-loop; tropical regions achieved 11,800 hrs with seasonal kidney-loop activation; arctic region achieved 12,200 hrs despite extreme cold. No region underperformed baseline commodity approach.
          </p>
        </motion.section>

      </div>

      <section style={{
        maxWidth: '860px',
        margin: '3rem auto',
        padding: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '1.5rem',
        }}>
          Related Fleet Optimization resources
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/knowledge-center/fleet-optimization/equipment-lifecycle-optimization" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            color: '#FFF12D',
            textDecoration: 'none',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            Equipment Lifecycle →
          </Link>
          <Link href="/knowledge-center/fleet-optimization/asset-protection-system" style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            color: '#FFF12D',
            textDecoration: 'none',
            borderRadius: '4px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}>
            Asset Protection →
          </Link>
        </div>
      </section>
    </main>
  );
}
