ALTER TABLE hermes_catalogue_backlog
  ADD COLUMN IF NOT EXISTS research_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_research_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_research_error text,
  ADD COLUMN IF NOT EXISTS last_evidence_id text;

CREATE INDEX IF NOT EXISTS hermes_catalogue_backlog_retry_idx
  ON hermes_catalogue_backlog(status, priority, next_attempt_at);

COMMENT ON COLUMN hermes_catalogue_backlog.next_attempt_at IS
  'Earliest time HERMES may retry an unresolved evidence task.';

COMMENT ON COLUMN hermes_catalogue_backlog.last_evidence_id IS
  'Latest HERMES catalogue evidence id produced for this backlog item.';
