'use client';

import { motion } from 'motion/react';
import { useConversion } from './ConversionContext';
import type { LeadType } from './ConversionContext';

interface CTACardProps {
  onLeadCapture: (leadType: LeadType) => void;
}

const CTA_CONFIG: Record<LeadType, { label: string; description: string; primary: boolean; minTrust: number }> = {
  'L-1': { label: 'Request Engineering Consultation', description: 'Speak with our filtration engineers about your specific application.', primary: true, minTrust: 5 },
  'L-2': { label: 'Request a Quote', description: 'Get pricing for your recommended protection system.', primary: true, minTrust: 5 },
  'L-3': { label: 'Find a Distributor', description: 'Locate an authorised ELIMFILTERS distributor in your region.', primary: false, minTrust: 3 },
  'L-4': { label: 'Download Technical Specification', description: 'Access the full engineering data sheet for your selected technologies.', primary: false, minTrust: 3 },
  'L-5': { label: 'Subscribe to Engineering Updates', description: 'Receive contamination control research and application notes.', primary: false, minTrust: 1 },
  'L-6': { label: 'Request Failure Analysis', description: 'Submit your failure data for a formal root cause report.', primary: false, minTrust: 2 },
  'L-7': { label: 'Enquire About Training', description: 'Contamination control and filtration engineering training programmes.', primary: false, minTrust: 6 },
};

export function CTACard({ onLeadCapture }: CTACardProps) {
  const { state } = useConversion();
  const { eligibleCTAs, currentTrustLevel } = state;

  if (eligibleCTAs.length === 0) return null;

  const primary = eligibleCTAs.filter(id => CTA_CONFIG[id]?.primary);
  const secondary = eligibleCTAs.filter(id => !CTA_CONFIG[id]?.primary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {primary.map(id => {
        const cfg = CTA_CONFIG[id];
        return (
          <div key={id} style={{
            padding: '1.5rem',
            background: 'rgba(255,241,45,0.06)',
            border: '1px solid rgba(255,241,45,0.3)',
            borderRadius: '8px',
          }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: '#fff', marginBottom: '0.4rem', fontSize: '1rem' }}>
              {cfg.label}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              {cfg.description}
            </div>
            <button
              onClick={() => onLeadCapture(id)}
              style={{
                padding: '0.7rem 1.75rem',
                background: '#FFF12D', border: 'none', borderRadius: '4px',
                color: '#000', fontFamily: 'Outfit, sans-serif',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              {cfg.label} →
            </button>
          </div>
        );
      })}

      {secondary.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {secondary.map(id => {
            const cfg = CTA_CONFIG[id];
            return (
              <button
                key={id}
                onClick={() => onLeadCapture(id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '4px', color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}

      {currentTrustLevel < 5 && (
        <div style={{
          fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)',
          fontFamily: 'JetBrains Mono, monospace', paddingTop: '0.25rem',
        }}>
          TRUST LEVEL {currentTrustLevel}/7 — Additional options unlock as you explore the engineering data
        </div>
      )}
    </motion.div>
  );
}
