'use client';

import { useEffect, useState } from 'react';

interface SkuCard { sku: string; technology: string; duty: string; oem_count: number; app_count: number; }

interface RelatedProductsProps {
  filterType: string;
  duty: 'HEAVY_DUTY' | 'LIGHT_DUTY';
  searchQuery: string;
  label: string;
}

export function RelatedProducts({ filterType, duty, searchQuery, label }: RelatedProductsProps) {
  const [skus, setSkus] = useState<SkuCard[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3000);
    fetch(`https://part-search.elimfilters.com/api/search?q=${encodeURIComponent(filterType)}&duty=${duty}&limit=6`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => {
        const valid = (d.results || d.filters || []).filter((p: Record<string, unknown>) =>
          p.technology && (p.oem_codes as unknown[])?.length > 0 &&
          ((p.equipment_applications as unknown[])?.length > 0 || (p.vehicle_applications as unknown[])?.length > 0)
        ).slice(0, 6).map((p: Record<string, unknown>) => ({
          sku: p.elimfilters_sku as string,
          technology: p.technology as string,
          duty: p.duty as string,
          oem_count: (p.oem_codes as unknown[]).length,
          app_count: ((p.equipment_applications as unknown[]) || []).length + ((p.vehicle_applications as unknown[]) || []).length,
        }));
        setSkus(valid);
      })
      .catch(() => {})
      .finally(() => { clearTimeout(timer); setDone(true); });
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [filterType, duty]);

  if (!done || skus.length === 0) return null;

  return (
    <section style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255,241,45,0.03)', border: '1px solid rgba(255,241,45,0.12)', borderRadius: '10px' }}>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', color: '#FFF12D', letterSpacing: '0.14em', marginBottom: '0.5rem', opacity: 0.8 }}>ELIMFILTERS PRODUCTS — THIS SYSTEM</p>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem' }}>
        Filtros disponibles para {duty === 'HEAVY_DUTY' ? 'equipos pesados' : 'vehículos ligeros'} — datos en tiempo real
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {skus.map(s => (
          <a key={s.sku} href={`https://part-search.elimfilters.com?q=${s.sku}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', background: '#000', textDecoration: 'none', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,241,45,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', color: '#FFF12D', fontWeight: 700, marginBottom: '0.3rem' }}>{s.sku}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>{s.technology}</p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono, monospace' }}>
              {s.oem_count} OEM · {s.app_count} apps
            </p>
          </a>
        ))}
      </div>
      <a href={`https://part-search.elimfilters.com?q=${encodeURIComponent(searchQuery)}`} target="_blank" rel="noopener noreferrer"
        style={{ display: 'inline-block', padding: '0.6rem 1.2rem', border: '1px solid rgba(255,241,45,0.4)', borderRadius: '5px', color: '#FFF12D', fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', letterSpacing: '0.06em' }}>
        {label} →
      </a>
    </section>
  );
}
