\set ON_ERROR_STOP on

-- Required psql variables:
--   -v brain_password='strong-generated-password'
-- Optional:
--   -v brain_role='elimfilters_brain_ro'
--   -v target_schema='public'
--   -v target_table='elimfilters_catalog'

\if :{?brain_role}
\else
\set brain_role 'elimfilters_brain_ro'
\endif

\if :{?target_schema}
\else
\set target_schema 'public'
\endif

\if :{?target_table}
\else
\set target_table 'elimfilters_catalog'
\endif

\if :{?brain_password}
\else
\echo 'ERROR: brain_password is required. Use -v brain_password=...'
\quit 1
\endif

BEGIN;

DO $do$
DECLARE
  role_name text := :'brain_role';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
    EXECUTE format(
      'CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5',
      role_name
    );
  ELSE
    EXECUTE format(
      'ALTER ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5',
      role_name
    );
  END IF;
END
$do$;

DO $do$
DECLARE
  role_name text := :'brain_role';
  role_password text := :'brain_password';
BEGIN
  EXECUTE format('ALTER ROLE %I PASSWORD %L', role_name, role_password);
  EXECUTE format('ALTER ROLE %I SET default_transaction_read_only = on', role_name);
  EXECUTE format('ALTER ROLE %I SET statement_timeout = %L', role_name, '60s');
  EXECUTE format('ALTER ROLE %I SET lock_timeout = %L', role_name, '5s');
  EXECUTE format('ALTER ROLE %I SET idle_in_transaction_session_timeout = %L', role_name, '60s');
END
$do$;

-- Remove broad privileges first.
REVOKE ALL ON DATABASE :DBNAME FROM :"brain_role";
REVOKE ALL ON SCHEMA :"target_schema" FROM :"brain_role";
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA :"target_schema" FROM :"brain_role";
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA :"target_schema" FROM :"brain_role";
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA :"target_schema" FROM :"brain_role";

-- Grant only what the Digital Brain needs.
GRANT CONNECT ON DATABASE :DBNAME TO :"brain_role";
GRANT USAGE ON SCHEMA :"target_schema" TO :"brain_role";
GRANT SELECT ON TABLE :"target_schema".:"target_table" TO :"brain_role";

-- Keep future objects private by default. This does not grant future access.
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON TABLES FROM :"brain_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON SEQUENCES FROM :"brain_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON FUNCTIONS FROM :"brain_role";

COMMIT;

-- Verification: every write privilege must be false.
SELECT
  current_database() AS database_name,
  :'brain_role' AS role_name,
  has_database_privilege(:'brain_role', current_database(), 'CONNECT') AS can_connect,
  has_schema_privilege(:'brain_role', :'target_schema', 'USAGE') AS can_use_schema,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'SELECT') AS can_select,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'INSERT') AS can_insert,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'UPDATE') AS can_update,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'DELETE') AS can_delete,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'TRUNCATE') AS can_truncate,
  has_table_privilege(:'brain_role', format('%I.%I', :'target_schema', :'target_table'), 'TRIGGER') AS can_trigger;

SELECT rolname, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls
FROM pg_roles
WHERE rolname = :'brain_role';
