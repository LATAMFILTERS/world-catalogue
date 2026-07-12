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
        gap: '1.15rem',
        width: 'min(1180px, calc(100vw - 4rem))',
        maxWidth: '1180px',
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {paragraphs.map((paragraph) => (
        <p key={paragraph} style={{ ...paragraphStyle, margin: 0, textAlign: 'justify', textAlignLast: 'left' }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
