"""
run_sql.py — Execute a SQL file against the production DB using asyncpg
Usage: python scripts/run_sql.py scripts/enrich_db_equipment.sql

Requires: pip install asyncpg
Windows: uses WindowsSelectorEventLoopPolicy to avoid WinError 64 with SSL
"""
import asyncio, os, sys

# Fix for Windows SSL + asyncio conflict
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
    sql = f.read()

async def run():
    conn = await asyncpg.connect(db_url, ssl="require")
    try:
        await conn.execute(sql)
        print("Done.")
    finally:
        await conn.close()

asyncio.run(run())
