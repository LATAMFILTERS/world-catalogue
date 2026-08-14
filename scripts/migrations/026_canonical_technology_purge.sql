-- Canonical technology purge
-- Rewrites retired identifiers with deterministic canonical replacements across
-- text and JSON columns in the public schema, then fails if any retired token remains.

BEGIN;

-- ── Pre-pass: resolve product_family collisions before the blind rewrite ──
-- product_family.family_code is UNIQUE (uq_product_family_code). The blind
-- replace below renames retired rows in place, which fails with
-- "duplicate key value violates unique constraint uq_product_family_code"
-- whenever the canonical destination row already exists (e.g. a TURBOCORE
-- row was created separately while a legacy retired-identifier row mapping
-- to it was never migrated), or whenever two different retired codes
-- resolve to the same canonical destination in the same run (see the
-- pattern_hex/replacement_hex arrays below for the exact retired->canonical
-- pairs this covers).
--
-- For every group of product_family rows that would resolve to the same
-- family_code, this keeps exactly one survivor row -- preferring a row
-- that is already exactly the canonical code, otherwise the lowest id
-- deterministically -- re-points product_model/product_element.family_id
-- off every other row in the group onto the survivor, and removes the
-- now-redundant retired duplicate. No canonical data is deleted: only
-- rows that are about to become exact duplicates of a survivor are
-- consolidated, and only after their dependents have been re-pointed.
DO $$
DECLARE
  pattern_hex TEXT[] := ARRAY[
    '485944524f434f52452f534552494553e284a2',
    '485944524f434f52452f534552494553',
    '485944524f434f5245e284a2',
    '485944524f434f5245',
    '53594e5445504f5245e284a2',
    '53594e5445504f5245',
    '53594e5445464f52e284a2',
    '53594e5445464f52',
    '434f4f4c54454348e284a2',
    '434f4f4c54454348',
    '445552414354454348e284a2',
    '445552414354454348',
    '4e414e4f434f5245e284a2',
    '4e414e4f434f5245',
    '454c494d434f5245e284a2',
    '454c494d434f5245',
    '44494553454c434f5245e284a2',
    '44494553454c434f5245'
  ];
  replacement_hex TEXT[] := ARRAY[
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '544845524d41434f5245e284a2',
    '544845524d41434f5245',
    '4455524154454348e284a2',
    '4455524154454348',
    '4e414e4f464f524345e284a2',
    '4e414e4f464f524345',
    '494e54454b434f5245e284a2',
    '494e54454b434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245'
  ];
  patterns TEXT[] := ARRAY[]::TEXT[];
  replacements TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
  r RECORD;
  g RECORD;
  resolved TEXT;
  survivor_id INTEGER;
BEGIN
  FOR i IN 1..array_length(pattern_hex, 1) LOOP
    patterns := patterns || convert_from(decode(pattern_hex[i], 'hex'), 'UTF8');
    replacements := replacements || convert_from(decode(replacement_hex[i], 'hex'), 'UTF8');
  END LOOP;

  CREATE TEMP TABLE _pf_resolution (
    id            INTEGER PRIMARY KEY,
    original_code TEXT NOT NULL,
    resolved_code TEXT NOT NULL
  ) ON COMMIT DROP;

  FOR r IN SELECT id, family_code FROM product_family LOOP
    resolved := r.family_code;
    FOR i IN 1..array_length(patterns, 1) LOOP
      -- Case-insensitive to match the now-case-insensitive generic pass
      -- below: a case-sensitive replace() here would let a non-canonically
      -- cased family_code slip past collision detection undetected, then
      -- get rewritten (and potentially collide) by the generic pass anyway
      -- -- reproducing the exact defect class this migration now closes
      -- everywhere else. Patterns are pre-verified regex-safe (see the
      -- generic pass below).
      resolved := regexp_replace(resolved, patterns[i], replacements[i], 'gi');
    END LOOP;
    INSERT INTO _pf_resolution (id, original_code, resolved_code)
      VALUES (r.id, r.family_code, resolved);
  END LOOP;

  FOR g IN
    SELECT resolved_code, array_agg(id ORDER BY id) AS ids
    FROM _pf_resolution
    GROUP BY resolved_code
    HAVING count(*) > 1
  LOOP
    -- Prefer the row that is already exactly the canonical code as the
    -- survivor (it needs no rename); otherwise the lowest id, deterministically.
    SELECT id INTO survivor_id
    FROM _pf_resolution
    WHERE resolved_code = g.resolved_code
    ORDER BY (original_code = resolved_code) DESC, id ASC
    LIMIT 1;

    FOR i IN 1..array_length(g.ids, 1) LOOP
      IF g.ids[i] <> survivor_id THEN
        UPDATE product_model   SET family_id = survivor_id WHERE family_id = g.ids[i];
        UPDATE product_element SET family_id = survivor_id WHERE family_id = g.ids[i];
        DELETE FROM product_family WHERE id = g.ids[i];
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ── Pre-pass: resolve kg_technologies.slug collisions and case mismatches ──
-- kg_technologies.slug is VARCHAR(50) NOT NULL UNIQUE, documented as a
-- "Lowercase canonical technology identifier" (migrations/kg-phase1/001_schema.sql).
-- The generic blind-replace pass below matches rows with ILIKE (case
-- insensitive) but rewrites them with replace() (case SENSITIVE). A
-- lowercase leftover retired-identifier slug is matched by the WHERE
-- clause but a case-sensitive replace() against its uppercase canonical
-- form is a no-op -- the row is never actually renamed, the retired token
-- survives, and the final verification pass (itself case-insensitive)
-- correctly reports it.
--
-- This block resolves every kg_technologies row's fully-canonicalized slug
-- using case-insensitive matching (regexp_replace ... 'gi' -- safe here
-- with no escaping, since every literal pattern below is plain
-- alphanumerics, '/', and the trademark symbol; none are regex
-- metacharacters). Exactly as for product_family above, rows whose
-- resolved slug collides with another row's (a pre-existing canonical row,
-- or two retired rows independently converging on the same destination)
-- are consolidated onto one deterministic survivor before being renamed:
-- kg_product_technologies.technology_id is ON DELETE CASCADE, so it is
-- re-pointed first (skipping any (product_sku, technology_id) pair the
-- survivor already has, to respect uq_product_technology) or the retired
-- row's product associations would be silently lost when it is deleted.
-- The actual rename is applied here, not deferred to the generic pass
-- below, because that pass's case-sensitive replace() cannot rename a
-- non-uppercase slug in the first place -- deferring would reproduce the
-- exact bug this block exists to fix.
DO $$
DECLARE
  pattern_hex TEXT[] := ARRAY[
    '485944524f434f52452f534552494553e284a2',
    '485944524f434f52452f534552494553',
    '485944524f434f5245e284a2',
    '485944524f434f5245',
    '53594e5445504f5245e284a2',
    '53594e5445504f5245',
    '53594e5445464f52e284a2',
    '53594e5445464f52',
    '434f4f4c54454348e284a2',
    '434f4f4c54454348',
    '445552414354454348e284a2',
    '445552414354454348',
    '4e414e4f434f5245e284a2',
    '4e414e4f434f5245',
    '454c494d434f5245e284a2',
    '454c494d434f5245',
    '44494553454c434f5245e284a2',
    '44494553454c434f5245'
  ];
  replacement_hex TEXT[] := ARRAY[
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '544845524d41434f5245e284a2',
    '544845524d41434f5245',
    '4455524154454348e284a2',
    '4455524154454348',
    '4e414e4f464f524345e284a2',
    '4e414e4f464f524345',
    '494e54454b434f5245e284a2',
    '494e54454b434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245'
  ];
  patterns TEXT[] := ARRAY[]::TEXT[];
  replacements TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
  r RECORD;
  g RECORD;
  resolved TEXT;
  survivor_id INTEGER;
BEGIN
  FOR i IN 1..array_length(pattern_hex, 1) LOOP
    patterns := patterns || convert_from(decode(pattern_hex[i], 'hex'), 'UTF8');
    replacements := replacements || convert_from(decode(replacement_hex[i], 'hex'), 'UTF8');
  END LOOP;

  CREATE TEMP TABLE _kt_resolution (
    id            INTEGER PRIMARY KEY,
    original_slug TEXT NOT NULL,
    resolved_slug TEXT NOT NULL
  ) ON COMMIT DROP;

  FOR r IN SELECT id, slug FROM kg_technologies LOOP
    resolved := r.slug;
    FOR i IN 1..array_length(patterns, 1) LOOP
      resolved := regexp_replace(resolved, patterns[i], replacements[i], 'gi');
    END LOOP;
    INSERT INTO _kt_resolution (id, original_slug, resolved_slug)
      VALUES (r.id, r.slug, resolved);
  END LOOP;

  FOR g IN
    SELECT resolved_slug, array_agg(id ORDER BY id) AS ids
    FROM _kt_resolution
    GROUP BY resolved_slug
    HAVING count(*) > 1
  LOOP
    -- Prefer the row that is already exactly the canonical slug as the
    -- survivor; otherwise the lowest id, deterministically.
    SELECT id INTO survivor_id
    FROM _kt_resolution
    WHERE resolved_slug = g.resolved_slug
    ORDER BY (original_slug = resolved_slug) DESC, id ASC
    LIMIT 1;

    FOR i IN 1..array_length(g.ids, 1) LOOP
      IF g.ids[i] <> survivor_id THEN
        -- Drop join rows that would become an exact duplicate of one the
        -- survivor already has (uq_product_technology).
        DELETE FROM kg_product_technologies old_link
        WHERE old_link.technology_id = g.ids[i]
          AND EXISTS (
            SELECT 1 FROM kg_product_technologies canon_link
            WHERE canon_link.technology_id = survivor_id
              AND canon_link.product_sku = old_link.product_sku
          );
        -- Re-point whatever remains onto the survivor.
        UPDATE kg_product_technologies SET technology_id = survivor_id WHERE technology_id = g.ids[i];
        DELETE FROM kg_technologies WHERE id = g.ids[i];
      END IF;
    END LOOP;
  END LOOP;

  -- Apply the actual rename to every surviving row whose resolved slug
  -- differs from its current value. Cannot violate the slug UNIQUE constraint:
  -- the grouping above already reduced every resolved_slug to at most one
  -- remaining row.
  UPDATE kg_technologies kt
  SET slug = res.resolved_slug
  FROM _kt_resolution res
  WHERE kt.id = res.id
    AND res.resolved_slug <> res.original_slug;
END $$;

-- ── Generic replacement pass: case-insensitive across every BASE TABLE ──
-- text/varchar/character/json/jsonb column in the public schema.
--
-- Previously this used replace() (case SENSITIVE) gated by an ILIKE
-- (case INSENSITIVE) WHERE clause -- a mismatch between the row filter and
-- the rewrite itself. A row could be selected because it contained a
-- retired token in some other casing, then left completely unrewritten
-- because replace() found no exact-case match. That is what happened
-- twice already (kg_technologies.slug, kg_technologies.logo_file) and
-- would keep happening column by column. Fixed once, generically, here:
-- the rewrite now uses regexp_replace(..., 'gi'), so the filter and the
-- rewrite always agree on what counts as a match.
--
-- Safety of using the retired-token literals as regex patterns: each
-- decoded pattern is checked below and the migration RAISES before
-- touching any data if one is ever found to contain a POSIX regex
-- metacharacter ( . ^ $ * + ? ( ) [ ] { } | \ ). Today's 18 patterns are
-- exclusively uppercase letters, '/', and the trademark symbol (™) -- none
-- of those are metacharacters, so every pattern is a safe literal regex
-- as-is; the check exists so a future edit to this list can't silently
-- change that.
DO $$
DECLARE
  r RECORD;
  i INTEGER;
  j INTEGER;
  src TEXT;
  dst TEXT;
  -- Every POSIX/ARE regex metacharacter, checked one at a time as a plain
  -- literal substring below -- deliberately NOT itself a regex, so that
  -- verifying "is this pattern regex-safe" never depends on getting
  -- regex-escaping-of-a-regex-escaping-check right.
  metachars TEXT := '.^$*+?()[]{}|\';
  patterns TEXT[] := ARRAY[
    '485944524f434f52452f534552494553e284a2',
    '485944524f434f52452f534552494553',
    '485944524f434f5245e284a2',
    '485944524f434f5245',
    '53594e5445504f5245e284a2',
    '53594e5445504f5245',
    '53594e5445464f52e284a2',
    '53594e5445464f52',
    '434f4f4c54454348e284a2',
    '434f4f4c54454348',
    '445552414354454348e284a2',
    '445552414354454348',
    '4e414e4f434f5245e284a2',
    '4e414e4f434f5245',
    '454c494d434f5245e284a2',
    '454c494d434f5245',
    '44494553454c434f5245e284a2',
    '44494553454c434f5245'
  ];
  replacements TEXT[] := ARRAY[
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '544845524d41434f5245e284a2',
    '544845524d41434f5245',
    '4455524154454348e284a2',
    '4455524154454348',
    '4e414e4f464f524345e284a2',
    '4e414e4f464f524345',
    '494e54454b434f5245e284a2',
    '494e54454b434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245'
  ];
BEGIN
  -- Fail fast, before any UPDATE, if a pattern is not a safe regex literal.
  FOR i IN 1..array_length(patterns, 1) LOOP
    src := convert_from(decode(patterns[i], 'hex'), 'UTF8');
    FOR j IN 1..length(metachars) LOOP
      IF position(substr(metachars, j, 1) IN src) > 0 THEN
        RAISE EXCEPTION 'Canonical technology purge pattern % is not a safe regexp_replace literal (contains regex metacharacter %)', src, substr(metachars, j, 1);
      END IF;
    END LOOP;
  END LOOP;

  FOR r IN
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND EXISTS (
        SELECT 1 FROM information_schema.tables t
        WHERE t.table_schema = c.table_schema
          AND t.table_name = c.table_name
          AND t.table_type = 'BASE TABLE'
      )
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position
  LOOP
    FOR i IN 1..array_length(patterns, 1) LOOP
      src := convert_from(decode(patterns[i], 'hex'), 'UTF8');
      dst := convert_from(decode(replacements[i], 'hex'), 'UTF8');

      IF r.data_type = 'jsonb' THEN
        EXECUTE format(
          'UPDATE %I.%I SET %I = regexp_replace(%I::text, $1, $2, ''gi'')::jsonb WHERE %I::text ILIKE $3',
          r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
        ) USING src, dst, '%' || src || '%';
      ELSIF r.data_type = 'json' THEN
        EXECUTE format(
          'UPDATE %I.%I SET %I = regexp_replace(%I::text, $1, $2, ''gi'')::json WHERE %I::text ILIKE $3',
          r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
        ) USING src, dst, '%' || src || '%';
      ELSE
        EXECUTE format(
          'UPDATE %I.%I SET %I = regexp_replace(%I, $1, $2, ''gi'') WHERE %I ILIKE $3',
          r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
        ) USING src, dst, '%' || src || '%';
      END IF;
    END LOOP;
  END LOOP;
END $$;

DO $$
DECLARE
  r RECORD;
  i INTEGER;
  src TEXT;
  remaining BIGINT;
  forbidden TEXT[] := ARRAY[
    '485944524f434f5245',
    '53594e5445504f5245',
    '53594e5445464f52',
    '434f4f4c54454348',
    '445552414354454348',
    '4e414e4f434f5245',
    '49534f4755415244',
    '50554c5345434f5245',
    '454c494d434f5245',
    '44494553454c434f5245'
  ];
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND EXISTS (
        SELECT 1 FROM information_schema.tables t
        WHERE t.table_schema = c.table_schema
          AND t.table_name = c.table_name
          AND t.table_type = 'BASE TABLE'
      )
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position
  LOOP
    FOR i IN 1..array_length(forbidden, 1) LOOP
      src := convert_from(decode(forbidden[i], 'hex'), 'UTF8');
      EXECUTE format(
        'SELECT count(*) FROM %I.%I WHERE %I::text ILIKE $1',
        r.table_schema, r.table_name, r.column_name
      ) INTO remaining USING '%' || src || '%';

      IF remaining > 0 THEN
        RAISE EXCEPTION 'Canonical technology purge verification failed in %.% column %',
          r.table_schema, r.table_name, r.column_name;
      END IF;
    END LOOP;
  END LOOP;
END $$;

COMMIT;
