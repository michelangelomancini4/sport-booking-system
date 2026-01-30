from datetime import date
from fastapi import APIRouter, Depends, Query

from app.db import get_db
from app.schemas import SlotsListOut, FreeSlotsOut

router = APIRouter(prefix="/slots", tags=["slots"])

@router.get("", response_model=SlotsListOut)
def list_slots(db=Depends(get_db)):
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


@router.get("/free", response_model=FreeSlotsOut)
def free_slots(day: date, field_id: int | None = Query(default=None), db=Depends(get_db)):
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
