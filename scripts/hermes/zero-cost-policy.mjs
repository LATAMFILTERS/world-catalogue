import process from 'node:process';

export const HERMES_ZERO_COST_REQUIRED = String(process.env.HERMES_ZERO_COST_REQUIRED || 'true').toLowerCase() !== 'false';

function truthy(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

export function externalGroqAllowedAtZeroCost() {
  if (!HERMES_ZERO_COST_REQUIRED) return true;
  return truthy('HERMES_GROQ_FREE_TIER_CONFIRMED');
}

export function assertZeroCostGroqAllowed() {
  if (externalGroqAllowedAtZeroCost()) return;
  const error = new Error(
    'HERMES_ZERO_COST_BLOCK: external Groq call blocked because zero-cost mode is required and HERMES_GROQ_FREE_TIER_CONFIRMED is not true'
  );
  error.code = 'HERMES_ZERO_COST_BLOCK';
  throw error;
}

export function zeroCostPolicySummary() {
  return {
    zero_cost_required: HERMES_ZERO_COST_REQUIRED,
    external_groq_allowed: externalGroqAllowedAtZeroCost(),
    paid_fallback_allowed: false,
    free_tier_confirmation_required: HERMES_ZERO_COST_REQUIRED
  };
}
