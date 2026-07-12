import type { CSSProperties } from 'react';

interface Props {
  paragraphStyle: CSSProperties;
}

const paragraphs = [
  'ELIMFILTERS® mining asset protection systems are engineered for hydraulic excavators, ultra class haul trucks, wheel loaders, rotary drill rigs, dozers, and mineral processing equipment working in open pit and underground mining environments.',
  'Mining operations place every filtration system under pressure. Dust is constant, hydraulic loads are severe, fuel quality can vary from site to site, and lubrication systems must protect critical components through long service intervals. In these conditions, a filter is not just a replacement part. It is part of the protection strategy that keeps high value equipment available and productive.',
  'Mine sites can generate ambient dust concentrations of 5,000 to 15,000 mg/m³, which is 17 to 50 times higher than the ISO 5011 air filter test limit of 300 mg/m³. When contamination reaches the intake path, hydraulic circuit, fuel system, or engine oil, the result can be accelerated wear, loss of efficiency, and unscheduled maintenance.',
  'In high tonnage mining operations, unplanned equipment downtime can cost $100,000 to $180,000 per hour per machine. ELIMFILTERS® proprietary protection media is designed to control contamination across air intake, hydraulic, fuel, and lubrication systems so mining fleets can protect equipment value, extend service discipline, and reduce downtime risk across demanding duty cycles.',
];

export function MiningDirectAnswer({ paragraphStyle }: Props) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} style={{ ...paragraphStyle, margin: 0 }}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}
