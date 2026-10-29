'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useConsent } from '@/lib/useConsent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export default function Analytics() {
  const { consent } = useConsent();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag) return;

    if (consent === 'accepted' && GA_ID) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' });
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, {
        send_page_view: true,
        anonymize_ip: true,
      });
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
  }, [consent]);

  if (consent !== 'accepted' || !GA_ID) return null;

  return (
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
    />
  );
}
