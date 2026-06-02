"""
run_sql.py — Execute a SQL file against the production DB using asyncpg
Usage: python scripts/run_sql.py scripts/enrich_db_equipment.sql

Requires: pip install asyncpg
Windows: uses WindowsSelectorEventLoopPolicy to avoid WinError 64 with SSL

SELECT statements print results as a table.
DDL/DML statements print row counts.
Comments and blank statements are skipped.
"""
import asyncio, os, sys, re

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import asyncpg

sql_file = sys.argv[1] if len(sys.argv) > 1 else None
if not sql_file:
    print("Usage: python scripts/run_sql.py <file.sql>")
    sys.exit(1)

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

with open(sql_file, encoding="utf-8") as f:
    raw = f.read()


def split_statements(sql):
    """Split SQL into statements. Handles single-quoted strings and $$ dollar-quoting."""
    # Remove block comments /* ... */
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
    statements = []
    current = []
    in_single = False
    in_dollar = False
    dollar_tag = ''
    i = 0
    n = len(sql)

    while i < n:
        ch = sql[i]

        # Dollar-quote start: $tag$ or $$
        if not in_single and not in_dollar and ch == '$':
            j = i + 1
            while j < n and (sql[j].isalnum() or sql[j] == '_'):
                j += 1
            if j < n and sql[j] == '$':
                dollar_tag = sql[i:j + 1]
                in_dollar = True
                current.append(dollar_tag)
                i = j + 1
                continue

        # Dollar-quote end
        if in_dollar and ch == '$':
            tag_end = dollar_tag
            if sql[i:i + len(tag_end)] == tag_end:
                in_dollar = False
                current.append(tag_end)
                i += len(tag_end)
                dollar_tag = ''
                continue

        # Single-quote toggle (only outside dollar-quotes)
        if not in_dollar:
            if ch == "'" and not in_single:
                in_single = True
            elif ch == "'" and in_single:
                # Escaped quote ''
                if i + 1 < n and sql[i + 1] == "'":
                    current.append("''")
                    i += 2
                    continue
                in_single = False

        # Line comment (only outside all quoting)
        if not in_single and not in_dollar and ch == '-' and i + 1 < n and sql[i + 1] == '-':
            while i < n and sql[i] != '\n':
                i += 1
            continue

        # Statement terminator
        if ch == ';' and not in_single and not in_dollar:
            stmt = ''.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    stmt = ''.join(current).strip()
    if stmt:
        statements.append(stmt)
    return statements


def is_select(stmt):
    first = stmt.lstrip().upper()
    if first.startswith('WITH'):
        # WITH...INSERT / UPDATE / DELETE = DML, not a query
        body = stmt.upper()
        if re.search(r'\bINSERT\b|\bUPDATE\b|\bDELETE\b', body):
            return False
        return True
    return first.startswith('SELECT') or first.startswith('TABLE')


def print_table(rows, keys):
    if not rows:
        print("(0 rows)")
        return
    widths = {k: len(str(k)) for k in keys}
    for row in rows:
        for k in keys:
            widths[k] = max(widths[k], len(str(row[k]) if row[k] is not None else 'NULL'))
    header = " | ".join(str(k).ljust(widths[k]) for k in keys)
    separator = "-+-".join("-" * widths[k] for k in keys)
    print(header)
    print(separator)
    for row in rows:
        print(" | ".join(str(row[k] if row[k] is not None else 'NULL').ljust(widths[k]) for k in keys))
    print(f"({len(rows)} row{'s' if len(rows) != 1 else ''})")


async def run():
    conn = await asyncpg.connect(db_url, ssl="require")
    try:
        statements = split_statements(raw)
        print(f"--- {sql_file} ({len(statements)} statements) ---\n")
        for i, stmt in enumerate(statements, 1):
            preview = stmt[:60].replace('\n', ' ')
            print(f"[{i}/{len(statements)}] {preview}{'...' if len(stmt) > 60 else ''}")
            try:
                if is_select(stmt):
                    rows = await conn.fetch(stmt)
                    if rows:
                        keys = list(rows[0].keys())
                        print_table(rows, keys)
                    else:
                        print("(0 rows)")
                else:
                    result = await conn.execute(stmt)
                    print(f"  → {result}")
            except Exception as e:
                print(f"  ERROR: {e}")
                print("  Continuing...")
            print()
        print("Done.")
    finally:
        await conn.close()


asyncio.run(run())
