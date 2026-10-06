'use strict';

const RACOR_TURBINE_COMPATIBILITY = Object.freeze({
  '500FG': '2010',
  '500FH': '2010',
  '900FG': '2040',
  '900FH': '2040',
  '1000FG': '2020',
  '1000FH': '2020',
});

function governanceFrom(row = {}) {
  const data = row && row.enrichment_data && typeof row.enrichment_data === 'object'
    ? row.enrichment_data
    : {};
  const gov = data.codigo_base_governance;
  return gov && typeof gov === 'object' && !Array.isArray(gov) ? gov : {};
}

function relationAuthorityFor(row = {}) {
  const sku = String(row.sku || '').trim().toUpperCase();
  const duty = String(row.duty || '').trim().toUpperCase();
  const gov = governanceFrom(row);
  const approvedManufacturer = String(gov.approved_manufacturer || '').trim().toUpperCase();

  if (sku.startsWith('ET9')) {
    const fleetguardFallback = gov.donaldson_absence_verified === true && approvedManufacturer === 'FLEETGUARD';
    return {
      authority: 'PARKER_RACOR',
      fallback_authority: fleetguardFallback ? 'FLEETGUARD' : null,
      fallback_allowed: fleetguardFallback,
      mode: fleetguardFallback ? 'ET9_PRIMARY_WITH_FLEETGUARD_FALLBACK' : 'ET9_PRIMARY',
      rule: fleetguardFallback
        ? 'ET9_PARKER_RACOR_PRIMARY__FLEETGUARD_ONLY_AFTER_VERIFIED_DONALDSON_NON_MANUFACTURE'
        : 'ET9_PARKER_RACOR_PRIMARY',
    };
  }

  if (duty === 'HEAVY_DUTY') {
    if (gov.donaldson_absence_verified === true) {
      return {
        authority: 'FLEETGUARD',
        mode: 'FALLBACK_VERIFIED_DONALDSON_ABSENCE',
        rule: 'HD_FLEETGUARD_ONLY_AFTER_VERIFIED_DONALDSON_NON_MANUFACTURE',
      };
    }
    return {
      authority: 'DONALDSON',
      mode: 'HD_PRIMARY',
      rule: 'HD_DONALDSON_PRIMARY',
    };
  }

  if (duty === 'LIGHT_DUTY') {
    return {
      authority: 'HERMES_LD_AUTHORITY_ROUTER',
      mode: 'LD_MANN_FRAM_OEM',
      rule: 'LD_MANN_FRAM_OEM_BY_GOVERNANCE',
    };
  }

  return {
    authority: 'HERMES_PRIMARY_SOURCE',
    mode: 'GENERAL_PRIMARY',
    rule: 'PRIMARY_SOURCE_REQUIRED',
  };
}

function fleetguardFallbackAllowed(row = {}) {
  const route = relationAuthorityFor(row);
  return route.authority === 'FLEETGUARD' ||
    (route.authority === 'PARKER_RACOR' && route.fallback_authority === 'FLEETGUARD' && route.fallback_allowed === true);
}

module.exports = {
  RACOR_TURBINE_COMPATIBILITY,
  governanceFrom,
  relationAuthorityFor,
  fleetguardFallbackAllowed,
};
