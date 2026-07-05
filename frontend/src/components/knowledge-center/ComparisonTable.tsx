'use client';

export interface ComparisonTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
}

export default function ComparisonTable({ title, headers, rows }: ComparisonTableProps) {
  return (
    <div style={{ marginBottom: '2rem', overflowX: 'auto' }}>
      {title && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          {title}
        </p>
      )}
      <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '400px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid rgba(255,241,45,0.15)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: '#FFF12D',
                padding: `0.6rem ${i === 0 ? '1rem 0.6rem 0' : '1rem'}`,
                textAlign: 'left',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  fontFamily: ci === 0 ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
                  fontSize: ci === 0 ? '0.7rem' : '0.83rem',
                  color: ci === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)',
                  padding: `0.7rem ${ci === 0 ? '1rem 0.7rem 0' : '1rem'}`,
                  lineHeight: 1.5,
                  verticalAlign: 'top',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
