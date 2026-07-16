# PostgreSQL Read-Only Role Setup

## Objective

Create a dedicated PostgreSQL login for the ELIMFILTERS Digital Brain that can read only:

```text
public.elimfilters_catalog
```

The role must not be able to insert, update, delete, truncate, trigger, create databases, create roles, bypass row-level security, or inherit privileges from another role.

## Canonical role

```text
elimfilters_brain_ro
```

## Provisioning script

```text
scripts/create-postgres-readonly-role.sql
```

The script is idempotent. Running it again resets the role to the approved security posture and rotates its password.

## Execute from PowerShell

Use the Render **external PostgreSQL URL belonging to the administrative database user** only for this one-time provisioning operation.

```powershell
$env:ADMIN_DATABASE_URL = '<RENDER_ADMIN_EXTERNAL_DATABASE_URL>'
$password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object {[char]$_})

psql "$env:ADMIN_DATABASE_URL" `
  -v brain_password="$password" `
  -v brain_role="elimfilters_brain_ro" `
  -v target_schema="public" `
  -v target_table="elimfilters_catalog" `
  -f ".\scripts\create-postgres-readonly-role.sql"
```

The final verification table must report:

```text
can_connect  = true
can_use_schema = true
can_select   = true
can_insert   = false
can_update   = false
can_delete   = false
can_truncate = false
can_trigger  = false
```

## Construct the read-only connection URL

Take the administrative Render PostgreSQL URL and replace only its username and password with:

```text
username: elimfilters_brain_ro
password: value stored in $password
```

Do not place the URL in the repository, a Markdown document, an issue, a commit, or a chat message.

Store it in GitHub as the repository Actions secret:

```text
DATABASE_URL_READONLY
```

Store the Groq credential separately as:

```text
GROQ_API_KEY
```

## Runtime verification

The operational workflow executes:

```text
scripts/check-postgres-readonly.mjs
```

That script verifies all of the following before the Digital Brain may use the database:

1. the session is inside `BEGIN READ ONLY`;
2. `transaction_read_only` returns `on`;
3. the expected catalogue table exists;
4. write privileges are absent;
5. the connection is used only for catalogue inspection and read-only exports.

## Permanent policy

- Never use the administrative Render URL as `DATABASE_URL_READONLY`.
- Never grant this role access to all tables automatically.
- Never add write privileges for Graphify, Groq, Obsidian, Claude Code, workflows, or the Digital Brain.
- Future tables remain inaccessible until explicitly reviewed and granted.
- Any failed privilege check blocks operational synchronization.
