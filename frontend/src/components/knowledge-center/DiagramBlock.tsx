'use client';

import {
  MultipassTestCircuit,
  BetaRatioMeasurement,
  Iso4406CleanlinessScale,
  HydraulicContaminationPaths,
  AirIntakeFlow,
  LubeOilCircuit,
  FuelFiltration3Stage,
  DifferentialPressureCurve,
  CompressedAirTreatment,
  ParticleWearMechanism,
  FilterMediaCrossSection,
  Iso8573PurityClasses,
  ServiceIntervalFlow,
  CabinAirSystem,
  WaterContaminationPathways,
} from './diagrams';

const SVG_COMPONENTS: Record<string, React.ComponentType> = {
  MultipassTestCircuit,
  BetaRatioMeasurement,
  Iso4406CleanlinessScale,
  HydraulicContaminationPaths,
  AirIntakeFlow,
  LubeOilCircuit,
  FuelFiltration3Stage,
  DifferentialPressureCurve,
  CompressedAirTreatment,
  ParticleWearMechanism,
  FilterMediaCrossSection,
  Iso8573PurityClasses,
  ServiceIntervalFlow,
  CabinAirSystem,
  WaterContaminationPathways,
};

export interface DiagramBlockProps {
  id: string;
  caption?: string;
  aspectRatio?: string;
}

export default function DiagramBlock({
  id,
  caption,
  aspectRatio = '16 / 9',
}: DiagramBlockProps) {
  const SVGComponent = SVG_COMPONENTS[id];

  return (
    <figure style={{ margin: '0 0 2rem 0' }}>
      <div style={{
        aspectRatio,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {SVGComponent ? (
          <SVGComponent />
        ) : (
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'rgba(255,241,45,0.3)',
          }}>
            {id}
          </p>
        )}
      </div>
      {caption && (
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.3)',
          marginTop: '0.5rem',
          textAlign: 'center',
          fontStyle: 'italic',
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
