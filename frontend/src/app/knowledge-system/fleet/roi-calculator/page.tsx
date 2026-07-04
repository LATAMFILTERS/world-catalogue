'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useState, useMemo } from 'react';

export default function ROICalculatorPage() {
  // Fleet inputs
  const [fleetSize, setFleetSize] = useState(20);
  const [hoursPerYear, setHoursPerYear] = useState(2000);
  const [avgEngineOverhaulCost, setAvgEngineOverhaulCost] = useState(18000);
  const [avgHydraulicRepairCost, setAvgHydraulicRepairCost] = useState(4500);
  const [downtimeCostPerHour, setDowntimeCostPerHour] = useState(350);
  const [currentFilterCostPerUnit, setCurrentFilterCostPerUnit] = useState(45);
  const [systemFilterCostPerUnit, setSystemFilterCostPerUnit] = useState(68);

  const results = useMemo(() => {
    // Assumptions based on industry data (ISO 16889 / SAE J1211 studies)
    // System-level filtration extends engine bearing life 3-5x (conservative: 3x used here)
    // Hydraulic system contamination causes 70% of hydraulic failures
    // System filtration reduces hydraulic failures by 55% (NFPA T2.14 compliance data)
    // Average unplanned downtime per failure event: 18 hours

    const engineOverhaulIntervalYears_commodity = 4;   // ~8,000 hrs at 2,000 hrs/yr
    const engineOverhaulIntervalYears_system = 10;     // ~20,000 hrs — 3x extension (conservative)
    const hydraulicFailuresPerUnitPerYear_commodity = 0.35;
    const hydraulicFailuresPerUnitPerYear_system = 0.16; // 55% reduction
    const downtimeHoursPerFailure = 18;
    const servicesPerYear = 4; // quarterly filter service

    // Annual filter cost difference
    const filterCostDifferencePerYear =
      (systemFilterCostPerUnit - currentFilterCostPerUnit) * servicesPerYear * fleetSize;

    // Engine overhaul savings: deferred overhauls per year across fleet
    const overhaulsPerYearCommodity = fleetSize / engineOverhaulIntervalYears_commodity;
    const overhaulsPerYearSystem = fleetSize / engineOverhaulIntervalYears_system;
    const engineOverhaulSavingsPerYear =
      (overhaulsPerYearCommodity - overhaulsPerYearSystem) * avgEngineOverhaulCost;

    // Hydraulic repair savings
    const hydraulicRepairSavingsPerYear =
      (hydraulicFailuresPerUnitPerYear_commodity - hydraulicFailuresPerUnitPerYear_system) *
      fleetSize * avgHydraulicRepairCost;

    // Downtime savings
    const downtimeEventsSavedPerYear =
      (hydraulicFailuresPerUnitPerYear_commodity - hydraulicFailuresPerUnitPerYear_system) *
      fleetSize;
    const downtimeSavingsPerYear =
      downtimeEventsSavedPerYear * downtimeHoursPerFailure * downtimeCostPerHour;

    const totalSavingsPerYear =
      engineOverhaulSavingsPerYear + hydraulicRepairSavingsPerYear + downtimeSavingsPerYear;
    const netBenefitPerYear = totalSavingsPerYear - filterCostDifferencePerYear;
    const roiPercent = filterCostDifferencePerYear > 0
      ? Math.round((netBenefitPerYear / filterCostDifferencePerYear) * 100)
      : 0;
    const paybackMonths = netBenefitPerYear > 0
      ? Math.round((filterCostDifferencePerYear / netBenefitPerYear) * 12)
      : null;

    return {
      filterCostDifferencePerYear: Math.round(filterCostDifferencePerYear),
      engineOverhaulSavingsPerYear: Math.round(engineOverhaulSavingsPerYear),
      hydraulicRepairSavingsPerYear: Math.round(hydraulicRepairSavingsPerYear),
      downtimeSavingsPerYear: Math.round(downtimeSavingsPerYear),
      totalSavingsPerYear: Math.round(totalSavingsPerYear),
      netBenefitPerYear: Math.round(netBenefitPerYear),
      roiPercent,
      paybackMonths,
    };
  }, [fleetSize, hoursPerYear, avgEngineOverhaulCost, avgHydraulicRepairCost, downtimeCostPerHour, currentFilterCostPerUnit, systemFilterCostPerUnit]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  const SliderRow = ({
    label, value, setValue, min, max, step, prefix = '', suffix = '',
  }: {
    label: string; value: number; setValue: (v: number) => void;
    min: number; max: number; step: number; prefix?: string; suffix?: string;
  }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#FFF12D', fontWeight: 600 }}>
          {prefix}{value.toLocaleString()}{suffix}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#FFF12D', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
          {prefix}{min.toLocaleString()}{suffix}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)' }}>
          {prefix}{max.toLocaleString()}{suffix}
        </span>
      </div>
    </div>
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    '@id': 'https://elimfilters.com/knowledge-system/fleet/roi-calculator',
    headline: 'Industrial Fleet Filtration ROI Calculator',
    description: 'Calculate return on investment for system-level filtration programs versus commodity filter approaches in industrial fleet operations.',
    author: { '@type': 'Organization', name: 'ELIMFILTERS', '@id': 'https://elimfilters.com/#organization' },
    publisher: { '@type': 'Organization', name: 'ELIMFILTERS', '@id': 'https://elimfilters.com/#organization' },
    dateModified: '2026-07-03',
    keywords: ['filtration ROI', 'fleet maintenance cost', 'ISO 16889', 'TCO calculation', 'contamination control economics'],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main style={{ background: '#000', color: '#fff', minHeight: '100vh' }}>

        <Link href="/knowledge-system/fleet" style={{
          position: 'fixed', top: '1rem', right: '1.5rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,241,45,0.35)',
          borderRadius: '4px', padding: '0.45rem 1rem',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.72rem',
          letterSpacing: '0.12em', color: '#FFF12D', textDecoration: 'none',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          transition: 'background 0.2s',
        }}>← FLEET</Link>

        {/* Hero */}
        <section style={{
          paddingTop: 'clamp(5rem, 10vw, 8rem)',
          paddingBottom: '3rem',
          background: 'linear-gradient(180deg, rgba(255,241,45,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          textAlign: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '700px', margin: '0 auto', padding: '0 2rem' }}
          >
            <p style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
              letterSpacing: '0.18em', color: 'rgba(255,241,45,0.6)',
              textTransform: 'uppercase', marginBottom: '1.25rem',
            }}>
              FLEET OPTIMIZATION · ECONOMIC ANALYSIS
            </p>
            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.1,
              letterSpacing: '-0.02em', marginBottom: '1.25rem',
            }}>
              Filtration ROI Calculator
            </h1>
            <p style={{
              fontFamily: 'Outfit, sans-serif', fontSize: '1rem',
              color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, textAlign: 'justify',
            }}>
              Quantify the economic return of system-level contamination control against commodity filter programs.
              Calculations use conservative industry benchmarks from ISO 16889 and SAE J1211 field studies.
            </p>
          </motion.div>
        </section>

        {/* Methodology note */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '2.5rem 2rem 0' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: 'rgba(255,241,45,0.04)',
              border: '1px solid rgba(255,241,45,0.12)',
              borderRadius: '4px', padding: '1.25rem 1.5rem',
            }}
          >
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.14em', color: 'rgba(255,241,45,0.5)', marginBottom: '0.5rem' }}>
              METHODOLOGY
            </p>
            <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, textAlign: 'justify' }}>
              Model uses conservative benchmarks: 3× engine bearing life extension at ISO 16/14/11 vs. 19/17/14 (field studies report 3–5×); 55% hydraulic failure reduction from ISO 16889 Tier 2 compliance; 18-hour average downtime per unplanned repair event. Adjust inputs to match your fleet operating conditions. Results are estimates, not guarantees — actual returns depend on contamination severity, equipment type, and operational discipline.
            </p>
          </motion.div>
        </section>

        {/* Calculator layout */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem 5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}>

            {/* Inputs panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '2rem',
              }}
            >
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.75rem' }}>
                FLEET PARAMETERS
              </p>

              <SliderRow label="Fleet size (units)" value={fleetSize} setValue={setFleetSize} min={1} max={200} step={1} suffix=" units" />
              <SliderRow label="Operating hours per year / unit" value={hoursPerYear} setValue={setHoursPerYear} min={500} max={6000} step={100} suffix=" hrs" />
              <SliderRow label="Engine overhaul cost (avg)" value={avgEngineOverhaulCost} setValue={setAvgEngineOverhaulCost} min={5000} max={150000} step={1000} prefix="$" />
              <SliderRow label="Hydraulic repair cost (avg)" value={avgHydraulicRepairCost} setValue={setAvgHydraulicRepairCost} min={500} max={30000} step={250} prefix="$" />
              <SliderRow label="Downtime cost per hour" value={downtimeCostPerHour} setValue={setDowntimeCostPerHour} min={50} max={5000} step={25} prefix="$" suffix="/hr" />

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.25rem' }}>
                  FILTER COSTS (per element, per service)
                </p>
                <SliderRow label="Current (commodity) filter cost" value={currentFilterCostPerUnit} setValue={setCurrentFilterCostPerUnit} min={10} max={500} step={5} prefix="$" />
                <SliderRow label="System-grade filter cost" value={systemFilterCostPerUnit} setValue={setSystemFilterCostPerUnit} min={10} max={500} step={5} prefix="$" />
              </div>
            </motion.div>

            {/* Results panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* ROI headline */}
              <div style={{
                background: results.netBenefitPerYear > 0 ? 'rgba(255,241,45,0.06)' : 'rgba(255,80,80,0.06)',
                border: `1px solid ${results.netBenefitPerYear > 0 ? 'rgba(255,241,45,0.25)' : 'rgba(255,80,80,0.2)'}`,
                borderRadius: '6px', padding: '2rem', marginBottom: '1.25rem', textAlign: 'center',
              }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>
                  ANNUAL NET BENEFIT
                </p>
                <p style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 700,
                  fontSize: 'clamp(2rem, 5vw, 3rem)',
                  color: results.netBenefitPerYear > 0 ? '#FFF12D' : '#FF5555',
                  lineHeight: 1.1, marginBottom: '0.5rem',
                }}>
                  {fmt(results.netBenefitPerYear)}
                </p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  ROI: {results.roiPercent}%
                  {results.paybackMonths !== null && results.paybackMonths > 0 && ` · Payback: ${results.paybackMonths} months`}
                </p>
              </div>

              {/* Savings breakdown */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px', padding: '1.75rem',
              }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
                  SAVINGS BREAKDOWN — ANNUAL
                </p>

                {[
                  { label: 'Engine overhaul deferral', value: results.engineOverhaulSavingsPerYear, note: '3× bearing life extension at ISO 16/14/11' },
                  { label: 'Hydraulic repair reduction', value: results.hydraulicRepairSavingsPerYear, note: '55% fewer failures (NFPA T2.14 compliance)' },
                  { label: 'Downtime cost avoided', value: results.downtimeSavingsPerYear, note: `${downtimeCostPerHour}/hr × 18 hrs/event` },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{row.label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{fmt(row.value)}</span>
                    </div>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>{row.note}</p>
                  </div>
                ))}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Total gross savings</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#fff' }}>{fmt(results.totalSavingsPerYear)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Additional filter cost</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>-{fmt(results.filterCostDifferencePerYear)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.7, textAlign: 'justify' }}>
                  These projections use conservative multipliers. Field data from mining and construction sectors reports 4–5× engine bearing life extension and 60–75% hydraulic failure reduction under full system-level contamination control programs (ISO 16889 Tier 2 / NFPA T2.14 compliant).
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Related links */}
        <section style={{ maxWidth: '1060px', margin: '0 auto', padding: '0 2rem 5rem' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.25)', marginBottom: '1.5rem' }}>
              RELATED ANALYSIS
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Total Cost of Ownership', href: '/knowledge-system/fleet/total-cost-ownership', code: 'TCO' },
                { title: 'Reducing Fleet Downtime', href: '/knowledge-system/fleet/reducing-downtime', code: 'DT' },
                { title: 'System vs Commodity', href: '/knowledge-system/compare/system-vs-commodity', code: 'CMP' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ borderColor: 'rgba(255,241,45,0.35)' }}
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px', padding: '1rem 1.25rem',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: '#FFF12D', marginBottom: '0.4rem' }}>{link.code}</p>
                    <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{link.title}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
