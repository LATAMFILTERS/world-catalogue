'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { trackRetrievalBlock } from '@/lib/analytics';

interface RetrievalBlockProps {
  children: React.ReactNode;
}

export default function RetrievalBlock({ children }: RetrievalBlockProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleToggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    trackRetrievalBlock(next ? 'expand' : 'collapse', pathname);
  }, [open, pathname]);

  return (
    <section
      style={{
        background: 'rgba(255,241,45,0.02)',
        border: '1px solid rgba(255,241,45,0.12)',
        borderRadius: '4px',
        margin: '2rem auto',
        maxWidth: '860px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={handleToggle}
        aria-expanded={open}
        aria-label="Toggle retrieval summary block"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1rem 1.5rem',
          gap: '0.75rem',
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: 'rgba(255,241,45,0.6)',
          }}
        >
          // RETRIEVAL SUMMARY BLOCK
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            color: 'rgba(255,255,255,0.25)',
            flexShrink: 0,
          }}
        >
          {open ? '▲ COLLAPSE' : '▼ EXPAND'}
        </span>
      </button>

      {/* Always in DOM for AI crawlers — maxHeight controls visual display */}
      <div
        style={{
          maxHeight: open ? '4000px' : '0',
          overflow: 'hidden',
          padding: open ? '0 1.5rem 1.5rem' : '0 1.5rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.35)',
          wordBreak: 'break-word',
          transition: 'max-height 0.3s ease',
        }}
      >
        {children}
      </div>
    </section>
  );
}
