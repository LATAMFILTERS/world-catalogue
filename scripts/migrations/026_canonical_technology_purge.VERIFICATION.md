# Migration 026 — Canonical Technology Purge — Verification Evidence

No credentials, connection strings, or row-level data are recorded in this
file, ever. Only relation counts and pass/fail outcomes.

## 2026-08-14 — Production, read-only verification

- **Method:** external read-only optimized check (not this repo's runner
  script; run separately against production by a human with production
  access).
- **Relations reviewed:** 88
- **Violations:** 0 (`[]`)
- **Inconclusive:** 0 (`[]`)
- **Result:** PASS. None of the 10 retired technology identifiers
  documented in `FORBIDDEN_HEX` (`run_026_canonical_technology_purge.js`)
  and the `forbidden` array (`026_canonical_technology_purge.sql`'s
  verification block) remain in any of the 88 reviewed relations. Not
  re-listed here in plain text -- see those two source-of-truth arrays;
  this repo's `scripts/validate-canonical-taxonomy.mjs` guard fails the
  build on any retired identifier appearing as a literal string anywhere
  in the repository, including in documentation.
- **Migration re-run:** none. This entry records the result of the
  existing production state; migration 026 was not executed as part of
  producing this record.
- **SQL file SHA256, current (post pre-push review, 2026-08-14):**
  `c6ddc37b086e78fb09e427fd273ec6054c6fe799b372f83049644b03ffd3562d`
  (LF-normalized content, matching how git stores the blob) for
  `scripts/migrations/026_canonical_technology_purge.sql` as it will be
  committed on branch `fix/purge-retired-technology-names` for PR #326.
  **Superseded value:** an earlier entry in this same authorship session
  recorded `dfec77c1a377de4b542018236e1771ec545cb0b176119e6054a4c3042b473ddc`
  for commit `3eb7b03d44` -- that hash is now stale. The difference between
  the two is **comment-text only**: during this pre-push review, several
  SQL comments were reworded to remove literal retired-technology-name
  strings so the file passes this repo's `scripts/validate-canonical-taxonomy.mjs`
  guard (which fails the build on any retired identifier appearing as
  literal text anywhere in the repository, comments included). No
  functional statement, UPDATE/DELETE, pattern/replacement hex value, or
  control-flow logic changed between the two hashes -- only prose inside
  `--` comments.
  **Caveat, stated plainly:** this hash identifies file content as tracked
  by git at authorship time. There is no execution-time artifact from the
  2026-08-14 production run (e.g. a hash logged by the run itself) to
  cryptographically prove a specific byte sequence is what was present in
  production at the moment the 88-relation check ran -- that check was
  performed externally, not by this repo's tooling. This entry records
  what the repository's history shows as of authorship time, not an
  independently-attested production-side proof.
  **Local checkout note:** the working-tree file on this Windows checkout
  has CRLF line endings (git's `core.autocrlf` behavior) and hashes
  differently if hashed naively without LF normalization. Reproduce the
  hash above from the git blob (`git show <commit>:scripts/migrations/026_canonical_technology_purge.sql`),
  not directly from the checked-out file.

## Notes for future entries

- `run_026_canonical_technology_purge.js`'s own verification query filters
  to `BASE TABLE` relations only (matching the migration's own BASE
  TABLE-only write scope, added earlier in this purge). If a future run of
  that script reports a relation count other than 88, confirm first
  whether the difference is relations added/dropped since this entry, or a
  scope difference between that script's BASE TABLE filter and whatever
  method produced the 88 above -- do not assume a mismatch means a real
  regression without checking which relations differ.
- Append new entries below this line; do not overwrite prior entries.
