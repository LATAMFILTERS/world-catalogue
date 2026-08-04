BEGIN;

-- Bot orchestrator's own durable ledger of detected knowledge gaps
-- (Bloque 2, spec section 3). This is deliberately NOT a duplicate of
-- knowledge_center.candidate_cases (services/knowledge-center-api): that
-- table is the real HERMES research/review workflow, owned by a separate
-- deployed service with its own auth and review roles. This table only
-- tracks, from the bot orchestrator's point of view, "have we already
-- flagged this exact gap, how many times, and what real HERMES research
-- case (hermes_research_id, a knowledge_center.candidate_cases.id) is it
-- linked to" — pure dedup/occurrence bookkeeping, isolated in its own
-- schema so it never collides with elimfilters_catalog or knowledge_center.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS bot_governance;

CREATE TABLE IF NOT EXISTS bot_governance.schema_migrations (
  version text PRIMARY KEY,
  description text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bot_governance.knowledge_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL UNIQUE,
  request_type text NOT NULL,
  origin text NOT NULL,
  status text NOT NULL DEFAULT 'detected',
  priority text NOT NULL DEFAULT 'medium',
  equipment jsonb NOT NULL DEFAULT '{}'::jsonb,
  system text,
  component text,
  question text NOT NULL,
  reason text NOT NULL,
  source_required boolean NOT NULL DEFAULT true,
  requested_by text NOT NULL,
  conversation_id text,
  channel text,
  deduplication_key text NOT NULL UNIQUE,
  occurrences integer NOT NULL DEFAULT 1,
  first_detected_at timestamptz NOT NULL DEFAULT now(),
  last_detected_at timestamptz NOT NULL DEFAULT now(),
  assigned_to text,
  hermes_research_id text,
  obsidian_document_id text,
  resolution_summary text,
  audit_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_knowledge_gaps_status ON bot_governance.knowledge_gaps(status);
CREATE INDEX IF NOT EXISTS idx_bot_knowledge_gaps_conversation ON bot_governance.knowledge_gaps(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_knowledge_gaps_last_detected ON bot_governance.knowledge_gaps(last_detected_at DESC);

INSERT INTO bot_governance.schema_migrations(version, description)
VALUES ('1.0.0', 'knowledge_gaps table for bot orchestrator gap dedup/occurrence tracking')
ON CONFLICT (version) DO NOTHING;

COMMIT;
