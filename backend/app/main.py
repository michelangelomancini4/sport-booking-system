from fastapi import FastAPI
from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()

app = FastAPI()

def get_conn():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "db_sportbooking"),
        port=int(os.getenv("DB_PORT", "3306")),
    )

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/slots")
def list_slots():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            s.id_slots,
            s.field_id,
            f.name AS field_name,
            s.starts_at,
            s.ends_at,
            s.price_cents,
            s.is_active
        FROM slots s
        JOIN fields f ON f.id = s.field_id
        ORDER BY s.starts_at ASC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"rows": rows}
