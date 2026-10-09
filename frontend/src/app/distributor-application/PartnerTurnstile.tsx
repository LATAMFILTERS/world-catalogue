'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = { onVerify: (token: string) => void };

const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function PartnerTurnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { callbackRef.current = onVerify; }, [onVerify]);

  useEffect(() => {
    let active = true;
    const started = Date.now();
    if (!sitekey) {
      setError('La verificación de seguridad no está configurada. Código: SITEKEY_MISSING');
      return;
    }

    const interval = window.setInterval(() => {
      if (!active || widgetRef.current !== null) return;
      if (!containerRef.current || !window.turnstile) {
        if (Date.now() - started > 12000) {
          window.clearInterval(interval);
          setError('No se pudo cargar Cloudflare Turnstile. Código: SCRIPT_UNAVAILABLE');
        }
        return;
      }

      window.clearInterval(interval);
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey,
          theme: 'dark',
          callback: (token: string) => {
            setError('');
            callbackRef.current(token);
          },
          'expired-callback': () => {
            callbackRef.current('');
            setError('La verificación expiró. Actualiza la página para intentarlo de nuevo.');
          },
          'error-callback': (code: string) => {
            callbackRef.current('');
            setError('Cloudflare no pudo verificar el formulario. Código: ' + String(code || 'UNKNOWN'));
            return true;
          }
        });
        if (id === undefined || id === null) {
          setError('Cloudflare no inició la verificación. Código: RENDER_EMPTY');
        } else {
          widgetRef.current = id;
        }
      } catch {
        setError('Cloudflare rechazó la inicialización del formulario. Código: RENDER_ERROR');
      }
    }, 250);

    return () => {
      active = false;
      window.clearInterval(interval);
      if (widgetRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetRef.current); } catch { /* disposed */ }
        widgetRef.current = null;
      }
      callbackRef.current('');
    };
  }, [attempt]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onError={() => setError('No se cargó el servicio Cloudflare. Código: SCRIPT_BLOCKED')}
      />
      <div ref={containerRef} style={{ margin: '1rem 0', minHeight: 65 }} />
      {error && (
        <div role="alert" style={{ color: '#ffcc55', fontSize: 14, lineHeight: 1.5, paddingBottom: 16 }}>
          {error}
          <button type="button" onClick={() => { callbackRef.current(''); setError(''); setAttempt(n => n + 1); }}
            style={{ display: 'block', marginTop: 8, padding: '8px 12px', background: '#ffda59', color: '#111', border: 0, cursor: 'pointer' }}>
            Reintentar verificación
          </button>
        </div>
      )}
    </>
  );
}
