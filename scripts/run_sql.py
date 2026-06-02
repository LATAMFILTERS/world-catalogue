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
    """Split SQL into individual statements, skipping comments and blanks."""
    # Remove block comments
    sql = re.sub(r'/\*.*?\*/', '', sql, flags=re.DOTALL)
    statements = []
    current = []
    in_string = False
    i = 0
    while i < len(sql):
        ch = sql[i]
        if ch == "'" and not in_string:
            in_string = True
            current.append(ch)
        elif ch == "'" and in_string:
            in_string = False
            current.append(ch)
        elif ch == '-' and not in_string and i + 1 < len(sql) and sql[i+1] == '-':
            # Line comment — skip to end of line
            while i < len(sql) and sql[i] != '\n':
                i += 1
            continue
        elif ch == ';' and not in_string:
            stmt = ''.join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
        else:
            current.append(ch)
        i += 1
    # Last statement without trailing semicolon
    stmt = ''.join(current).strip()
    if stmt:
        statements.append(stmt)
    return statements


def is_select(stmt):
    first = stmt.lstrip().upper()
    return (
        first.startswith('SELECT') or
        first.startswith('WITH') or
        first.startswith('TABLE')
    )


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
