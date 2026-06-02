"""
run_sql.py — Execute a SQL file against the production DB using Python/psycopg2
Usage: python scripts/run_sql.py scripts/enrich_db_equipment.sql
"""
import os, sys, psycopg2

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

conn = psycopg2.connect(db_url, sslmode="require")
conn.autocommit = False
cur = conn.cursor()

try:
    cur.execute(sql)
    conn.commit()
    print(f"OK — {cur.rowcount} rows affected (last statement)")
    print("Done.")
except Exception as e:
    conn.rollback()
    print(f"ERROR: {e}")
    sys.exit(1)
finally:
    cur.close()
    conn.close()
