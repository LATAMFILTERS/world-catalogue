\set ON_ERROR_STOP on

-- Required psql variable:
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

-- Create only when absent. \gexec executes the generated statement.
SELECT format(
  'CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5',
  :'brain_role'
)
WHERE NOT EXISTS (
  SELECT 1 FROM pg_roles WHERE rolname = :'brain_role'
)
\gexec

-- Re-assert safe role properties on every execution.
SELECT format(
  'ALTER ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS CONNECTION LIMIT 5',
  :'brain_role'
)
\gexec

SELECT format('ALTER ROLE %I PASSWORD %L', :'brain_role', :'brain_password') \gexec
SELECT format('ALTER ROLE %I SET default_transaction_read_only = on', :'brain_role') \gexec
SELECT format('ALTER ROLE %I SET statement_timeout = %L', :'brain_role', '60s') \gexec
SELECT format('ALTER ROLE %I SET lock_timeout = %L', :'brain_role', '5s') \gexec
SELECT format('ALTER ROLE %I SET idle_in_transaction_session_timeout = %L', :'brain_role', '60s') \gexec

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

-- Future objects remain inaccessible unless explicitly granted later.
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON TABLES FROM :"brain_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON SEQUENCES FROM :"brain_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA :"target_schema"
  REVOKE ALL ON FUNCTIONS FROM :"brain_role";

COMMIT;

-- Verification: write privileges must all be false.
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

SELECT
  rolname,
  rolsuper,
  rolcreatedb,
  rolcreaterole,
  rolreplication,
  rolbypassrls,
  rolconnlimit,
  rolconfig
FROM pg_roles
WHERE rolname = :'brain_role';
