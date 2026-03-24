from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from mysql.connector import IntegrityError

from app.auth.dependencies import get_current_admin

from app.db import get_db
from app.schemas import (
    BookingCreate, BookingUpdate,
    BookingCreateOut, BookingsListOut, DeleteBookingOut,
    BookingsHistoryListOut,  
)
from app.repos.bookings_repo import (
    fetch_booking_full,
    fetch_bookings_list,
    fetch_bookings_history,
    insert_booking,
    update_booking,
    cancel_booking,
    booking_exists,
    booking_in_history,  
)

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("", response_model=BookingsListOut)
def list_bookings(
    day: date | None = Query(default=None),
    field_id: int | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db=Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_bookings_list(cur, day=day, field_id=field_id,
                                   customer_id=customer_id, status=status, q=q)
        return {"rows": rows}
    finally:
        cur.close()

@router.get("/history", response_model=BookingsHistoryListOut)
def list_bookings_history(
    day: date | None = Query(default=None),
    customer_id: int | None = Query(default=None),
    q: str | None = Query(default=None),
    db=Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_bookings_history(cur, day=day, customer_id=customer_id, q=q)
        return {"rows": rows}
    finally:
        cur.close()
        
@router.get("/{booking_id}", response_model=BookingCreateOut)
def get_booking(
    booking_id: int,
    db=Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
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
        booking_id = insert_booking(
            cur,
            slot_id=payload.slot_id,
            customer_id=payload.customer_id,
            players_count=payload.players_count,
            notes=payload.notes,
        )
        db.commit()
        booking = fetch_booking_full(cur, booking_id)
        return {"booking": booking}
    except IntegrityError as e:
        db.rollback()
        msg = str(e)
        if "Duplicate entry" in msg or "uq_bookings_slot" in msg:
            raise HTTPException(status_code=409, detail="Slot già prenotato")
        raise HTTPException(status_code=400, detail="Slot o customer non valido")
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()


@router.patch("/{booking_id}", response_model=BookingCreateOut)
def update_booking_route(
    booking_id: int,
    payload: BookingUpdate,
    db=Depends(get_db),
    current_admin: str = Depends(get_current_admin),
):
    cur = db.cursor(dictionary=True)
    try:
        fields = {}
        if payload.players_count is not None:
            fields["players_count"] = payload.players_count
        if payload.notes is not None:
            fields["notes"] = payload.notes

        if not fields:
            raise HTTPException(status_code=400, detail="Nessun campo da aggiornare")

        updated = update_booking(cur, booking_id, fields)
        if updated == 0:
            raise HTTPException(status_code=404, detail="Booking non trovata")

        db.commit()
        booking = fetch_booking_full(cur, booking_id)
        return {"booking": booking}
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()


@router.delete("/{booking_id}", response_model=DeleteBookingOut)
def delete_booking(booking_id: int, db=Depends(get_db),current_admin: str = Depends(get_current_admin),):
    cur = db.cursor(dictionary=True)
    try:
        updated = cancel_booking(cur, booking_id)
        if updated == 0:
            if booking_in_history(cur, booking_id):
                raise HTTPException(status_code=409, detail="Prenotazione già annullata")
            raise HTTPException(status_code=404, detail="Booking non trovata")
        db.commit()
        return {"ok": True, "deleted_id": booking_id}
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()