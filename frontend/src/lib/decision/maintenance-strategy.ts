/**
 * maintenance-strategy.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministically generates maintenance priorities based on environmental profiles.
 */

import type { ContaminationProfile, MaintenanceStrategy, TraceLink } from './decision-types';

export function buildMaintenanceStrategy(profile: ContaminationProfile): MaintenanceStrategy {
  const criticalSystems: string[] = [];
  const inspectionPriorities: string[] = [];
  const replacementPriorities: string[] = [];
  const trace: TraceLink[] = [];

  // 1. Dust & Air
  if (profile.dustExposure === 'EXTREME' || profile.dustExposure === 'HIGH') {
    criticalSystems.push('Engine Air Intake');
    inspectionPriorities.push('Pre-cleaners and primary air filters');
    replacementPriorities.push('Primary air filters (monitor restriction gauges)');
    trace.push({
      step: 'Elevate Air Intake Priority',
      reference: 'Dust Exposure Profile',
      justification: 'High dust requires accelerated air filter inspection to prevent restriction.',
    });
  }

  // 2. Water & Fuel
  if (profile.waterRisk === 'EXTREME' || profile.fuelQualityRisk === 'EXTREME' || profile.fuelQualityRisk === 'HIGH') {
    criticalSystems.push('Fuel System');
    inspectionPriorities.push('Water separator bowls and drains');
    replacementPriorities.push('Primary fuel filters / water separators');
    trace.push({
      step: 'Elevate Fuel System Priority',
      reference: 'Water/Fuel Risk Profile',
      justification: 'Poor fuel or water presence requires daily drain checks and accelerated separator replacement.',
    });
  }

  // 3. Hydraulics
  if (profile.hydraulicContaminationRisk === 'EXTREME' || profile.hydraulicContaminationRisk === 'HIGH') {
    criticalSystems.push('Hydraulic System');
    inspectionPriorities.push('Hydraulic breathers and cylinder wipers');
    replacementPriorities.push('Hydraulic return filters');
    trace.push({
      step: 'Elevate Hydraulic Priority',
      reference: 'Hydraulic Contamination Risk',
      justification: 'High dirt ingress necessitates frequent breather replacement to protect hydraulic fluid.',
    });
  }

  // 4. Cabin Air
  if (profile.cabinAirRisk === 'EXTREME' || profile.cabinAirRisk === 'HIGH') {
    criticalSystems.push('Cabin Air');
    inspectionPriorities.push('Cabin fresh air intake');
    replacementPriorities.push('Cabin primary filters (ensure positive pressure)');
    trace.push({
      step: 'Elevate Cabin Air Priority',
      reference: 'Operator Health Standards',
      justification: 'Hazardous environments require strict cabin filter maintenance to ensure operator safety.',
    });
  }

  // Baseline fallbacks if no extreme risks
  if (criticalSystems.length === 0) {
    criticalSystems.push('Engine Lube', 'Fuel System');
    inspectionPriorities.push('Fluid levels and visual leak checks');
    replacementPriorities.push('Standard OEM interval replacement');
    trace.push({
      step: 'Standard Maintenance Baseline',
      reference: 'OEM Standard Operating Procedures',
      justification: 'Normal operating conditions follow standard interval schedules.',
    });
  }

  const recommendedSequence = [
    'Safety & Lockout',
    'Pre-cleaner & Fluid Drains',
    'Primary Filtrations (Air/Fuel/Lube)',
    'Secondary/Safety Filters (Only if restricted/required)',
    'Breathers & Cabin Air',
    'System Priming & Leak Check'
  ];

  return {
    criticalSystems: Array.from(new Set(criticalSystems)),
    inspectionPriorities,
    replacementPriorities,
    recommendedSequence,
    coverageGaps: [], // Set during final recommendation merge
    trace,
  };
}
