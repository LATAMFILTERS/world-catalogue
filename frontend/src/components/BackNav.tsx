'use client';

import Link from 'next/link';

interface BackNavProps {
  href: string;
  label: string;
}

export default function BackNav({ href, label }: BackNavProps) {
  return (
    <Link
      href={href}
      className="back-nav-btn"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,241,45,0.35)',
        borderRadius: '4px',
        padding: '0.45rem 1rem',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 700,
        fontSize: '0.72rem',
        letterSpacing: '0.12em',
        color: '#FFF12D',
        textDecoration: 'none',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      ← {label}
    </Link>
  );
}
