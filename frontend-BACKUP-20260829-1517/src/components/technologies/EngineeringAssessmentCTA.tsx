'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { LeadCaptureForm } from '@/components/conversion/LeadCaptureForm';

interface EngineeringAssessmentCTAProps {
  label?: string;
  style?: CSSProperties;
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.72)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  zIndex: 100,
};

const dialogWrap: CSSProperties = {
  width: '100%',
  maxWidth: '480px',
};

const successBox: CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,241,45,0.3)',
  borderRadius: '10px',
  padding: '2rem',
  textAlign: 'center',
};

/**
 * Primary lead-gen entry point for the MACROCORE technology page: opens the
 * existing L-1 (Engineering Consultation) lead-capture form directly, without
 * waiting on the ConversionProvider trust-level gating.
 */
export function EngineeringAssessmentCTA({ label = 'Request an Engineering Assessment', style }: EngineeringAssessmentCTAProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <button
        type="button"
        data-conversion-action="application-support"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-block',
          background: '#FFF12D',
          color: '#000',
          border: 'none',
          textAlign: 'center',
          padding: '1rem 1.35rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          ...style,
        }}
      >
        {label}
      </button>

      {open && (
        <div role="presentation" style={overlay} onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            style={dialogWrap}
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div style={successBox}>
                <div style={{ color: '#FFF12D', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem' }}>
                  Request received
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
                  An ELIMFILTERS engineer will follow up on your application details.
                </p>
                <button
                  type="button"
                  onClick={close}
                  style={{
                    padding: '0.7rem 1.5rem', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
                    color: '#fff', fontFamily: 'var(--font-body)', fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <LeadCaptureForm leadType="L-1" onSubmitted={() => setSubmitted(true)} onCancel={close} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
