from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from mysql.connector import IntegrityError

from app.db import get_db
from app.schemas import (
    BookingCreate, BookingUpdate,
    BookingCreateOut, BookingsListOut, DeleteBookingOut
)
from app.repos.bookings_repo import fetch_booking_full

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.get("", response_model=BookingsListOut)
def list_bookings(
    day: date | None = Query(default=None),
    field_id: int | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    status: str | None = Query(default="active"),
    q: str | None = Query(default=None),
    db=Depends(get_db),
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

            f.sport_id,
            sp.name AS sport_name,

            s.starts_at,
            s.ends_at,
            b.players_count,
            b.notes,
            b.status,
            b.created_at
            FROM bookings b
            JOIN customers c ON c.id = b.customer_id
            JOIN slots s ON s.id_slots = b.slot_id
            JOIN fields f ON f.id = s.field_id
            JOIN sports sp ON sp.id = f.sport_id
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

        # status: se None o "" => non filtrare
        if status is not None and status != "":
            where.append("b.status = %s")
            params.append(status)

        # 🔎 ricerca testuale (nome / telefono / email / campo / sport)
        if q is not None:
            q = q.strip()
            if q:
                where.append("""
                    (
                      c.full_name LIKE %s OR
                      c.phone LIKE %s OR
                      c.email LIKE %s OR
                      f.name LIKE %s OR
                      sp.name LIKE %s
                    )
                """)
                like = f"%{q}%"
                params.extend([like, like, like, like, like])

        if where:
            sql += " WHERE " + " AND ".join(where)

        sql += " ORDER BY s.starts_at DESC"

        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        return {"rows": rows}
    finally:
        cur.close()

@router.get("/{booking_id}", response_model=BookingCreateOut)
def get_booking(booking_id: int, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        booking = fetch_booking_full(cur, booking_id)
        if booking is None:
            raise HTTPException(status_code=404, detail="Booking non trovata")
        return {"booking": booking}
    finally:
        cur.close()


@router.post("", response_model=BookingCreateOut)
def create_booking(payload: BookingCreate, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            INSERT INTO bookings (slot_id, customer_id, players_count, notes)
            VALUES (%s, %s, %s, %s)
        """, (payload.slot_id, payload.customer_id, payload.players_count, payload.notes))
        db.commit()

        booking_id = cur.lastrowid
        booking = fetch_booking_full(cur, booking_id)
        return {"booking": booking}

    except IntegrityError as e:
        msg = str(e)
        if "Duplicate entry" in msg or "uq_bookings_slot" in msg:
            raise HTTPException(status_code=409, detail="Slot già prenotato")
        raise HTTPException(status_code=400, detail="Slot o customer non valido")
    finally:
        cur.close()


@router.patch("/{booking_id}", response_model=BookingCreateOut)
def update_booking(booking_id: int, payload: BookingUpdate, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        fields = []
        params = []

        if payload.players_count is not None:
            fields.append("players_count = %s")
            params.append(payload.players_count)
        if payload.notes is not None:
            fields.append("notes = %s")
            params.append(payload.notes)

        if not fields:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")

        params.append(booking_id)
        sql = "UPDATE bookings SET " + ", ".join(fields) + " WHERE id_booking = %s"
        cur.execute(sql, tuple(params))

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Booking non trovata")

        db.commit()

        booking = fetch_booking_full(cur, booking_id)
        return {"booking": booking}
    finally:
        cur.close()


# @router.delete("/{booking_id}", response_model=DeleteBookingOut)
# def delete_booking(booking_id: int, db=Depends(get_db)):
#     cur = db.cursor()
#     try:
#         cur.execute("DELETE FROM bookings WHERE id_booking = %s", (booking_id,))
#         deleted = cur.rowcount
#         if deleted == 0:
#             raise HTTPException(status_code=404, detail="Booking non trovata")

#         db.commit()
#         return {"ok": True, "deleted_id": booking_id}
#     finally:
#         cur.close()

@router.delete("/{booking_id}", response_model=DeleteBookingOut)
def delete_booking(booking_id: int, db=Depends(get_db)):
    cur = db.cursor()
    try:
        cur.execute(
            """
            UPDATE bookings
            SET status = 'cancelled'
            WHERE id_booking = %s AND status <> 'cancelled'
            """,
            (booking_id,),
        )
        updated = cur.rowcount

        if updated == 0:
            # o non esiste, o era già cancelled → distinguiamo in modo pulito
            cur.execute("SELECT 1 FROM bookings WHERE id_booking = %s", (booking_id,))
            exists = cur.fetchone()
            if not exists:
                raise HTTPException(status_code=404, detail="Booking non trovata")
            # già cancellata → ok idempotente
            return {"ok": True, "deleted_id": booking_id}

        db.commit()
        return {"ok": True, "deleted_id": booking_id}
    finally:
        cur.close()
