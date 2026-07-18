'use strict';

// EBP Phase 1 — declared-actor resolution.
//
// While EBP auth is a single shared ADMIN_KEY (no per-user identity —
// ADR-0002 is still unresolved), any string a caller sends in the
// `x-ebp-actor` header is a self-reported label, not a verified identity.
// It must never be treated or named as an "authenticated actor." Every
// audit record pairs this declared label with `identity_mechanism` so a
// reader always knows the strength of the identity claim behind it.

const IDENTITY_MECHANISM = 'ADMIN_KEY_SHARED';
const DEFAULT_DECLARED_ACTOR = 'admin-key-session';

// headerValue: the raw x-ebp-actor header (string) or undefined/null.
// Returns { declared_actor, identity_mechanism } — never throws, never
// returns an empty declared_actor.
function resolveDeclaredActor(headerValue) {
  const trimmed = typeof headerValue === 'string' ? headerValue.trim() : '';
  return {
    declared_actor: trimmed || DEFAULT_DECLARED_ACTOR,
    identity_mechanism: IDENTITY_MECHANISM,
  };
}

module.exports = { resolveDeclaredActor, IDENTITY_MECHANISM, DEFAULT_DECLARED_ACTOR };
