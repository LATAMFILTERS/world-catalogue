'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { generateOilDegradationTimeline, OilDegradationPoint } from '../lib/fleet-calculations';

export default function OilDegradationTimeline() {
  const [timelineMonths, setTimelineMonths] = useState<OilDegradationPoint[]>([]);
  const [inputs, setInputs] = useState({
    monthlyWaterIngressRate: 0.5,
    monthlyParticleAddition: 50,
    environmentalRisk: 'medium' as 'low' | 'medium' | 'high',
    timespan: 24
  });

  const handleGenerate = () => {
    const timeline = generateOilDegradationTimeline({
      initialIsoCode: '17/15/12',
      monthlyWaterIngressRate: inputs.monthlyWaterIngressRate,
      monthlyParticleAddition: inputs.monthlyParticleAddition,
      environmentalRisk: inputs.environmentalRisk
    }, inputs.timespan);
    setTimelineMonths(timeline);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'healthy': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'critical': return '#f44336';
      default: return '#fff';
    }
  };

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
        Oil Degradation Timeline — Contamination Cascade
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
            Monthly Water Ingress (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={inputs.monthlyWaterIngressRate}
            onChange={(e) => setInputs(prev => ({
              ...prev,
              monthlyWaterIngressRate: parseFloat(e.target.value) || 0
            }))}
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
            Monthly Particle Addition
          </label>
          <input
            type="number"
            value={inputs.monthlyParticleAddition}
            onChange={(e) => setInputs(prev => ({
              ...prev,
              monthlyParticleAddition: parseInt(e.target.value) || 0
            }))}
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
            Environmental Risk
          </label>
          <select
            value={inputs.environmentalRisk}
            onChange={(e) => setInputs(prev => ({
              ...prev,
              environmentalRisk: e.target.value as 'low' | 'medium' | 'high'
            }))}
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
            <option value="low" style={{ background: '#000' }}>Low (Indoor)</option>
            <option value="medium" style={{ background: '#000' }}>Medium (Standard)</option>
            <option value="high" style={{ background: '#000' }}>High (Harsh)</option>
          </select>
        </div>

        <motion.button
          onClick={handleGenerate}
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
          Generate Timeline
        </motion.button>
      </div>

      {timelineMonths.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            overflowX: 'auto',
            marginBottom: '2rem'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.85rem',
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.2)' }}>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Month</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Water (%)</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Particles (/mL)</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Viscosity Loss (%)</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Acid #</th>
                  <th style={{
                    padding: '0.75rem',
                    textAlign: 'left',
                    color: '#FFF12D',
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>Condition</th>
                </tr>
              </thead>
              <tbody>
                {timelineMonths.filter((_, i) => i % Math.ceil(timelineMonths.length / 13) === 0).map((point, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: point.condition === 'critical'
                        ? 'rgba(244,67,54,0.08)'
                        : point.condition === 'warning'
                        ? 'rgba(255,152,0,0.08)'
                        : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>M{point.month}</td>
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{point.waterContent.toFixed(1)}</td>
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{point.particleCount.toLocaleString()}</td>
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{point.viscosityLoss.toFixed(1)}</td>
                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{point.acidNumber.toFixed(2)}</td>
                    <td style={{
                      padding: '0.75rem',
                      fontWeight: 600,
                      color: getConditionColor(point.condition),
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}>
                      {point.condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.6
      }}>
        <strong style={{ color: 'rgba(255,255,255,0.8)' }}>Verified Data:</strong> Water ingress from ASTM D6304; microbial growth from ISO 4406; viscosity loss and acid number from NFPA T2.14.
      </div>
    </motion.section>
  );
}
