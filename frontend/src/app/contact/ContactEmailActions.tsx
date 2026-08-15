'use client';

import { useState } from 'react';

type ContactEmailActionsProps = {
  email: string;
  subject: string;
  emailLabel: string;
  copyLabel: string;
  copiedLabel: string;
};

export default function ContactEmailActions({
  email,
  subject,
  emailLabel,
  copyLabel,
  copiedLabel,
}: ContactEmailActionsProps) {
  const [copied, setCopied] = useState(false);
  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(`${copyLabel}:`, email);
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
          {emailLabel}
        </a>
        <button type="button" onClick={copyEmail} style={actionStyle} aria-live="polite">
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
    </div>
  );
}
