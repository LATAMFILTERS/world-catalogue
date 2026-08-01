'use client';

import Link from 'next/link';
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
            width: 'min(680px, calc(100vw - 2rem))',
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
          <p style={{ flex: 1, minWidth: '220px', fontFamily: 'Outfit, sans-serif', fontSize: '0.82rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.65)', margin: 0 }}>
            We use optional analytics providers, including GA4, PostHog, and Microsoft Clarity, to understand platform usage and improve our services. We do not sell personal information. See our{' '}
            <Link href="/legal/cookies" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Cookie Policy</Link>
            {' '}and{' '}
            <Link href="/legal/privacy" style={{ color: '#FFF12D', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
            <button onClick={decline} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
              DECLINE
            </button>
            <button onClick={accept} style={{ padding: '0.5rem 1.25rem', background: '#FFF12D', border: 'none', borderRadius: '4px', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}>
              ACCEPT
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
