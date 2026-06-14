'use client';

import { useState, useEffect } from 'react';

export type ConsentState = 'accepted' | 'declined' | 'pending';

const CONSENT_KEY = 'elimfilters_cookie_consent';

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>('pending');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === 'accepted' || stored === 'declined') {
        setConsent(stored);
      }
    } catch {
      // localStorage unavailable (SSR, private mode)
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      // ignore
    }
    setConsent('accepted');
  };

  const decline = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'declined');
    } catch {
      // ignore
    }
    setConsent('declined');
  };

  return { consent, accept, decline };
}
