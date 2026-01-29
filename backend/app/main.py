from fastapi import FastAPI, HTTPException , Query
from fastapi.middleware.cors import CORSMiddleware

import mysql.connector
from datetime import date
from app.db import get_conn
from app.schemas import BookingCreate

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "API Sport Booking attiva"}


# GET SLOTS

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

# GET SLOTS - FREE
@app.get("/slots/free")
def free_slots(day: date, field_id: int | None = Query(default=None)):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    sql = """
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
          AND s.is_active = 1
          AND DATE(s.starts_at) = %s
    """

    params = [day.isoformat()]

    if field_id is not None:
        sql += " AND s.field_id = %s"
        params.append(field_id)

    sql += " ORDER BY s.starts_at ASC"

    cur.execute(sql, tuple(params))
    rows = cur.fetchall()

    cur.close()
    conn.close()
    return {"rows": rows, "day": day.isoformat()}

# POST BOOKING

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

# DELETE BOOKING 

@app.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("DELETE FROM bookings WHERE id_booking = %s", (booking_id,))
    conn.commit()

    deleted = cur.rowcount
    cur.close()
    conn.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Booking non trovata")

    return {"ok": True, "deleted_id": booking_id}

# GET BOOKING
@app.get("/bookings")
def list_bookings():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
          b.id_booking,
          b.slot_id,
          b.customer_id,
          c.full_name,
          c.phone,
          c.email,
          f.name AS field_name,
          s.starts_at,
          s.ends_at,
          b.players_count,
          b.notes,
          b.created_at
        FROM bookings b
        JOIN customers c ON c.id = b.customer_id
        JOIN slots s ON s.id_slots = b.slot_id
        JOIN fields f ON f.id = s.field_id
        ORDER BY s.starts_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"rows": rows}

# GET CUSTOMERS 
@app.get("/customers")
def list_customers():
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    cur.execute("""
        SELECT
            id,
            full_name,
            phone,
            email
        FROM customers
        ORDER BY full_name ASC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"rows": rows}
