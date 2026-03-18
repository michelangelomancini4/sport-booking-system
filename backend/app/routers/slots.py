from datetime import date
from fastapi import APIRouter, Depends, Query, HTTPException

from app.db import get_db
from app.schemas import SlotsListOut, FreeSlotsOut, SlotsGenerateIn, SlotsGenerateOut
from app.repos.slots_repo import (
    fetch_all_slots,
    fetch_free_slots,
    fetch_active_fields_by_sport,
    generate_slots_bulk,
)

router = APIRouter(prefix="/slots", tags=["slots"])

DEFAULT_PRICE_BY_SPORT = {
    1: 3000,  # Padel
    2: 5000,  # Calcetto
}


@router.get("", response_model=SlotsListOut)
def list_slots(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_all_slots(cur)
        return {"rows": rows}
    finally:
        cur.close()


@router.get("/free", response_model=FreeSlotsOut)
def free_slots(
    day: date,
    field_id: int | None = Query(default=None),
    sport_id: int | None = Query(default=None),
    db=Depends(get_db),
):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_free_slots(cur, day=day, field_id=field_id, sport_id=sport_id)
        return {"rows": rows, "day": day.isoformat()}
    finally:
        cur.close()


@router.post("/generate", response_model=SlotsGenerateOut)
def generate_slots(payload: SlotsGenerateIn, db=Depends(get_db)):
    price_cents = payload.price_cents
    if price_cents is None:
        price_cents = DEFAULT_PRICE_BY_SPORT.get(payload.sport_id)
        if price_cents is None:
            raise HTTPException(
                status_code=400,
                detail="sport_id non supportato (manca prezzo default)"
            )

    cur = db.cursor(dictionary=True)
    try:
        fields = fetch_active_fields_by_sport(cur, payload.sport_id)
        if not fields:
            raise HTTPException(
                status_code=404,
                detail="Nessun campo attivo trovato per questo sport_id"
            )

        result = generate_slots_bulk(
            cur,
            fields=fields,
            date_from=payload.date_from,
            date_to=payload.date_to,
            start_time=payload.start_time,
            end_time=payload.end_time,
            slot_minutes=payload.slot_minutes,
            price_cents=price_cents,
        )

        db.commit()

        return {
            "sport_id": payload.sport_id,
            "date_from": payload.date_from,
            "date_to": payload.date_to,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "slot_minutes": payload.slot_minutes,
            "price_cents": price_cents,
            "fields_count": len(fields),
            **result,
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()

