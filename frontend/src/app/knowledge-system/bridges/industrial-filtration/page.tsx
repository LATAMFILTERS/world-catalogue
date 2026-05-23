'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function IndustrialFiltrationPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/bridges" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← BRIDGES</Link>

      {/* Hero */}
      <section style={{
        paddingTop: '5rem',
        paddingBottom: '5rem',
        background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,0,0,0.3) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: '1.5rem' }}
          >
            <span style={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              color: '#FFF12D',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              // FILTRATION DECISION BRIDGE
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 900,
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: '1.5rem',
              lineHeight: 1.1,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Industrial Filtration Selection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'Outfit, sans-serif',
              maxWidth: '700px',
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.25rem',
            }}
          >
            Framework for evaluating industrial filtration across diverse equipment types and operating conditions.
          </motion.p>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 / Traditional Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            01 / TRADITIONAL INDUSTRIAL FILTRATION SELECTION
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            The Equipment-Brand-Interval Model
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Traditional industrial filtration selection follows a structured but product-focused approach:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Step 1: Identify Equipment Type</strong><br/>
              Determine the specific equipment model (diesel engine, hydraulic pump, air compressor, transmission, etc.)
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Step 2: Check OEM Specification</strong><br/>
              Consult the equipment manual for the OEM-specified filter brand, part number, micron rating, and replacement interval
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Step 3: Select Filter Product</strong><br/>
              Purchase a filter matching the OEM specification (from OEM supplier, authorized distributor, or aftermarket equivalent)
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>Step 4: Replace at Interval</strong><br/>
              Install the filter and schedule replacement based on OEM interval (e.g., 250 hours, 6 months, 15,000 km)
            </p>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            This approach is straightforward, compliant with warranty requirements, and universally understood. However, it optimizes for OEM compliance and schedule predictability, not for actual equipment protection or cost optimization.
          </p>
        </motion.section>

        {/* 02 / Limitations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            02 / LIMITATIONS OF PRODUCT-BASED THINKING
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Why OEM Intervals and Specifications Fall Short
          </h2>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '0',
          }}>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Generic Intervals:</strong> OEM intervals are designed for average conditions, not for your specific equipment operating environment (dusty construction site vs. climate-controlled facility)
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Specification Compliance ≠ Equipment Protection:</strong> A filter meeting OEM specs controls contamination to a minimum threshold, not to optimal levels for equipment longevity
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>No System Integration:</strong> Each filter is selected independently (engine, transmission, hydraulic, cabin). No consideration of contamination pathways across systems
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>Bypass Risk Ignored:</strong> Filter specification doesn't account for pressure differential spikes or high-contamination events that trigger bypass (unfiltered flow directly into the protected system)
            </li>
            <li style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#FFF12D' }}>No Measurement Feedback:</strong> Replacement is calendar/usage based, not condition-based. You replace filters on schedule regardless of actual contamination condition
            </li>
            <li>
              <strong style={{ color: '#FFF12D' }}>Cost Invisibility:</strong> TCO (downtime, premature component failure, operational inefficiency) is not factored into filter selection. Only per-unit filter cost drives purchasing decisions
            </li>
          </ul>
        </motion.section>

        {/* 03 / System Approach */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            03 / ASSET PROTECTION SYSTEM APPROACH
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            From Filter Selection to Contamination Control Strategy
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            System-level filtration design reframes the decision from "which filter product" to "how do we achieve measurable contamination control?" This requires four foundational shifts:
          </p>
          <div style={{
            background: 'rgba(255,241,45,0.06)',
            border: '1px solid rgba(255,241,45,0.15)',
            padding: '2rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>1. Measure Contamination Targets</strong><br/>
              Define the specific ISO 4406 cleanliness code required for each system type (engine lube: 16/14/11, hydraulic: 17/15/12, fuel: 15/13/10). This becomes the measurable objective, not OEM spec compliance.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>2. Assess Real Contamination Loads</strong><br/>
              Quantify actual particle ingestion: air intake volume and quality, fuel water content, oil condition, system pressure spikes. Real-world conditions, not theoretical.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>3. Select Filters by Contamination Control Metrics</strong><br/>
              Choose filters based on ISO 16889 Beta Ratio (capture efficiency), dirt holding capacity, and bypass threshold—not just micron rating and OEM brand.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>4. Replace Based on Contamination Condition</strong><br/>
              Use particle counting to measure actual cleanliness. Replace filters when contamination approaches limits, not on fixed schedules. Adjust intervals based on real data.
            </p>
          </div>
        </motion.section>

        {/* 04 / Technology Mapping */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          style={{ marginBottom: '4rem' }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            04 / SYSTEM DOMAINS & TECHNOLOGY MAPPING
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Integrated Contamination Control Across All Domains
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            Industrial equipment contains multiple critical systems, each requiring contamination control:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Air Intake
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Engine/compressor intake. Target: 18µm absolute. Impact: 50-80% wear reduction.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Fuel
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Injector protection. Target: 4µm absolute. Impact: 15-40% efficiency gain.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Lube Oil
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Engine/transmission. Target: ISO 16/14/11. Impact: 3-5x component life.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Hydraulic
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Proportional valves. Target: ISO 17/15/12. Impact: 20-50% efficiency preservation.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Cabin
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Operator health. Target: ISO 11155/DIN 71220. Impact: PM10/PM2.5 reduction.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
              }}>
                Compressed Air
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.6)',
                margin: '0',
              }}>
                Air tool quality. Target: ISO 8573-1. Impact: Prevents malfunction/corrosion.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 05 / Standards Integration */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#FFF12D',
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}>
            05 / STANDARDS & CONTAMINATION FRAMEWORK
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Measurement-Based Equipment Protection
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            System-level filtration selection integrates three key standards frameworks:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>ISO 4406:</strong> Cleanliness codes (16/14/11, 17/15/12, etc.) define target contamination levels for different equipment types. These become measurable objectives.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>ISO 16889:</strong> Beta ratio testing quantifies filter capture efficiency. Critical for filter selection based on contamination control, not just micron rating.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Equipment-Specific Standards:</strong> SAE J1539 (air intake), ASTM D6304 (fuel), ISO 11155 (cabin), NFPA T2.14 (hydraulic), ISO 8573-1 (compressed air).
            </li>
          </ul>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '1.5rem',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
            }}>
              <strong style={{ color: '#FFF12D' }}>Outcome:</strong> Filtration decision-making shifts from "Is this the OEM-specified filter?" to "Does this filter system maintain our target contamination codes?" The difference is the difference between compliance and equipment protection.
            </p>
          </div>
        </motion.section>

      </div>
    </main>
  );
}
