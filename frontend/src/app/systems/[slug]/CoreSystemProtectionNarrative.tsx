import type { CSSProperties } from 'react';

type SystemSlug = 'air-intake' | 'fuel-cleanliness' | 'lubrication' | 'hydraulic' | 'cooling-system';

interface Props {
  slug: string;
}

const displayFont = 'Chakra Petch, Arial Narrow, monospace';
const bodyFont = 'Barlow, Arial, sans-serif';

const sectionStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'clamp(2.8rem, 5vw, 4.4rem) clamp(1.5rem, 5vw, 4rem)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const shellStyle: CSSProperties = {
  border: '1px solid rgba(255,241,45,0.18)',
  background: 'linear-gradient(135deg, rgba(255,241,45,0.045), rgba(255,255,255,0.018) 42%, rgba(0,0,0,0.92))',
  padding: 'clamp(1.6rem, 3vw, 2.4rem)',
};

const eyebrowStyle: CSSProperties = {
  fontFamily: displayFont,
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: '#FFF12D',
  marginBottom: '0.85rem',
};

const titleStyle: CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  fontSize: 'clamp(1.65rem, 3vw, 2.55rem)',
  lineHeight: 1,
  letterSpacing: '-0.04em',
  textTransform: 'uppercase',
  marginBottom: '1.15rem',
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1px',
  background: 'rgba(255,255,255,0.07)',
  marginTop: '1.55rem',
};

const cardStyle: CSSProperties = {
  background: '#000',
  padding: '1.25rem 1.35rem',
};

const cardTitleStyle: CSSProperties = {
  fontFamily: displayFont,
  fontWeight: 700,
  fontSize: '0.82rem',
  letterSpacing: '0.09em',
  textTransform: 'uppercase',
  color: '#FFF12D',
  marginBottom: '0.65rem',
};

const paragraphStyle: CSSProperties = {
  fontFamily: bodyFont,
  fontSize: 'clamp(0.98rem, 1.35vw, 1.08rem)',
  lineHeight: 1.78,
  color: 'rgba(255,255,255,0.72)',
  fontWeight: 500,
  textAlign: 'justify',
};

const cardParagraphStyle: CSSProperties = {
  ...paragraphStyle,
  fontSize: '0.94rem',
  lineHeight: 1.68,
  color: 'rgba(255,255,255,0.62)',
};

const copy: Record<SystemSlug, {
  title: string;
  lead: string;
  cards: Array<{ title: string; body: string }>;
}> = {
  'air-intake': {
    title: 'Airflow risk controlled before it reaches the asset',
    lead: 'Air protection is not limited to stopping dust at a single filter face. In real service, contamination moves through intake openings, housing seals, safety elements, cabin air paths, and compressed-air circuits. A complete air-intake strategy controls those entry points as one protection architecture, reducing the chance that abrasive particles, moisture, or operator-air contaminants cross into areas where they can damage combustion efficiency, component life, or working conditions.',
    cards: [
      { title: 'Contamination boundary', body: 'The first risk is exposure: mineral dust, soot, fibers, humidity, salt mist, and airborne debris entering through engine intake, housing interfaces, cabin ventilation, or pneumatic air treatment paths.' },
      { title: 'Protection mechanism', body: 'Progressive media density, seal control, safety-stage protection, adsorption layers, and desiccant drying are matched to the airflow path so each family protects a different boundary without working in isolation.' },
      { title: 'Operational value', body: 'Keeping the airflow path stable helps protect combustion quality, reduce abrasive wear, support operator comfort, and preserve downstream components across the service interval.' },
    ],
  },
  'fuel-cleanliness': {
    title: 'Fuel quality protected before pressure turns contamination into damage',
    lead: 'Modern diesel systems operate with tight clearances and high injection pressures, where small particles and free water can become expensive failures. Fuel Cleanliness Protection is designed around the point where contamination becomes critical: before fuel reaches pumps, injectors, separation stages, and high-pressure circuits. The objective is not only filtration efficiency, but stable fuel delivery, water control, and protection of precision components under changing duty cycles and fuel quality conditions.',
    cards: [
      { title: 'Contamination boundary', body: 'The system addresses hard particles, emulsified water, free water, degraded fuel residues, and storage-related contamination before they reach the high-pressure injection circuit.' },
      { title: 'Protection mechanism', body: 'Fine media, water-separation stages, drain control, and fuel-conditioning families work together to reduce particle load and separate water without restricting flow beyond the service requirement.' },
      { title: 'Operational value', body: 'Cleaner fuel supports injector life, pump reliability, stable combustion, and lower risk of unplanned downtime caused by water, plugging, or abrasive contamination.' },
    ],
  },
  lubrication: {
    title: 'Oil cleanliness maintained while the engine is producing wear',
    lead: 'Lubrication protection has to work inside a fluid that is constantly changing. Soot, oxidation byproducts, metal debris, viscosity shifts, and thermal stress all affect how oil carries load and protects moving surfaces. The lubrication system must preserve cleanliness without compromising flow, bypass behavior, or pressure stability. ELIMFILTERS treats the oil filter as part of a protection system for bearings, journals, turbochargers, valve trains, and other lubricated interfaces that depend on clean oil across the full service interval.',
    cards: [
      { title: 'Contamination boundary', body: 'The risk develops inside the engine: combustion soot, wear metals, degraded additives, oxidation products, and external debris circulating through oil galleries and lubricated contact surfaces.' },
      { title: 'Protection mechanism', body: 'Full-flow media, controlled restriction, contaminant-holding capacity, bypass discipline, and structural integrity are balanced so the element captures debris while preserving oil delivery.' },
      { title: 'Operational value', body: 'Stable oil cleanliness helps reduce bearing wear, protect turbocharger lubrication, maintain pressure behavior, and extend the useful life of critical engine surfaces.' },
    ],
  },
  hydraulic: {
    title: 'Fluid cleanliness controlled around precision hydraulic tolerances',
    lead: 'Hydraulic systems fail when contamination reaches the clearances that control pressure, movement, and response. Pumps, valves, actuators, servo components, and manifolds depend on fluid that stays within acceptable cleanliness levels under load, heat, pressure spikes, and duty-cycle changes. Hydraulic Protection is built around controlling particle size, collapse resistance, flow stability, and media performance so the system can protect precision components instead of simply filtering oil in a generic way.',
    cards: [
      { title: 'Contamination boundary', body: 'The system targets particles generated by wear, ingressed through seals or service practices, and circulated through pumps, valves, actuators, reservoirs, and return lines.' },
      { title: 'Protection mechanism', body: 'Beta-rated media, reinforced construction, pressure-stable elements, and application-specific placement help remove critical particle sizes while maintaining flow and structural safety.' },
      { title: 'Operational value', body: 'Controlled hydraulic cleanliness helps protect valve response, pump life, actuator precision, and system availability in equipment where contamination quickly becomes downtime.' },
    ],
  },
  'cooling-system': {
    title: 'Cooling circuits protected as heat-transfer systems, not just coolant loops',
    lead: 'A cooling system does more than move coolant through an engine. It protects heat-transfer surfaces, wet liners, seals, pumps, passages, and additive balance. Corrosion products, scale, depleted additives, and suspended debris can reduce heat exchange and create localized damage long before a visible failure appears. Cooling System Protection is designed to maintain coolant condition and particulate control so the thermal circuit can keep operating within the temperature range the asset was built to survive.',
    cards: [
      { title: 'Contamination boundary', body: 'The risk comes from corrosion debris, mineral scale, degraded coolant, additive depletion, liner cavitation byproducts, and particulate accumulation inside the cooling circuit.' },
      { title: 'Protection mechanism', body: 'Coolant filtration, controlled additive support, and debris removal help stabilize the fluid condition while protecting passages, seals, liners, and heat-transfer surfaces.' },
      { title: 'Operational value', body: 'A cleaner cooling circuit supports thermal stability, reduces corrosion risk, protects engine life, and helps prevent overheating-related downtime in heavy-duty operation.' },
    ],
  },
};

export function CoreSystemProtectionNarrative({ slug }: Props) {
  const narrative = copy[slug as SystemSlug];
  if (!narrative) return null;

  return (
    <section style={sectionStyle}>
      <div style={shellStyle}>
        <p style={eyebrowStyle}>Protection Architecture</p>
        <h2 style={titleStyle}>{narrative.title}</h2>
        <p style={paragraphStyle}>{narrative.lead}</p>
        <div style={gridStyle}>
          {narrative.cards.map((card) => (
            <article key={card.title} style={cardStyle}>
              <h3 style={cardTitleStyle}>{card.title}</h3>
              <p style={cardParagraphStyle}>{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
