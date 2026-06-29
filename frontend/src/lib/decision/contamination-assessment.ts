/**
 * contamination-assessment.ts
 * ELIMFILTERS — Engineering Decision Engine v1.0
 *
 * Deterministically calculates contamination risks based on operating environments.
 */

import type { OperatingEnvironment, ContaminationProfile, RiskLevel } from './decision-types';

export function assessContaminationRisk(env: OperatingEnvironment): ContaminationProfile {
  const profile: ContaminationProfile = {
    dustExposure: env.dustLevel || 'LOW',
    waterRisk: env.waterLevel || 'LOW',
    fuelQualityRisk: env.fuelQuality || 'LOW',
    hydraulicContaminationRisk: env.hydraulicContamination || 'LOW',
    coolingSystemRisk: 'LOW',
    cabinAirRisk: 'LOW',
    compressedAirRisk: 'LOW',
  };

  const ind = env.industry.toUpperCase();
  const app = env.application.toUpperCase();
  const duty = env.dutyClass.toUpperCase();

  // 1. Dust Exposure
  if (ind === 'MINING' || ind === 'AGRICULTURE' || ind === 'CONSTRUCTION') {
    profile.dustExposure = 'EXTREME';
  } else if (duty === 'HEAVY' || duty === 'SEVERE') {
    profile.dustExposure = profile.dustExposure === 'LOW' ? 'HIGH' : profile.dustExposure;
  }

  // 2. Water Risk
  if (ind === 'MARINE' || ind === 'OIL_GAS') {
    profile.waterRisk = 'EXTREME';
  } else if (app.includes('GENERATOR') || duty === 'SEVERE') {
    profile.waterRisk = profile.waterRisk === 'LOW' ? 'HIGH' : profile.waterRisk;
  }

  // 3. Fuel Quality Risk
  if (ind === 'MINING' || ind === 'AGRICULTURE' || ind === 'MARINE') {
    profile.fuelQualityRisk = 'HIGH'; // Remote storage tanks often have condensation and microbial growth
  }

  // 4. Hydraulic Contamination Risk
  if (ind === 'CONSTRUCTION' || ind === 'MINING' || app.includes('EXCAVATOR')) {
    profile.hydraulicContaminationRisk = 'EXTREME'; // High pressure, high dirt ingress environments
  }

  // 5. Cabin Air Risk
  if (ind === 'MINING' || ind === 'AGRICULTURE' || ind === 'CONSTRUCTION') {
    profile.cabinAirRisk = 'HIGH'; // Operator protection mandated
  }

  // 6. Compressed Air Risk
  if (ind === 'INDUSTRIAL' || ind === 'MANUFACTURING') {
    profile.compressedAirRisk = 'HIGH';
  }

  // 7. Cooling System Risk
  if (duty === 'SEVERE' || ind === 'MARINE') {
    profile.coolingSystemRisk = 'HIGH'; // Cavitation and scale risk in severe duty engines
  }

  return profile;
}
