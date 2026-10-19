# Atomic application domain transitions

A documented LIGHT_DUTY/HEAVY_DUTY repair cannot update duty before its application payload: the database rejects the intermediate domain mismatch. `applyVerifiedApplications` now accepts an explicit `application_domain_transition` with the expected current duty, destination duty and reason. Both application arrays must be supplied, the source domain must be empty, and the destination must be nonempty. HTTPS source and SHA256 are required.

The existing evidence inserts precede one catalogue UPDATE that carries duty, arrays and application governance together. Existing calls retain their duty. Canonical identity, numbering, certification and database triggers are unchanged. The caller must use its existing transaction and independently satisfy canonical authority; this API does not approve a domain repair.

Validation: 22 focused tests pass. An isolated restored database on5497 accepted application sequencing as far as the canonical policy trigger, which rejected the unapproved MANN-to-HD identity. The transaction rolled back and the server stopped. This is a preserved protection, not a successful complete product repair. No production execution. No ledger changes or approved manufacturer absence flags.
