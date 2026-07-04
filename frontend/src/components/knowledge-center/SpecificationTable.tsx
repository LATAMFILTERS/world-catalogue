'use client';

export interface SpecTableRow {
  label: string;
  value: string;
}

export interface SpecificationTableProps {
  title?: string;
  rows: SpecTableRow[];
  labelWidth?: string;
}

export default function SpecificationTable({
  title,
  rows,
  labelWidth = '160px',
}: SpecificationTableProps) {
  return (
    <div style={{ marginBottom: '3rem' }}>
      {title && (
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          {title}
        </p>
      )}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.3)',
                padding: '0.6rem 0',
                width: labelWidth,
                letterSpacing: '0.04em',
                verticalAlign: 'top',
              }}>
                {row.label}
              </td>
              <td style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                padding: '0.6rem 0 0.6rem 1rem',
                lineHeight: 1.5,
              }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
