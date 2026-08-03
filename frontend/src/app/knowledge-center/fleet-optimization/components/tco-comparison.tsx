'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { calculateTco, TcoResult } from '../lib/fleet-calculations';

export default function TcoComparison() {
  const [equipmentCost, setEquipmentCost] = useState(150000);
  const [operatingHoursPerYear, setOperatingHoursPerYear] = useState(2000);
  const [yearsAnalyzed, setYearsAnalyzed] = useState(10);
  const [results, setResults] = useState<{ commodity: TcoResult; system: TcoResult } | null>(null);

  const handleCalculate = () => {
    const commodity = calculateTco({
      equipmentCost,
      operatingHoursPerYear,
      yearsAnalyzed
    }, 'commodity');

    const system = calculateTco({
      equipmentCost,
      operatingHoursPerYear,
      yearsAnalyzed
    }, 'system');

    setResults({ commodity, system });
  };

  const totalHours = operatingHoursPerYear * yearsAnalyzed;
  const savings = results ? results.commodity.total - results.system.total : 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, rgba(255,241,45,0.05) 0%, rgba(255,241,45,0.02) 100%)',
        border: '1px solid rgba(255,241,45,0.15)',
        borderRadius: '12px',
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        marginBottom: '3rem'
      }}
    >
      <h2 style={{
        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
        fontWeight: 700,
        color: '#FFF12D',
        marginBottom: '1.5rem',
        fontFamily: 'Outfit, sans-serif'
      }}>
        Total Cost of Ownership (TCO) Comparison
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '0.5rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Equipment Cost ($)
          </label>
          <input
            type="number"
            value={equipmentCost}
            onChange={(e) => setEquipmentCost(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,241,45,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '0.5rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Operating Hours/Year
          </label>
          <input
            type="number"
            value={operatingHoursPerYear}
            onChange={(e) => setOperatingHoursPerYear(parseInt(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,241,45,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '0.5rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Analysis Period (Years)
          </label>
          <select
            value={yearsAnalyzed}
            onChange={(e) => setYearsAnalyzed(parseInt(e.target.value) || 10)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,241,45,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.9rem'
            }}
          >
            <option value="5" style={{ background: '#000' }}>5 Years</option>
            <option value="10" style={{ background: '#000' }}>10 Years</option>
            <option value="15" style={{ background: '#000' }}>15 Years</option>
          </select>
        </div>

        <motion.button
          onClick={handleCalculate}
          whileHover={{ background: 'rgba(255,241,45,0.15)' }}
          style={{
            padding: '0.75rem',
            background: 'rgba(255,241,45,0.1)',
            border: '1px solid rgba(255,241,45,0.3)',
            color: '#FFF12D',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Calculate TCO
        </motion.button>
      </div>

      {results && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(76,175,80,0.1)',
            border: '2px solid rgba(76,175,80,0.3)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                Total Hours
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#FFF12D'
              }}>
                {(totalHours / 1000).toFixed(0)}K
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                10-Year Savings
              </div>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#4caf50'
              }}>
                ${(savings / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {results && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}
        >
          <div style={{
            background: 'rgba(244,67,54,0.08)',
            border: '2px solid rgba(244,67,54,0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#f44336',
              marginBottom: '1.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Commodity Approach
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Filters
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                ${(results.commodity.filterCosts / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Maintenance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                ${(results.commodity.maintenanceCosts / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Downtime
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f44336' }}>
                ${(results.commodity.downtime / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(244,67,54,0.15)',
              borderRadius: '6px',
              border: '1px solid rgba(244,67,54,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Failures
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f44336' }}>
                ${(results.commodity.prematureFailure / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '2px solid rgba(244,67,54,0.3)' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Total TCO ({yearsAnalyzed}y)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f44336' }}>
                ${(results.commodity.total / 1000).toFixed(1)}K
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(76,175,80,0.08)',
            border: '2px solid rgba(76,175,80,0.3)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#4caf50',
              marginBottom: '1.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              System Approach
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Filters
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                ${(results.system.filterCosts / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Maintenance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                ${(results.system.maintenanceCosts / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Downtime
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4caf50' }}>
                ${(results.system.downtime / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(76,175,80,0.15)',
              borderRadius: '6px',
              border: '1px solid rgba(76,175,80,0.3)'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Failures
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4caf50' }}>
                ${(results.system.prematureFailure / 1000).toFixed(1)}K
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem', borderTop: '2px solid rgba(76,175,80,0.3)' }}>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Total TCO ({yearsAnalyzed}y)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4caf50' }}>
                ${(results.system.total / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>TCO Methodology:</strong> Commodity: OEM filters ($150 every 1000h), reactive maintenance ($500 every 2000h), 8h downtime per 5000h ($500/hr), failure every 8000h ($45K). System: Premium filters ($250 every 1500h), predictive maintenance ($400 every 4000h), 2h downtime per 20000h, failure every 35000h ($15K).
      </div>
    </motion.section>
  );
}
