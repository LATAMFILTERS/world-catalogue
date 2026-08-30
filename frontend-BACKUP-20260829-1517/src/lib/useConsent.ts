'use client';

import { useState, useEffect } from 'react';

export type ConsentState = 'accepted' | 'declined' | 'pending';

const CONSENT_KEY = 'elimfilters_cookie_consent';
const CONSENT_EVENT = 'elimfilters:consent-change';

function readStoredConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'accepted' || stored === 'declined') return stored;
  } catch {
    // localStorage may be unavailable.
  }
  return 'pending';
}

function publishConsent(consent: Exclude<ConsentState, 'pending'>) {
  try {
    localStorage.setItem(CONSENT_KEY, consent);
  } catch {
    // Ignore unavailable storage.
  }

  window.dispatchEvent(
    new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: consent })
  );
}

export function useConsent() {
  const [consent, setConsent] = useState<ConsentState>('pending');

  useEffect(() => {
    setConsent(readStoredConsent());

    const handleConsentChange = (event: Event) => {
      const next = (event as CustomEvent<ConsentState>).detail;
      if (next === 'accepted' || next === 'declined') setConsent(next);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== CONSENT_KEY) return;
      setConsent(
        event.newValue === 'accepted' || event.newValue === 'declined'
          ? event.newValue
          : 'pending'
      );
    };

    window.addEventListener(CONSENT_EVENT, handleConsentChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(CONSENT_EVENT, handleConsentChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const accept = () => {
    setConsent('accepted');
    publishConsent('accepted');
  };

  const decline = () => {
    setConsent('declined');
    publishConsent('declined');
  };

  return { consent, accept, decline };
}
