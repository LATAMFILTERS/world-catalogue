# Kubota USA — RTV Batch 003: OEM → Donaldson → Fleetguard cross-reference candidates
Date: 2026-10-17
Status: RESEARCH_CANDIDATES_ONLY / NOT CERTIFIED / NOT SKU-ELIGIBLE
Previous batches: KUBOTA_US_RTV_BATCH_001.md, KUBOTA_US_RTV_BATCH_002.md
Precedence: Kubota genuine OEM/OEN -> Donaldson (if manufactured and directly verified) -> Fleetguard (if Donaldson unavailable) -> Kubota OEN (when both truly unavailable). No inferred absence from search silence.

| Kubota OEN candidate | Position candidate | Donaldson candidate | Fleetguard candidate | Current disposition | Source |
|---|---|---|---|---|---|
| HH150-32430 | Engine oil | P502067 | LF3925 | RESEARCH_CANDIDATE | https://pifparts.com/product/kubota-hh150-32430-oil-filter-spin-on-genuine-oem/ |
| HH150-32094 | Engine oil | P550162 **CONFLICT** P502067 | LF3462 **CONFLICT** LF3692 | BLOCKED_CONFLICT; different physical sizes reported | https://www.filterfinder.at/products/hh150-32094 ; https://motormaq.cl/producto/filtro-aceite-kubota-original-hh150-32094-p550162-6644678/ |
| 6A320-59930 | Fuel cartridge | NONE VERIFIED | FF42106 | FLEETGUARD_CANDIDATE; Donaldson non-manufacture NOT established | https://tpi-mexico.com/wp-content/uploads/2025/08/CAT-APLICACIONES-AGRICOLA.pdf ; https://www.fuerdunfiltration.com/6a320-59930-p05728p1.html |
| 1G319-11210 | Air outer | P903837 | NONE VERIFIED | DONALDSON_CANDIDATE via aftermarket references, manufacturer direct confirmation pending | https://www.rdmparts.com/en/p-845-sa-18185--air-filter-passend-voor-kubota-1g319-11210-original-from-hifi-845-sa-18185 |
| HHK72-14080 | Hydraulic/HST? (verify position) | P550227 | HF35308 | DONALDSON_CANDIDATE, position/specification gate pending | https://www.filterfinderonline.com/products/hhk72-14080 |
| HHK70-14073 | HST (RTV-X1100C kit dealer) | NOT VERIFIED | NOT VERIFIED | BLOCKED_FOR_RESEARCH | dealer kit 77700-05389 |
| HHK70-14070 | HST? / candidate RTV-X900 | NOT VERIFIED | NOT VERIFIED | BLOCKED_FOR_RESEARCH | aftermarket RTV-X900 kits; verify IPL |
| HHK32-16770 | Hydraulic vs suction conflicting | NOT VERIFIED | NOT VERIFIED | BLOCKED_POSITION | dealer kit 77700-05389 |
| K7591-82360 | Inner air | NOT VERIFIED | NOT VERIFIED | BLOCKED_FOR_RESEARCH | RTV-X900W dealer IPL |

Additional Kubota OEM 1G319-11212 as reported supersession from dealer; do not assign inherited P903837 cross until Kubota verifies supersession exact scope.

## Critical technical discrepancy
HH150-32094 has contradictory reported Donaldson cross P502067 vs P550162, and dimensions among sellers vary significantly (~65mm vs ~86mm long). Hold both. Specific Donaldson catalog manufacturer evidence and Kubota original mechanical drawing/part spec needed. Do not collapse these oil filter identities or share SKU.

## Evidence limitations
Current cross candidates predominantly originate from third-party reseller/catalogue listings; NOT confirmed directly in Donaldson or Fleetguard official tool in this investigation. Even a published cross does not prove exact RTV-X variant/engine/serial fit. No claim of Donaldson nonmanufacture is currently supported for any candidate. Do not promote any candidate to canonical base or publish.

## Next steps
1. Validate Kubota OEN/serial via official illustrated parts catalog for RTV-X900 and RTV-X1100C/X1120D/X1140.
2. Check official Donaldson cross/product technical sheets for each exact OEN and filter position; where manufacturer has no matching product, document evidence, then check official Fleetguard.
3. Read-only reconcile against catalogue and SKU identities on ELIMSERVER.
4. Produce gated recommendation, not products, until certified.

## Ponytail
Existing catalogue governance and NPR/Isuzu 3-stage process reused. Research-only Markdown evidence, no new runtime, job, SKU, or database write.
