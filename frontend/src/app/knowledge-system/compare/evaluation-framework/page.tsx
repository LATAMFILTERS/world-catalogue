'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import RetrievalBlock from '@/components/RetrievalBlock';

export default function EvaluationFrameworkPage() {
  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>
      <Link href="/knowledge-system/compare" style={{
        position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px', padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
        letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
        backdropFilter: 'blur(8px)',
      }}>← COMPARISON</Link>

      {/* Hero Section */}
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
              // FILTER EVALUATION
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
            Filter Evaluation Framework
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
            Shift from product specifications to contamination control effectiveness metrics.
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 / The Specification Trap */}
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
            01 / THE SPECIFICATION TRAP
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Why Meeting Specs Is Not Enough
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Traditional filter evaluation focuses on:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>Micron rating (10µm, 3µm nominal filtration)</li>
            <li style={{ marginBottom: '0.75rem' }}>Flow capacity (liters per minute, gallons per hour)</li>
            <li style={{ marginBottom: '0.75rem' }}>Pressure drop at rated flow</li>
            <li style={{ marginBottom: '0.75rem' }}>Service interval (OEM replacement cycle)</li>
            <li style={{ marginBottom: '0.75rem' }}>Bypass pressure setting (safety valve activation point)</li>
          </ul>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
          }}>
            All OEM-compliant filters meet these specifications. Yet equipment failure rates vary dramatically. Why? Because specifications define minimum requirements, not system-level performance. The <Link href="/knowledge-system/bridges/industrial-filtration" style={{ color: '#FFF12D', textDecoration: 'underline' }}>industrial filtration system design framework</Link> provides the foundation for understanding what measurable contamination control actually requires.
          </p>
        </motion.section>

        {/* 02 / Contamination Control Metrics */}
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
            02 / CONTAMINATION CONTROL METRICS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            What Actually Matters: Measurable Cleanliness
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            System-level filter evaluation focuses on measurable contamination control. The <Link href="/knowledge-system/standards/iso-4406" style={{ color: '#FFF12D', textDecoration: 'underline' }}>ISO 4406 particle cleanliness code</Link> is the primary classification tool that quantifies whether a filter system is actually achieving its target in operating equipment:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                ISO 16889 Beta Ratio
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Percentage of particles above filter micron rating that are captured. Higher beta = better contamination control. Example: β10≥75 means 75% of 10µm+ particles are removed.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                ISO 4406 Target Codes
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Cleanliness targets for specific equipment (engine oil: 16/14/11, hydraulic: 17/15/12). Measured via particle counting. Direct indicator of contamination control effectiveness.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Bypass Threshold
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Pressure differential at which unfiltered flow bypasses the element. Higher threshold = more contamination captured before bypass. Critical for real-world conditions.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Dirt Holding Capacity
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Total contaminant mass the filter can capture before reaching bypass threshold. Higher capacity = longer service life under actual contamination loads.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                Real-World Cleanliness Targets
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Particle counts measured in operating equipment, not just laboratory conditions. Reveals if contamination targets are actually achieved in deployment.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,241,45,0.06)',
              border: '1px solid rgba(255,241,45,0.15)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
              }}>
                System Bypass Conditions
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Frequency and duration of unfiltered flow due to high pressure differential or valve failure. Directly correlates to equipment wear acceleration.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 03 / Evaluation Decision Tree */}
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
            03 / FILTER EVALUATION DECISION TREE
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            System-Level Selection Process
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
            borderRadius: '8px',
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Step 1: Define Contamination Target
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Determine the ISO 4406 cleanliness code required for equipment type and application (engine oil: 16/14/11, hydraulic: 17/15/12, fuel: 15/13/10, etc.)
              </p>
            </div>
            <div style={{
              borderLeft: '2px solid rgba(255,241,45,0.3)',
              paddingLeft: '1rem',
              marginLeft: '1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Step 2: Calculate Contamination Load
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Assess actual particle ingestion rate: air intake volume, fuel water content, oil change interval, system condition. Not theoretical—measured from operating conditions.
              </p>
            </div>
            <div style={{
              borderLeft: '2px solid rgba(255,241,45,0.3)',
              paddingLeft: '1rem',
              marginLeft: '1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Step 3: Select Filter Metrics
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Choose filter based on contamination load and target: Micron rating must be finer than contamination source size. Beta ratio must be high (≥75 minimum) for target cleanliness. Bypass threshold must exceed expected pressure conditions.
              </p>
            </div>
            <div style={{
              borderLeft: '2px solid rgba(255,241,45,0.3)',
              paddingLeft: '1rem',
              marginLeft: '1rem',
              marginBottom: '1.5rem',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Step 4: Verify Service Interval
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Calculate replacement interval based on: (Dirt Holding Capacity) / (Actual Contamination Load). Not OEM interval—actual measured condition. Monitor pressure differential to verify target is maintained.
              </p>
            </div>
            <div style={{
              borderLeft: '2px solid rgba(255,241,45,0.3)',
              paddingLeft: '1rem',
              marginLeft: '1rem',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Step 5: Measure & Validate
              </p>
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
              }}>
                Verify target cleanliness is achieved: Monthly particle counts confirm ISO 4406 target maintained. Adjust interval if contamination target drifts. Use data to optimize cycle time and cost.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 04 / Why This Approach Works */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
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
            04 / WHY THIS APPROACH WORKS
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
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
            }}>
              This framework shifts decision-making from brand recognition and price competition to measurable contamination control. Applying these metrics produces direct improvements in <Link href="/knowledge-system/fleet/total-cost-ownership" style={{ color: '#FFF12D', textDecoration: 'underline' }}>total cost of ownership</Link>, since service intervals driven by measured contamination loads replace fixed calendar schedules that may be too early or dangerously late:
            </p>
            <ul style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginLeft: '1.5rem',
            }}>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#FFF12D' }}>Objective:</strong> Filter selection is based on measured contamination, not product brand</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#FFF12D' }}>Quantifiable:</strong> Cleanliness targets (ISO codes) and particle counts provide measurable verification</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#FFF12D' }}>Optimized:</strong> Service intervals are calculated from actual load, not OEM estimates</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#FFF12D' }}>Adaptive:</strong> Data-driven monitoring reveals when conditions change</li>
              <li style={{ marginBottom: '0.75rem' }}><strong style={{ color: '#FFF12D' }}>Verifiable:</strong> Equipment reliability improvement is directly measurable</li>
            </ul>
          </div>
        </motion.section>

      </div>

      <RetrievalBlock>
        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem' }}>CANONICAL KNOWLEDGE BLOCK: Filter Evaluation Framework</p>
        <p style={{ marginBottom: '1rem', opacity: 0.5, fontSize: '0.65rem' }}>version: 1.1 | last_updated: 2026-06-11</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>DEFINITION</p>
        <p>The filter evaluation framework replaces OEM part number equivalence as the primary filter selection criterion with a contamination-control performance hierarchy: (1) ISO 16889 Beta ratio at the relevant micron threshold, (2) dirt-holding capacity for the intended service interval, (3) collapse pressure certification per ISO 5011, and (4) dimensional fit compliance — in that priority order.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>SYSTEMS</p>
        <p>Filter procurement processes, fleet maintenance programs, OEM specification compliance assessment, aftermarket filter qualification, maintenance contract specification writing, contamination control auditing</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>FAILURE_IMPACT</p>
        <p>Selecting filters based solely on OEM part number equivalence without Beta ratio verification: filters certified as "equivalent" may have β10 = 20 (95% efficiency) vs. original β10 = 200 (99.5% efficiency) → 10x more particles pass downstream → ISO 4406 cleanliness target unachievable → contamination control system fails without any observable filter defect → component wear accelerates silently → failure occurs 2,000–5,000 hours after wrong filter selection decision with no direct traceability to the root cause.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_STANDARDS</p>
        <p>ISO 16889: Beta ratio filter efficiency test — criterion 1 in the evaluation framework | ISO 5011: Air filter collapse pressure test — criterion 3 for air filter structural integrity | ISO 4406: Cleanliness code targets — the outcome criteria that the evaluation framework is designed to achieve | ISO 9001: Quality management for filter manufacturers — process quality baseline for supplier qualification</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>RELATED_TECHNOLOGIES</p>
        <p>MACROCORE: ISO 16889 certified — demonstrated Beta ratio, dirt capacity, and collapse pressure data for framework-compliant selection | NANOFORCE: Sub-3µm Beta ratio certified — enabling ISO 4406 cleanliness codes tighter than 17/15/12 | SYNTRAX, DURATECH: Extended lifecycle certified elements with documented service interval performance data</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>INDUSTRIAL_ROLE</p>
        <p>The filter evaluation framework is the operational tool for converting contamination control theory into procurement decisions — it eliminates the "equivalent OEM" selection path that systematically underperforms on contamination control while appearing compliant, replacing it with measurable performance criteria that can be verified against ISO standards.</p>

        <p style={{ fontWeight: 700, color: '#FFF12D', marginBottom: '0.25rem', marginTop: '0.75rem' }}>CITATION_REFERENCE</p>
        <p>source: elimfilters.com/knowledge-system/compare/evaluation-framework | concept: Filter Evaluation Framework | version: 1.1 | last_updated: 2026-06-11</p>
      </RetrievalBlock>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "Filter Evaluation Framework — Contamination-Based Selection Criteria",
        "description": "Filter evaluation framework replaces OEM part number equivalence with ISO 16889 Beta ratio, dirt capacity, collapse pressure, and dimensional fit as the performance-based selection hierarchy.",
        "author": { "@type": "Organization", "name": "ELIMFILTERS" },
        "keywords": ["filter evaluation framework", "ISO 16889 selection criteria", "filter procurement", "Beta ratio certification", "filter qualification", "contamination control selection"],
        "about": { "@type": "Thing", "name": "Filter Evaluation Framework", "description": "Performance-based filter selection framework using ISO standards as qualification criteria" },
        "mentions": {
          "standards": ["ISO 16889", "ISO 5011", "ISO 4406", "ISO 9001"],
          "technologies": ["MACROCORE", "NANOFORCE", "SYNTRAX", "DURATECH"],
          "contaminationModes": ["particle contamination", "contamination target failure", "filter bypass"]
        }
      })}} />
    </main>
  );
}
