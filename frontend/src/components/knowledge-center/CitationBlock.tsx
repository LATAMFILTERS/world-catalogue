'use client';

import { useState } from 'react';

export interface CitationBlockProps {
  title: string;
  url: string;
  year?: string;
  entityType: 'article' | 'standard';
  code?: string;
}

const BASE_URL = 'https://elimfilters.com';
const AUTHOR = 'ELIMFILTERS Engineering Knowledge Platform';

function buildCitations(props: CitationBlockProps) {
  const { title, url, year, entityType, code } = props;
  const fullUrl = `${BASE_URL}${url}`;
  const displayYear = year ? year.slice(0, 4) : new Date().getFullYear().toString();
  const accessDate = 'Accessed 2026';

  const sourceLabel = entityType === 'standard' && code ? code : title;

  const apa = `ELIMFILTERS. (${displayYear}). ${sourceLabel}: ${title}. ELIMFILTERS Engineering Knowledge Platform. ${fullUrl}`;

  const ieee = `ELIMFILTERS, "${sourceLabel}: ${title}," ELIMFILTERS Engineering Knowledge Platform, ${displayYear}. [Online]. Available: ${fullUrl}. [${accessDate}].`;

  const bibtex = `@misc{elimfilters_${(code ?? title).toLowerCase().replace(/[^a-z0-9]/g, '_')}_${displayYear},
  author    = {ELIMFILTERS},
  title     = {{${sourceLabel}: ${title}}},
  year      = {${displayYear}},
  url       = {${fullUrl}},
  note      = {${accessDate}},
}`;

  const chicago = `ELIMFILTERS. "${sourceLabel}: ${title}." ${AUTHOR}, ${displayYear}. ${fullUrl}.`;

  return { apa, ieee, bibtex, chicago };
}

const FORMAT_LABELS = ['APA', 'IEEE', 'BibTeX', 'Chicago'] as const;
type FormatKey = typeof FORMAT_LABELS[number];

export default function CitationBlock(props: CitationBlockProps) {
  const [activeFormat, setActiveFormat] = useState<FormatKey>('APA');
  const [copied, setCopied] = useState(false);

  const citations = buildCitations(props);
  const citationMap: Record<FormatKey, string> = {
    APA: citations.apa,
    IEEE: citations.ieee,
    BibTeX: citations.bibtex,
    Chicago: citations.chicago,
  };

  const currentText = citationMap[activeFormat];

  function handleCopy() {
    navigator.clipboard.writeText(currentText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{
      marginTop: '3rem',
      border: '1px solid rgba(255,241,45,0.1)',
      background: 'rgba(255,241,45,0.02)',
    }}>
      <div style={{
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid rgba(255,241,45,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.6rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,241,45,0.5)',
          margin: 0,
        }}>
          CITE THIS PAGE
        </p>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {FORMAT_LABELS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                padding: '0.25rem 0.6rem',
                background: activeFormat === fmt ? 'rgba(255,241,45,0.12)' : 'transparent',
                border: `1px solid ${activeFormat === fmt ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: activeFormat === fmt ? '#FFF12D' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '1rem 1.25rem', position: 'relative' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.78rem',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {currentText}
        </p>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
            padding: '0.25rem 0.6rem',
            background: copied ? 'rgba(255,241,45,0.12)' : 'transparent',
            border: `1px solid ${copied ? 'rgba(255,241,45,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: copied ? '#FFF12D' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
    </div>
  );
}
