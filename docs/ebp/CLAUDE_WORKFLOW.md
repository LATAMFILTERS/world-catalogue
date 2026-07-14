# Claude Code Workflow — ELIMFILTERS Business Platform

## Session startup

Before changing any file, Claude Code must read, in order:

1. `docs/ebp/PROJECT_MANIFESTO.md`
2. `docs/ebp/IMPLEMENTATION_MASTER_INDEX.md`
3. `docs/ebp/BUSINESS_RULES.md`
4. `docs/ebp/PLATFORM_ARCHITECTURE.md`
5. `docs/ebp/ROADMAP.md`
6. The complete documentation folder for the active phase

Claude must inspect the repository before proposing architecture and must preserve the existing canonical product source of truth.

## Mandatory execution cycle

1. Confirm the active phase and scope.
2. Audit existing code, database usage, routes, authentication, and documentation affected by that phase.
3. List contradictions, risks, and missing decisions.
4. Complete or correct the phase documentation before implementation.
5. Define acceptance criteria and tests.
6. Implement only the active phase on the current feature branch.
7. Run relevant type checks, linting, tests, build, migration checks, and security validations.
8. Audit the implementation against the approved documentation.
9. Update `implementation-status.md`, `audit.md`, `decisions.md`, and `changelog.md`.
10. Stop and report results. Do not begin the next phase automatically.

## Prohibitions

- Do not modify `main` directly.
- Do not expose portal data through public routes, sitemap, navigation, or anonymous APIs.
- Do not duplicate canonical product records.
- Do not combine ELIMFILTERS required values and manufacturer-offered values in the same database fields.
- Do not reveal manufacturer identity or FOB costs to distributor roles.
- Do not introduce undocumented tables, endpoints, permissions, or business rules.
- Do not mark work complete when tests or documentation are incomplete.

## Required final report for every phase

- Files created and modified
- Database migrations
- APIs and UI routes
- Tests executed and results
- Security controls verified
- Documentation updated
- Known limitations
- Audit findings and score
- Recommendation: approve, correct, or block
