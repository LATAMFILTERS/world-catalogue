'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  onVerify: (token: string) => void;
};

export default function PartnerTurnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);

  useEffect(() => {
    callbackRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let active = true;

    const interval = window.setInterval(() => {
      if (
        !active ||
        !containerRef.current ||
        !window.turnstile ||
        widgetRef.current !== null
      ) {
        return;
      }

      window.clearInterval(interval);

      widgetRef.current = window.turnstile.render(
        containerRef.current,
        {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
          theme: 'dark',
          callback: (token: string) => callbackRef.current(token),
          'expired-callback': () => callbackRef.current(''),
          'error-callback': () => callbackRef.current(''),
        }
      );
    }, 250);

    return () => {
      active = false;
      window.clearInterval(interval);

      if (widgetRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} style={{ margin: '1rem 0' }} />
    </>
  );
}