## PR Type

Check exactly one:

- [ ] **Type A — Source** · `frontend/src/**` · `scripts/**` · `elimfilters-vault/**` · config files
- [ ] **Type B — Generated** · `frontend/out/**` · `frontend/public/api/citation/**` · `*.generated.ts` · `sitemap.xml`

> A PR may not contain both source and generated files. Split if needed.

---

## Impact

| Area | Changed |
|------|---------|
| Source files | <!-- count --> |
| Generated files | <!-- count or N/A --> |
| Articles | <!-- count or N/A --> |
| Glossary terms | <!-- count or N/A --> |
| Standards | <!-- count or N/A --> |
| Systems | <!-- count or N/A --> |
| Technologies | <!-- count or N/A --> |

---

## Architecture

**Dependency graph changed?**

- [ ] YES — describe below
- [ ] NO

<!-- If YES: which layers, which edges, what direction? -->

**Phase 5A/5B guarantees preserved?**

- [ ] Acyclic dependencies (Registry → Index → Components → Pages)
- [ ] O(1) lookup — no runtime graph rebuild
- [ ] Static generation — no client-side data fetching
- [ ] All entities in exactly one registry
- [ ] All IDs permanent and immutable

---

## Build

**Build successful?**

- [ ] YES — `npm run build` passes locally
- [ ] N/A — Type B PR (no source changes)

**`npm run verify` output:**

```
<!-- paste last line: e.g. "Build completed in 42s" -->
```

---

## Generated Artifacts

**`frontend/out` changed?**

- [ ] YES
- [ ] NO

**Reason** *(required if YES)*:

<!-- Explain WHY the build output changed. If only chunk hashes changed with no functional
     change, do NOT commit frontend/out — it adds noise with zero value. -->

---

## Guardian

All validation gates run via `bash scripts/guardian.sh --skip-build` before this PR?

- [ ] YES — all checks pass
- [ ] Skipped — reason: <!-- explain -->
