# Isuzu USA — Master Closure Matrix v160

Canonical pending population: **260 exact positions / 19 source SKUs**.

| SKU | Pending | State | Base | Lane | Write now |
|---|---:|---|---|---|---|
| EL88076 | 36 | HD_EXISTING | P848076 | EVIDENCE_REQUIRED | NO |
| EA13614 | 35 | HD_EXISTING | P543614 | EVIDENCE_REQUIRED | NO |
| EF90390 | 35 | HD_EXISTING | P550390 | EVIDENCE_REQUIRED | NO |
| EA33655 | 15 | MISSING | — | REMAP_REQUIRED | NO |
| EF91840 | 15 | HD_EXISTING | P551840 | EVIDENCE_REQUIRED | NO |
| EF92427 | 15 | HD_EXISTING | P502427 | PARTIAL_REVALIDATION | NO |
| EL80606 | 15 | HD_EXISTING | LF606 | EVIDENCE_REQUIRED | NO |
| ES91098 | 15 | MISSING | — | REMAP_REQUIRED | NO |
| EA33930 | 14 | NON_HD | CA3930 | ALIAS_REMAP_REVIEW | NO |
| EF98204 | 12 | MISSING | — | RETIRE_REMAP | NO |
| EF92599 | 10 | HD_EXISTING | P502599 | PARTIAL_REVALIDATION | NO |
| EF93410 | 10 | MISSING | — | REMAP_REQUIRED | NO |
| EF92564 | 7 | HD_EXISTING | P552564 | PARTIAL_REVALIDATION | NO |
| EA14353 | 5 | HD_EXISTING | AF4353 | PARTIAL_REVALIDATION | NO |
| EF93009 | 5 | HD_EXISTING | P553009 | PARTIAL_REVALIDATION | NO |
| EL80428 | 5 | HD_EXISTING | P550428 | PARTIAL_REVALIDATION | NO |
| EA21938 | 4 | MISSING | — | REMAP_REQUIRED | NO |
| ES90128 | 4 | HD_EXISTING | FS20128 | PARTIAL_REVALIDATION | NO |
| EL80420 | 3 | HD_EXISTING | P550420 | PARTIAL_REVALIDATION | NO |

## Execution policy
1. Never write a row while its lane is EVIDENCE_REQUIRED, REMAP_REQUIRED, ALIAS_REMAP_REVIEW or RETIRE_REMAP.
2. Promote exact tuples to READY_TO_IMPLEMENT only after official manufacturer/OEM application evidence matches model + engine + year.
3. Materialize a missing SKU only after canonical owner/base governance passes.
4. EA33930 cannot receive HD applications; resolve against EA13930 or another verified HD owner.
5. EF98204 remains retired from the Isuzu chain; remap its source tuples instead of recreating the product.
6. Every release must use catalog-application-write-service, transaction backup, dry-run, apply, and post-write hash/evidence audit.
