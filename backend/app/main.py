from fastapi import FastAPI, HTTPException , Query , Depends
from fastapi.middleware.cors import CORSMiddleware

import mysql.connector
from datetime import date
from app.db import  get_db
from app.schemas import BookingCreate , CustomersListOut ,SlotsListOut,FreeSlotsOut, BookingsListOut, BookingCreateOut, DeleteBookingOut

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

@app.get("/slots", response_model=SlotsListOut)
def list_slots(db = Depends(get_db)):
    
    cur = db.cursor(dictionary=True)
    try:
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
        return {"rows": rows}
    
    finally:
        cur.close()

# GET SLOTS - FREE
@app.get("/slots/free", response_model=FreeSlotsOut)
def free_slots(day: date, field_id: int | None = Query(default=None), db = Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:

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
        return {"rows": rows, "day": day.isoformat()}
    finally:
        cur.close()

# POST BOOKING

@app.post("/bookings", response_model=BookingCreateOut)
def create_booking(payload: BookingCreate, db = Depends(get_db)):
    cur = db.cursor(dictionary=True)

    try:
        #  INSERT
        cur.execute("""
            INSERT INTO bookings (slot_id, customer_id, players_count, notes)
            VALUES (%s, %s, %s, %s)
        """, (
            payload.slot_id,
            payload.customer_id,
            payload.players_count,
            payload.notes
        ))
        db.commit()

        booking_id = cur.lastrowid

        # SELECT 
        cur.execute("""
            SELECT
              b.id_booking,
              b.slot_id,
              b.customer_id,
              c.full_name,
              c.phone,
              c.email,
              f.name AS field_name,
              s.field_id,
              s.starts_at,
              s.ends_at,
              b.players_count,
              b.notes,
              b.created_at
            FROM bookings b
            JOIN customers c ON c.id = b.customer_id
            JOIN slots s ON s.id_slots = b.slot_id
            JOIN fields f ON f.id = s.field_id
            WHERE b.id_booking = %s
        """, (booking_id,))

        booking = cur.fetchone()
        return {"booking": booking}

    except mysql.connector.IntegrityError as e:
        msg = str(e)

        if "Duplicate entry" in msg or "uq_bookings_slot" in msg:
            raise HTTPException(status_code=409, detail="Slot già prenotato")

        raise HTTPException(status_code=400, detail="Slot o customer non valido")

    finally:
        cur.close()


# DELETE BOOKING 

@app.delete("/bookings/{booking_id}", response_model=DeleteBookingOut)
def delete_booking(booking_id: int, db = Depends(get_db)):
    cur = db.cursor(dictionary=True)

    cur.execute("DELETE FROM bookings WHERE id_booking = %s", (booking_id,))
    db.commit()

    deleted = cur.rowcount
    cur.close()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Booking non trovata")

    return {"ok": True, "deleted_id": booking_id}

# GET BOOKING
@app.get("/bookings", response_model=BookingsListOut)
def list_bookings(
    day: date | None = Query(default=None),
    field_id: int | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    db = Depends(get_db)
):
    cur = db.cursor(dictionary=True)
    try:
        sql = """
            SELECT
            b.id_booking,
            b.slot_id,
            b.customer_id,
            c.full_name,
            c.phone,
            c.email,
            f.name AS field_name,
            s.field_id,
            s.starts_at,
            s.ends_at,
            b.players_count,
            b.notes,
            b.created_at
            FROM bookings b
            JOIN customers c ON c.id = b.customer_id
            JOIN slots s ON s.id_slots = b.slot_id
            JOIN fields f ON f.id = s.field_id
        """

        where = []
        params = []

        if day is not None:
            where.append("DATE(s.starts_at) = %s")
            params.append(day.isoformat())

        if field_id is not None:
            where.append("s.field_id = %s")
            params.append(field_id)

        if customer_id is not None:
            where.append("b.customer_id = %s")
            params.append(customer_id)

        if where:
            sql += " WHERE " + " AND ".join(where)

        sql += " ORDER BY s.starts_at DESC"

        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        return {"rows": rows}
    
    finally:
        cur.close()

# GET CUSTOMERS 
@app.get("/customers", response_model=CustomersListOut)
def list_customers(db = Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:

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
        return {"rows": rows}
    
    finally:
        cur.close()

