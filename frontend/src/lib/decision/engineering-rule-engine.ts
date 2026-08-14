/**
 * engineering-rule-engine.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministic engineering rules.
 * Maps operational environments to proven engineering protection requirements.
 */

import type { EngineeringRule, OperatingEnvironment, ContaminationProfile } from './decision-types';

export const ENGINEERING_RULES: EngineeringRule[] = [
  // DUST EXPOSURE RULES
  {
    id: 'ER-DUST-001',
    condition: (env, p) => p.dustExposure === 'EXTREME' || p.dustExposure === 'HIGH',
    reference: 'ISO-5011 Heavy Duty Air Intake Standards',
    justification: 'Extreme dust environments require dual-stage high-efficiency filtration to prevent engine scoring and premature wear.',
    action: { technology: 'MACROCORE™', systemType: 'Engine Air Intake', required: true, priority: 'CRITICAL' }
  },
  
  // WATER CONTAMINATION RULES
  {
    id: 'ER-WATER-001',
    condition: (env, p) => p.waterRisk === 'EXTREME' || p.waterRisk === 'HIGH',
    reference: 'ISO-4406 Fuel Water Separation Standards',
    justification: 'High water risk requires advanced coalescence technology to prevent injector tip failure and pump cavitation.',
    action: { technology: 'TURBOCORE™', systemType: 'Fuel System', required: true, priority: 'CRITICAL' }
  },

  // CABIN AIR RULES
  {
    id: 'ER-CABIN-001',
    condition: (env, p) => ['MINING', 'AGRICULTURE', 'CONSTRUCTION'].includes(env.industry.toUpperCase()),
    reference: 'ISO-16890 Cabin Air Quality Standards',
    justification: 'Operators in heavy dust industries must be protected from airborne particulate matter and hazardous respirable silica.',
    action: { technology: 'MICROKAPPA™', systemType: 'Cabin Air', required: true, priority: 'HIGH' }
  },

  // HYDRAULIC CONTAMINATION RULES
  {
    id: 'ER-HYD-001',
    condition: (env, p) => p.hydraulicContaminationRisk === 'EXTREME' || p.hydraulicContaminationRisk === 'HIGH',
    reference: 'ISO-16889 Hydraulic Fluid Power Multi-pass Method',
    justification: 'High-pressure hydraulics operating in harsh environments require advanced nanofiber capture to prevent valve sticking and pump wear.',
    action: { technology: 'NANOFORCE™', systemType: 'Hydraulic System', required: true, priority: 'CRITICAL' }
  },

  // FUEL QUALITY RULES
  {
    id: 'ER-FUEL-001',
    condition: (env, p) => p.fuelQualityRisk === 'EXTREME' || p.fuelQualityRisk === 'HIGH' || env.industry === 'MINING',
    reference: 'ELIM-ENG-FUEL-012 Fuel Quality Defense Protocol',
    justification: 'Poor fuel quality or remote storage tanks necessitate multi-layer synthetic media to prevent premature plugging and power loss.',
    action: { technology: 'SYNTAPORE™', systemType: 'Fuel System', required: true, priority: 'HIGH' }
  },

  // COMPRESSED AIR RULES
  {
    id: 'ER-COMP-001',
    condition: (env, p) => p.compressedAirRisk === 'EXTREME' || p.compressedAirRisk === 'HIGH',
    reference: 'ISO-8573 Compressed Air Purity',
    justification: 'Industrial compressed air requires precision oil separation and aerosol removal to protect pneumatic tools.',
    action: { technology: 'SYNTRAX™', systemType: 'Compressed Air', required: true, priority: 'MEDIUM' }
  }
];

export function evaluateRules(env: OperatingEnvironment, profile: ContaminationProfile): EngineeringRule[] {
  return ENGINEERING_RULES.filter(rule => rule.condition(env, profile));
}
