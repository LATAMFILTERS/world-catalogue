# Global SKU Certification v1

Migration `093_GLOBAL_SKU_CERTIFICATION_AUDIT` creates a deterministic certification ledger for every row in `public.elimfilters_catalog`.

The migration is audit-only. It does not mutate catalog SKU, `codigo_base`, applications, resolver data, or canonical identities.

A SKU is `CERTIFIED` only when all applicable checks pass:

- canonical governance is verified;
- Light Duty regional policy is aligned;
- Light Duty has exactly one active canonical identity whose brand and part number match the regional policy and current `codigo_base`;
- `codigo_base` belongs to one catalog SKU;
- the normalized base code resolves to exactly that SKU in `v_api_resolver_v6`;
- the SKU is absent from `exact_part_conflicts`;
- the SKU has no unresolved reference-classification conflicts;
- the SKU has no quarantined source reference;
- application domain is consistent with duty;
- duty and filter type are present and valid.

Every failed check is persisted in `public.catalog_sku_certification.blockers`. The certification row also stores evidence counts and the policy version used for the decision.

The catalog is globally certified only when `CERTIFIED == total catalog rows` and `BLOCKED == 0`. No partial percentage is allowed to be presented as full certification.
