-- Canonical technology purge
-- Rewrites superseded technology identifiers across all text and JSON columns
-- in the public schema, then fails if any superseded identifier remains.

BEGIN;

DO $$
DECLARE
  r RECORD;
  i INTEGER;
  src TEXT;
  dst TEXT;
  patterns TEXT[] := ARRAY[
    '485944524f434f52452f534552494553e284a2',
    '485944524f434f52452f534552494553',
    '485944524f434f5245e284a2',
    '485944524f434f5245',
    '53594e5445504f5245e284a2',
    '53594e5445504f5245',
    '434f4f4c54454348e284a2',
    '434f4f4c54454348'
  ];
  replacements TEXT[] := ARRAY[
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '545552424f434f5245e284a2',
    '545552424f434f5245',
    '53594e5441504f5245e284a2',
    '53594e5441504f5245',
    '544845524d41434f5245e284a2',
    '544845524d41434f5245'
  ];
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position
  LOOP
    FOR i IN 1..array_length(patterns, 1) LOOP
      src := convert_from(decode(patterns[i], 'hex'), 'UTF8');
      dst := convert_from(decode(replacements[i], 'hex'), 'UTF8');

      IF r.data_type = 'jsonb' THEN
        EXECUTE format(
          'UPDATE %I.%I SET %I = replace(%I::text, $1, $2)::jsonb WHERE %I::text LIKE $3',
          r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
        ) USING src, dst, '%' || src || '%';
      ELSIF r.data_type = 'json' THEN
        EXECUTE format(
          'UPDATE %I.%I SET %I = replace(%I::text, $1, $2)::json WHERE %I::text LIKE $3',
          r.table_schema, r.table_name, r.column_name, r.column_name, r.column_name
        ) USING src, dst, '%' || src || '%';
      ELSE
        EXECUTE format(
          'UPDATE %I.%I SET %I = replace(%I, $1, $2) WHERE %I LIKE $3',
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
  patterns TEXT[] := ARRAY[
    '485944524f434f5245',
    '53594e5445504f5245',
    '434f4f4c54454348'
  ];
BEGIN
  FOR r IN
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
    ORDER BY table_name, ordinal_position
  LOOP
    FOR i IN 1..array_length(patterns, 1) LOOP
      src := convert_from(decode(patterns[i], 'hex'), 'UTF8');
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
