-- 004_seed_technology_sources.sql
--
-- 003_seed_technology_knowledge.sql inserted knowledge_records/versions for
-- all 10 technologies but no knowledge_center.sources / record_sources rows.
-- The reasoning runtime's citation builder drops any citation without a
-- sourceId (services/knowledge-engine-runtime + lib/knowledge-governance/
-- obsidian-knowledge-client.js's citationToEvidence: "A citation with no
-- sourceId lacks the traceability ... it is simply dropped, never coerced
-- into looking approved") -- confirmed live: after fixing the request-
-- validation and confidence-dilution bugs, a query matched a seeded record
-- at a clean confidence 1.0 (action=ANSWER), but the citation for a record
-- with zero linked sources carries no sourceId, so evidence.length stayed
-- 0 and the result still normalized to status 'not_found'.
--
-- Adds one AUTHORITATIVE source per technology (its own reviewed
-- /technologies/<slug>/ page, matching the sourceUrl already stored in
-- each version's content) and links it via record_sources so citations
-- carry real provenance.

INSERT INTO knowledge_center.sources (id, external_id, source_type, title, publisher, locator, authority_level, accessed_at)
VALUES
  ('00000000-0000-0000-0000-000000002301', 'KC-SOURCE-DRYCORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: DRYCORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/drycore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002302', 'KC-SOURCE-HYDROCORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: HYDROCORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/hydrocore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002303', 'KC-SOURCE-INTEKCORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: INTEKCORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/intekcore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002304', 'KC-SOURCE-MACROCORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: MACROCORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/macrocore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002305', 'KC-SOURCE-MICROKAPPA-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: MICROKAPPA', 'ELIMFILTERS', 'https://elimfilters.com/technologies/microkappa/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002306', 'KC-SOURCE-NANOFORCE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: NANOFORCE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/nanoforce/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002307', 'KC-SOURCE-SYNTAPORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: SYNTAPORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/syntapore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002308', 'KC-SOURCE-SYNTRAX-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: SYNTRAX', 'ELIMFILTERS', 'https://elimfilters.com/technologies/syntrax/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002309', 'KC-SOURCE-THERMACORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: THERMACORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/thermacore/', 'AUTHORITATIVE', now()),
  ('00000000-0000-0000-0000-000000002310', 'KC-SOURCE-TURBOCORE-v1', 'WEBPAGE', 'ELIMFILTERS Technology Reference: TURBOCORE', 'ELIMFILTERS', 'https://elimfilters.com/technologies/turbocore/', 'AUTHORITATIVE', now());

INSERT INTO knowledge_center.record_sources (record_version_id, source_id, support_type)
VALUES
  ('00000000-0000-0000-0000-000000002201', '00000000-0000-0000-0000-000000002301', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002202', '00000000-0000-0000-0000-000000002302', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002203', '00000000-0000-0000-0000-000000002303', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002204', '00000000-0000-0000-0000-000000002304', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002205', '00000000-0000-0000-0000-000000002305', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002206', '00000000-0000-0000-0000-000000002306', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002207', '00000000-0000-0000-0000-000000002307', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002208', '00000000-0000-0000-0000-000000002308', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002209', '00000000-0000-0000-0000-000000002309', 'SUPPORTS'),
  ('00000000-0000-0000-0000-000000002210', '00000000-0000-0000-0000-000000002310', 'SUPPORTS');
