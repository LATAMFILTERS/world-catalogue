/**
 * entity-extractor.ts
 * ELIMFILTERS — Knowledge Acquisition Engine v1.0
 *
 * Deterministically detects predefined engineering entities in text.
 */

import type { ExtractedEntity, EntityType } from './knowledge-types';

// Hardcoded dictionary for deterministic extraction (v1.0)
const ENTITY_DICTIONARY: Record<string, { type: EntityType, value: string }> = {
  'ISO-4406': { type: 'STANDARD', value: 'ISO-4406' },
  'ISO-5011': { type: 'STANDARD', value: 'ISO-5011' },
  'MACROCORE': { type: 'TECHNOLOGY', value: 'MACROCORE™' },
  'HYDROCORE': { type: 'TECHNOLOGY', value: 'HYDROCORE™' },
  'NANOFORCE': { type: 'TECHNOLOGY', value: 'NANOFORCE™' },
  'MICROKAPPA': { type: 'TECHNOLOGY', value: 'MICROKAPPA™' },
  'SYNTEPORE': { type: 'TECHNOLOGY', value: 'SYNTEPORE™' },
  'SYNTRAX': { type: 'TECHNOLOGY', value: 'SYNTRAX™' },
  'INTEKCORE': { type: 'TECHNOLOGY', value: 'INTEKCORE™' },
  'WATER': { type: 'CONTAMINATION_MODE', value: 'Water Contamination' },
  'DUST': { type: 'CONTAMINATION_MODE', value: 'Dust Ingestion' },
  'CAVITATION': { type: 'FAILURE_MODE', value: 'Pump Cavitation' },
  'WEAR': { type: 'FAILURE_MODE', value: 'Abrasive Wear' },
  'SCORING': { type: 'FAILURE_MODE', value: 'Cylinder Scoring' },
  'MINING': { type: 'INDUSTRY', value: 'Mining' },
  'MARINE': { type: 'INDUSTRY', value: 'Marine' },
};

export function extractEntities(text: string): ExtractedEntity[] {
  const entities = new Map<string, ExtractedEntity>();
  const upperText = text.toUpperCase();

  for (const [key, mapping] of Object.entries(ENTITY_DICTIONARY)) {
    if (upperText.includes(key)) {
      const id = `ent-${mapping.type.toLowerCase()}-${mapping.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      if (!entities.has(id)) {
        entities.set(id, {
          id,
          type: mapping.type,
          value: mapping.value,
          confidence: 100, // Exact dictionary match
        });
      }
    }
  }

  return Array.from(entities.values());
}
