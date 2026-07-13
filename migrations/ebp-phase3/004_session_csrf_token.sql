-- =============================================================================
-- EBP PHASE 3 — FACTORY SESSION CSRF TOKEN (correction round, 2026-07-13)
-- File: 004_session_csrf_token.sql
-- Purpose: Add a per-session, cryptographically random CSRF token so the
--   Factory Portal (cookie-based auth) can implement the synchronizer-
--   token pattern for every state-changing action (ADR-0033). The token
--   is generated in application code (crypto.randomBytes(32).toString
--   ('hex')) at login, stored alongside the session, embedded as a
--   hidden form field on every server-rendered page, and compared with a
--   timing-safe equality check on every POST. SameSite=Strict alone is
--   not treated as sufficient (older browsers, some cross-scheme/legacy
--   navigations, and any future relaxation of the cookie policy).
-- Safe to run: YES — additive column, backfilled for any existing rows,
--   then made NOT NULL.
-- Affects Phase 1/Phase 2/prior Phase 3 tables: NO.
-- See: docs/ebp/DECISIONS.md ADR-0033
-- =============================================================================

ALTER TABLE ebp_factory_sessions ADD COLUMN IF NOT EXISTS csrf_token CHAR(64);

-- Backfill any pre-existing session rows (from before this column existed)
-- with a random token so the NOT NULL constraint below can be applied
-- safely; a session created before this migration simply gets a token
-- assigned now rather than failing to satisfy the new constraint. Uses
-- two concatenated md5() digests (core Postgres, no pgcrypto dependency)
-- rather than gen_random_bytes() purely for this one-time backfill —
-- every token generated going forward by the application is
-- crypto.randomBytes(32) (ADR-0033), this is only for rows that predate
-- the column.
UPDATE ebp_factory_sessions
  SET csrf_token = md5(random()::text || clock_timestamp()::text || id::text) || md5(random()::text || id::text)
  WHERE csrf_token IS NULL;

ALTER TABLE ebp_factory_sessions ALTER COLUMN csrf_token SET NOT NULL;

COMMENT ON COLUMN ebp_factory_sessions.csrf_token IS 'EBP Phase 3 — cryptographically random (32 bytes, hex-encoded) CSRF synchronizer token bound to this session, generated at login (ADR-0033). Compared with a timing-safe equality check against the _csrf form field on every state-changing Factory Portal request. Never returned to any surface other than the Portal HTML it is embedded in; never logged.';
