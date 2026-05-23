'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export default function FleetSolutionsPage() {
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
            Fleet Filtration Solutions
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
            Designing standardized contamination control strategies for multi-equipment fleet operations.
          </motion.p>
        </div>
      </section>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 2rem' }}>

        {/* 01 / Fleet Complexity */}
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
            01 / FLEET FILTRATION COMPLEXITY
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Managing Multiple Equipment Types
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1rem',
          }}>
            Fleet operators face unique filtration challenges:
          </p>
          <ul style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginLeft: '1.5rem',
            marginBottom: '1rem',
          }}>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Multiple Equipment Types:</strong> Trucks, excavators, loaders, compressors, hydraulic systems. Each has different filtration requirements and operating conditions.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Diverse Operating Conditions:</strong> Urban, rural, dusty construction sites, wet environments, extreme temperatures. Contamination loads vary dramatically across fleet.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Supply Chain Complexity:</strong> Managing inventory of dozens of filter part numbers across multiple suppliers. Risk of obsolescence, overstocking, and supply disruption.
            </li>
            <li style={{ marginBottom: '0.75rem' }}>
              <strong style={{ color: '#FFF12D' }}>Maintenance Coordination:</strong> Technicians across multiple locations. Inconsistent filter selection, replacement intervals, and maintenance practices.
            </li>
            <li>
              <strong style={{ color: '#FFF12D' }}>Cost Visibility Gap:</strong> Filter purchases scattered across maintenance budgets, OEM dealers, and aftermarket suppliers. No unified cost tracking or TCO optimization.
            </li>
          </ul>
        </motion.section>

        {/* 02 / Fleet Strategy */}
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
            02 / STANDARDIZED CONTAMINATION CONTROL STRATEGY
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Unified Approach Across Equipment Diversity
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '1.5rem',
          }}>
            Fleet-wide contamination control requires standardization without sacrificing equipment-specific optimization:
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2rem',
            borderRadius: '8px',
          }}>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>1. Define Fleet Equipment Categories</strong><br/>
              Group equipment by type and operating environment (e.g., on-highway trucks, construction equipment, stationary compressors). Each category has similar contamination exposure and filtration requirements.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>2. Establish Contamination Targets</strong><br/>
              Set ISO 4406 cleanliness codes for each category (engine lube, hydraulic, fuel, etc.). These targets apply across all equipment in the category regardless of brand or model variation.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '1rem',
              margin: '0 0 1rem 0',
            }}>
              <strong style={{ color: '#FFF12D' }}>3. Select Standard Filters</strong><br/>
              Choose 1-2 high-quality filters per equipment type that meet or exceed OEM specs for that category. Minimize supplier count. Negotiate volume pricing. Establish predictable inventory.
            </p>
            <p style={{
              fontSize: '0.95rem',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.7)',
              margin: '0',
            }}>
              <strong style={{ color: '#FFF12D' }}>4. Deploy Condition-Based Intervals</strong><br/>
              Replace filters when particle counts indicate contamination approaching targets, not on fixed schedules. Intervals vary by operating environment but are data-driven, not arbitrary.
            </p>
          </div>
        </motion.section>

        {/* 03 / Supply Chain Optimization */}
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
            03 / FLEET SUPPLY CHAIN OPTIMIZATION
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Cost Efficiency & Inventory Control
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Supplier Consolidation
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Reduce from 5-10 suppliers to 2-3. Larger volumes enable better pricing. Simplified ordering and logistics.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Inventory Reduction
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Standard filters across equipment categories reduce SKUs. Faster turnover. Lower carrying costs.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Maintenance Consistency
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Standardized filters simplify technician training. Reduced error. Consistent performance across fleet.
              </p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '1.5rem',
              borderRadius: '8px',
            }}>
              <p style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#FFF12D',
                marginBottom: '0.75rem',
              }}>
                Price Transparency
              </p>
              <p style={{
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                Centralized purchasing. Unified cost tracking. TCO visibility across fleet operations.
              </p>
            </div>
          </div>
        </motion.section>

        {/* 04 / Implementation */}
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
            04 / FLEET IMPLEMENTATION ROADMAP
          </p>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 700,
            fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: '1.5rem',
            lineHeight: 1.2,
          }}>
            Transitioning to System-Level Fleet Filtration
          </h2>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,241,45,0.08) 0%, rgba(0,255,0,0.03) 100%)',
            border: '1px solid rgba(255,241,45,0.15)',
            borderRadius: '8px',
            padding: '2rem',
          }}>
            <div style={{
              borderLeft: '3px solid #FFF12D',
              paddingLeft: '1.5rem',
              marginLeft: '0',
            }}>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '1rem',
                margin: '0 0 1rem 0',
              }}>
                <strong style={{ color: '#FFF12D' }}>Phase 1: Inventory & Baseline</strong><br/>
                Document all equipment types, current filters, replacement frequencies. Establish baseline particle count data. Identify current TCO drivers.
              </p>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '1rem',
                margin: '0 0 1rem 0',
              }}>
                <strong style={{ color: '#FFF12D' }}>Phase 2: Contamination Target Definition</strong><br/>
                Define ISO 4406 cleanliness targets for each equipment category. Establish measurement protocols (particle counting, interval frequency).
              </p>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '1rem',
                margin: '0 0 1rem 0',
              }}>
                <strong style={{ color: '#FFF12D' }}>Phase 3: Standard Filter Selection</strong><br/>
                Select 1-2 high-quality filters per equipment category. Negotiate volume contracts. Phase out non-standard filters.
              </p>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.7)',
                margin: '0',
              }}>
                <strong style={{ color: '#FFF12D' }}>Phase 4: Condition-Based Maintenance</strong><br/>
                Deploy particle counting. Replace filters based on contamination condition, not schedule. Train technicians. Establish feedback loops for continuous improvement.
              </p>
            </div>
          </div>
          <p style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: 'rgba(255,255,255,0.7)',
            marginTop: '1.5rem',
          }}>
            Expected outcomes: 15-25% reduction in filter costs, 30-50% improvement in equipment reliability, 20-30% reduction in unplanned downtime, measurable extension of equipment life.
          </p>
        </motion.section>

      </div>
    </main>
  );
}
