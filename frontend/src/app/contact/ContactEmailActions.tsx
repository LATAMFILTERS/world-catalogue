'use client';

import { useState } from 'react';

type ContactEmailActionsProps = {
  email: string;
  subject: string;
};

export default function ContactEmailActions({ email, subject }: ContactEmailActionsProps) {
  const [copied, setCopied] = useState(false);
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copia esta dirección de correo:', email);
    }
  };

  const actionStyle = {
    border: '1px solid rgba(255,241,45,0.5)',
    padding: '0.72rem 0.9rem',
    color: '#FFF12D',
    background: 'rgba(255,241,45,0.06)',
    textDecoration: 'none',
    fontFamily: 'Chakra Petch, Arial Narrow, monospace',
    fontSize: '0.68rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
  };

  return (
    <div style={{ marginTop: 'auto' }}>
      <a
        href={mailtoHref}
        style={{
          color: '#FFF12D',
          fontFamily: 'Chakra Petch, Arial Narrow, monospace',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          overflowWrap: 'anywhere',
        }}
      >
        {email}
      </a>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '1rem' }}>
        <a href={mailtoHref} style={actionStyle}>
          Enviar correo
        </a>
        <a href={gmailHref} target="_blank" rel="noreferrer" style={actionStyle}>
          Abrir en Gmail
        </a>
        <button type="button" onClick={copyEmail} style={actionStyle} aria-live="polite">
          {copied ? 'Correo copiado' : 'Copiar dirección'}
        </button>
      </div>
    </div>
  );
}
