from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
import mysql.connector
from datetime import date

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

class BookingCreate(BaseModel):
    slot_id: int
    customer_id: int
    players_count: int = Field(default=1, ge=1)
    notes: str | None = None


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

@app.get("/slots/free")
def free_slots(day: date):
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
        LEFT JOIN bookings b ON b.slot_id = s.id_slots
        WHERE b.id_booking IS NULL
          AND DATE(s.starts_at) = %s
        ORDER BY s.starts_at ASC
    """, (day.isoformat(),))

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"rows": rows, "day": day}

@app.post("/bookings")
def create_booking(payload: BookingCreate):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("""
            INSERT INTO bookings (slot_id, customer_id, players_count, notes)
            VALUES (%s, %s, %s, %s)
        """, (payload.slot_id, payload.customer_id, payload.players_count, payload.notes))
        conn.commit()

        booking_id = cur.lastrowid

        cur.execute("""
            SELECT
              b.id_booking,
              b.slot_id,
              b.customer_id,
              b.players_count,
              b.notes,
              b.created_at
            FROM bookings b
            WHERE b.id_booking = %s
        """, (booking_id,))
        booking = cur.fetchone()

        return {"booking": booking}

    except mysql.connector.IntegrityError as e:
        msg = str(e)

        # slot già prenotato (UNIQUE su bookings.slot_id)
        if "Duplicate entry" in msg or "uq_bookings_slot" in msg:
            raise HTTPException(status_code=409, detail="Slot già prenotato")

        # FK fallita (slot_id o customer_id inesistenti)
        raise HTTPException(status_code=400, detail="Slot o customer non valido")

    finally:
        cur.close()
        conn.close()
