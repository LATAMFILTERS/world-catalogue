/**
 * InferenceAudit — Step 4 of the Engineering Decision Engine
 *
 * Classifies each draft claim as DIRECT, SUPPORTED, EXTENDED, or SPECULATIVE.
 * EXTENDED claims require disclosure. SPECULATIVE claims are excluded.
 *
 * Inference adjustment table (applied in ConfidenceCalculator):
 *   All DIRECT                         → +5
 *   All DIRECT + SUPPORTED             → 0
 *   Any EXTENDED (with disclosure)     → −10
 *   Multiple EXTENDED (all disclosed)  → −15
 *   Any EXTENDED without disclosure    → −25
 *   Any SPECULATIVE                    → −30 per instance
 */

import type {
  EvidenceInventoryResult,
  InferenceAuditResult,
  ClaimAudit,
  InferenceType,
  EvidenceAvailability,
} from './decision-engine-types';

// ─── Availability quality ─────────────────────────────────────────────────────

function isHighQuality(av: EvidenceAvailability): boolean {
  return av === 'PRESENT' || av === 'KNOWN' || av === 'MAPPED' || av === 'CORRELATED';
}

function isPartial(av: EvidenceAvailability): boolean {
  return av === 'PARTIAL' || av === 'INFERABLE';
}

// ─── Claim classification ─────────────────────────────────────────────────────

/**
 * Classifies a single claim against available evidence.
 *
 * Classification rules:
 *   DIRECT:      Claim directly states what evidence categories 1, 2, 4, 5, or 6 document.
 *                All evidence sources used are PRESENT/KNOWN/MAPPED/CORRELATED.
 *   SUPPORTED:   Claim is supported by analogy or correlated evidence.
 *                At least one source is PARTIAL/INFERABLE; no ABSENT sources relied on.
 *   EXTENDED:    Claim extrapolates beyond available evidence.
 *                Requires explicit disclosure.
 *   SPECULATIVE: Claim has no grounding in available evidence.
 *                Must be excluded before recommendation.
 */
function classifyClaim(
  claimText: string,
  evidenceSources: readonly string[],
  inventory: EvidenceInventoryResult,
): { inferenceType: InferenceType; disclosureRequired: boolean; disclosureText?: string } {
  if (evidenceSources.length === 0) {
    return { inferenceType: 'SPECULATIVE', disclosureRequired: false };
  }

  const categoryMap = new Map(inventory.categories.map(c => [c.categoryId, c]));

  // Check quality of each referenced evidence source
  let allHighQuality = true;
  let anyPartial = false;
  let anyAbsent = false;

  for (const source of evidenceSources) {
    // Sources can be category references ('cat:1') or entity IDs ('CONT-001')
    if (source.startsWith('cat:')) {
      const catId = parseInt(source.slice(4), 10);
      const cat = categoryMap.get(catId as EvidenceCategory['categoryId']);
      if (!cat) { anyAbsent = true; continue; }
      if (isHighQuality(cat.availability)) continue;
      if (isPartial(cat.availability)) { anyPartial = true; allHighQuality = false; continue; }
      anyAbsent = true;
      allHighQuality = false;
    } else {
      // Entity ID — check if it appears in any category's sources
      const found = inventory.categories.some(c => c.sources.includes(source));
      if (!found) {
        anyAbsent = true;
        allHighQuality = false;
      }
    }
  }

  if (anyAbsent) {
    // Relies on evidence not present — EXTENDED or SPECULATIVE
    const partialAvailable = inventory.categories.some(c =>
      isPartial(c.availability) && evidenceSources.some(s => c.sources.includes(s) || s.startsWith('cat:')),
    );
    if (partialAvailable || anyPartial) {
      return {
        inferenceType: 'EXTENDED',
        disclosureRequired: true,
        disclosureText: `ENGINEERING HYPOTHESIS — ${claimText}\n\nBasis: Partial evidence available; conclusion extrapolated beyond directly verified data.\nAssumption: Evidence categories not fully confirmed are consistent with the pattern.\nWould be confirmed by: Complete evidence inventory across all primary categories.\nWould be refuted by: Evidence contradicting the stated contamination pattern.`,
      };
    }
    return { inferenceType: 'SPECULATIVE', disclosureRequired: false };
  }

  if (allHighQuality) {
    return { inferenceType: 'DIRECT', disclosureRequired: false };
  }

  if (anyPartial) {
    return { inferenceType: 'SUPPORTED', disclosureRequired: false };
  }

  return { inferenceType: 'EXTENDED', disclosureRequired: true,
    disclosureText: `ENGINEERING HYPOTHESIS — ${claimText}\n\nBasis: Available evidence supports but does not fully confirm this conclusion.\nWould be confirmed by: Additional operating condition data and equipment specification confirmation.`,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Audits all draft claims against the evidence inventory.
 *
 * If draftClaims is empty (no pre-formed claims), synthesizes audit from
 * the evidence inventory itself — this is the common case for step-7 integration
 * where claims are formed after authorization, not before.
 */
export function auditClaims(
  draftClaims: readonly string[],
  evidenceInventory: EvidenceInventoryResult,
): InferenceAuditResult {
  let claims: ClaimAudit[];

  if (draftClaims.length === 0) {
    // No pre-formed claims — derive synthetic audit from evidence quality
    claims = synthesizeAuditFromInventory(evidenceInventory);
  } else {
    claims = draftClaims.map(text => {
      // Without explicit source mapping, classify based on inventory overall quality
      const sources = evidenceInventory.categories
        .filter(c => isHighQuality(c.availability) || isPartial(c.availability))
        .map(c => `cat:${c.categoryId}`);
      const { inferenceType, disclosureRequired, disclosureText } = classifyClaim(text, sources, evidenceInventory);
      return { claimText: text, inferenceType, evidenceSources: sources, disclosureRequired, disclosureText };
    });
  }

  const hasExtended = claims.some(c => c.inferenceType === 'EXTENDED');
  const extendedCount = claims.filter(c => c.inferenceType === 'EXTENDED').length;
  const hasSpeculative = claims.some(c => c.inferenceType === 'SPECULATIVE');
  const speculativeCount = claims.filter(c => c.inferenceType === 'SPECULATIVE').length;
  const allDirect = claims.every(c => c.inferenceType === 'DIRECT');

  let inferenceAdjustment = 0;
  if (allDirect) {
    inferenceAdjustment = +5;
  } else if (!hasExtended && !hasSpeculative) {
    inferenceAdjustment = 0;
  } else if (hasExtended) {
    const undisclosed = claims.filter(c => c.inferenceType === 'EXTENDED' && !c.disclosureRequired).length;
    if (undisclosed > 0) {
      inferenceAdjustment = -25;
    } else if (extendedCount > 1) {
      inferenceAdjustment = -15;
    } else {
      inferenceAdjustment = -10;
    }
  }
  if (hasSpeculative) {
    inferenceAdjustment += -30 * speculativeCount;
  }

  return {
    claims,
    hasExtended,
    extendedCount,
    hasSpeculative,
    speculativeCount,
    allDirect,
    inferenceAdjustment,
  };
}

// ─── Synthetic audit from inventory ──────────────────────────────────────────

function synthesizeAuditFromInventory(inventory: EvidenceInventoryResult): ClaimAudit[] {
  // Produce one synthetic claim per evidence quality tier present
  const highQuality = inventory.categories.filter(c => isHighQuality(c.availability));
  const partial = inventory.categories.filter(c => isPartial(c.availability));

  const claims: ClaimAudit[] = [];

  if (highQuality.length > 0) {
    claims.push({
      claimText: `Engineering conclusions based on: ${highQuality.map(c => c.name).join(', ')}`,
      inferenceType: 'DIRECT',
      evidenceSources: highQuality.flatMap(c => c.sources),
      disclosureRequired: false,
    });
  }

  if (partial.length > 0) {
    const inferenceType: InferenceType = highQuality.length >= 3 ? 'SUPPORTED' : 'EXTENDED';
    const disclosureRequired = inferenceType === 'EXTENDED';
    claims.push({
      claimText: `Conclusions extrapolated from partial evidence: ${partial.map(c => c.name).join(', ')}`,
      inferenceType,
      evidenceSources: partial.flatMap(c => c.sources),
      disclosureRequired,
      disclosureText: disclosureRequired
        ? `ENGINEERING HYPOTHESIS — Conclusions based on partial evidence\n\nBasis: ${partial.map(c => c.name).join(', ')} not fully confirmed.\nAssumption: Partial indicators are consistent with the contamination pattern identified.\nWould be confirmed by: Complete operating condition data and equipment specification.\nWould be refuted by: Evidence contradicting the identified contamination source.`
        : undefined,
    });
  }

  if (claims.length === 0) {
    claims.push({
      claimText: 'Insufficient evidence for any engineering conclusion',
      inferenceType: 'SPECULATIVE',
      evidenceSources: [],
      disclosureRequired: false,
    });
  }

  return claims;
}

// Type import for internal use
import type { EvidenceCategory } from './decision-engine-types';
