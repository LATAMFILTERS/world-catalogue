'use client';

import { useEffect, useRef, useState } from 'react';

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
const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export default function PartnerTurnstile({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const callbackRef = useRef(onVerify);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { callbackRef.current = onVerify; }, [onVerify]);

  useEffect(() => {
    let active = true;
    let loadFailed = false;
    const started = Date.now();
    callbackRef.current('');

    if (!sitekey) {
      setError('Turnstile no está configurado. Código: SITEKEY_MISSING');
      return;
    }

    // Load explicitly: Next Script may not be injected on the static export after hydration.
    let script: HTMLScriptElement | null = null;
    if (!window.turnstile) {
      script = document.querySelector<HTMLScriptElement>('script[data-partner-turnstile]');
      if (!script) {
        script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.dataset.partnerTurnstile = 'true';
        document.head.appendChild(script);
      }
    }

    const onScriptError = () => {
      if (!active) return;
      loadFailed = true;
      setError('No se pudo descargar Cloudflare Turnstile. Código: SCRIPT_BLOCKED');
    };
    script?.addEventListener('error', onScriptError);

    const interval = window.setInterval(() => {
      if (!active || widgetRef.current !== null || loadFailed) return;
      if (!containerRef.current || !window.turnstile) {
        if (Date.now() - started > 20000) {
          window.clearInterval(interval);
          setError('Cloudflare no respondió. Código: SCRIPT_UNAVAILABLE');
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
            setError('La verificación expiró. Vuelve a verificar.');
          },
          'error-callback': (code: string) => {
            callbackRef.current('');
            setError('Cloudflare rechazó la verificación. Código: ' + String(code || 'UNKNOWN'));
            return true;
          }
        });
        if (id === undefined || id === null) {
          setError('Turnstile no inició. Código: RENDER_EMPTY');
        } else {
          widgetRef.current = id;
          setError('');
        }
      } catch {
        setError('Error al iniciar Turnstile. Código: RENDER_ERROR');
      }
    }, 250);

    return () => {
      active = false;
      window.clearInterval(interval);
      script?.removeEventListener('error', onScriptError);
      if (widgetRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetRef.current); } catch { /* already removed */ }
        widgetRef.current = null;
      }
    };
  }, [attempt]);

  return (
    <>
      <div ref={containerRef} style={{ margin: '1rem 0', minHeight: 65 }} />
      {error && (
        <div role="alert" style={{ color: '#ffcc55', fontSize: 14, lineHeight: 1.5, paddingBottom: 16 }}>
          {error}
          <button type="button"
            onClick={() => {
              callbackRef.current('');
              const old = document.querySelector('script[data-partner-turnstile]');
              if (!window.turnstile && old) old.remove();
              setError('');
              setAttempt(n => n + 1);
            }}
            style={{ display: 'block', marginTop: 8, padding: '8px 12px', background: '#ffda59', color: '#111', border: 0, cursor: 'pointer' }}>
            Reintentar verificación
          </button>
        </div>
      )}
    </>
  );
}
