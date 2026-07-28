BEGIN;

CREATE TABLE IF NOT EXISTS knowledge_center.channel_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('WHATSAPP','INSTAGRAM','WEB_CHAT','EMAIL','IMPORT')),
  external_conversation_id text NOT NULL,
  external_contact_id text,
  contact_display_name text,
  contact_address text,
  locale text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(channel, external_conversation_id)
);

CREATE TABLE IF NOT EXISTS knowledge_center.channel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('WHATSAPP','INSTAGRAM','WEB_CHAT','EMAIL','IMPORT')),
  provider text NOT NULL,
  external_event_id text NOT NULL,
  conversation_id uuid REFERENCES knowledge_center.channel_conversations(id),
  direction text NOT NULL CHECK (direction IN ('INBOUND','OUTBOUND','SYSTEM')),
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  sender_address text,
  recipient_address text,
  text_content text,
  normalized_payload jsonb NOT NULL,
  raw_payload jsonb NOT NULL,
  signature_verified boolean NOT NULL DEFAULT false,
  processing_status text NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED','NORMALIZED','IGNORED','CASE_CREATED','CASE_LINKED','FAILED','QUARANTINED')),
  candidate_case_id uuid REFERENCES knowledge_center.candidate_cases(id),
  failure_reason text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  UNIQUE(channel, provider, external_event_id)
);

CREATE TABLE IF NOT EXISTS knowledge_center.channel_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_event_id uuid NOT NULL REFERENCES knowledge_center.channel_events(id) ON DELETE CASCADE,
  external_attachment_id text,
  media_type text NOT NULL,
  file_name text,
  storage_uri text,
  checksum text,
  size_bytes bigint CHECK (size_bytes IS NULL OR size_bytes >= 0),
  malware_scan_status text NOT NULL DEFAULT 'PENDING' CHECK (malware_scan_status IN ('PENDING','CLEAN','REJECTED','FAILED')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.channel_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_event_id uuid REFERENCES knowledge_center.channel_events(id),
  channel text NOT NULL,
  provider text NOT NULL,
  error_code text NOT NULL,
  error_message text NOT NULL,
  retry_count integer NOT NULL DEFAULT 0,
  next_retry_at timestamptz,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_channel_events_status_received ON knowledge_center.channel_events(processing_status, received_at);
CREATE INDEX IF NOT EXISTS idx_channel_events_conversation ON knowledge_center.channel_events(conversation_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_channel_events_case ON knowledge_center.channel_events(candidate_case_id);
CREATE INDEX IF NOT EXISTS idx_dead_letters_retry ON knowledge_center.channel_dead_letters(next_retry_at) WHERE resolved_at IS NULL;

INSERT INTO knowledge_center.schema_migrations(version, description)
VALUES ('5.0.0', 'Knowledge Center Phase 5 channel ingestion')
ON CONFLICT (version) DO NOTHING;

COMMIT;
