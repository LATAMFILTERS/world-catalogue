import type { CSSProperties } from 'react';

interface Props {
  paragraphStyle: CSSProperties;
}

const paragraphs = [
  'ELIMFILTERS® mining asset protection systems are engineered for hydraulic excavators, ultra class haul trucks, wheel loaders, rotary drill rigs, dozers, and mineral processing equipment working in open pit and underground mining environments. Mining operations place every filtration system under pressure. Dust is constant, hydraulic loads are severe, fuel quality can vary from site to site, and lubrication systems must protect critical components through long service intervals.',
  'Mine sites can generate ambient dust concentrations of 5,000 to 15,000 mg/m³, which is 17 to 50 times higher than the ISO 5011 air filter test limit of 300 mg/m³. In high tonnage operations, unplanned equipment downtime can cost $100,000 to $180,000 per hour per machine. ELIMFILTERS® proprietary protection media is designed to control contamination across air intake, hydraulic, fuel, and lubrication systems so mining fleets can protect equipment value, maintain service discipline, and reduce downtime risk across demanding duty cycles.',
];

export function MiningDirectAnswer({ paragraphStyle }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 'clamp(2rem, 4vw, 4rem)',
        width: 'min(1240px, calc(100vw - 4rem))',
        maxWidth: '1240px',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
        alignItems: 'start',
      }}
    >
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          style={{
            ...paragraphStyle,
            margin: 0,
            fontSize: 'clamp(1rem, 1.38vw, 1.16rem)',
            lineHeight: 1.82,
            textAlign: 'left',
          }}
        >
          {paragraph}
        </p>
      ))}
      <style>{`
        @media (max-width: 860px) {
          div:has(> p:first-child:last-child) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
