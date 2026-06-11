'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useConsent } from '@/lib/useConsent';

export default function ConsentBanner() {
  const { consent, accept, decline } = useConsent();

  return (
    <AnimatePresence>
      {consent === 'pending' && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-label="Cookie and analytics consent"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000,
            width: 'min(640px, calc(100vw - 2rem))',
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,241,45,0.2)',
            borderRadius: '6px',
            padding: '1.25rem 1.5rem',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <p
            style={{
              flex: 1,
              minWidth: '200px',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              color: 'rgba(255,255,255,0.65)',
              margin: 0,
            }}
          >
            We use analytics (GA4, PostHog, Clarity) to improve the ELIMFILTERS® platform.
            No personal data is shared with third parties.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button
              onClick={decline}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              DECLINE
            </button>
            <button
              onClick={accept}
              style={{
                padding: '0.5rem 1.25rem',
                background: '#FFF12D',
                border: 'none',
                borderRadius: '4px',
                color: '#000',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(255,241,45,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ACCEPT
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
