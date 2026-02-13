from datetime import date ,datetime, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException

from app.db import get_db
from app.schemas import SlotsListOut, FreeSlotsOut,  SlotsGenerateIn, SlotsGenerateOut

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
def free_slots(
    day: date,
    field_id: int | None = Query(default=None),
    sport_id: int | None = Query(default=None),
    db=Depends(get_db),
):
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
                s.is_active,
                f.sport_id,
                sp.name AS sport_name
            FROM slots s
            JOIN fields f ON f.id = s.field_id
            JOIN sports sp ON sp.id = f.sport_id
            LEFT JOIN bookings b ON b.slot_id = s.id_slots
            WHERE b.id_booking IS NULL
              AND s.is_active = 1
              AND f.is_active = 1
              AND DATE(s.starts_at) = %s
        """

        params = [day.isoformat()]

        if field_id is not None:
            sql += " AND s.field_id = %s"
            params.append(field_id)

        if sport_id is not None:
            sql += " AND f.sport_id = %s"
            params.append(sport_id)

        sql += " ORDER BY s.starts_at ASC"

        cur.execute(sql, tuple(params))
        rows = cur.fetchall()
        return {"rows": rows, "day": day.isoformat()}
    finally:
        cur.close()


@router.post("/generate", response_model=SlotsGenerateOut)
def generate_slots(payload: SlotsGenerateIn, db=Depends(get_db)):
    """
    Genera slot per tutti i campi attivi di uno sport, in un range di date.
    Regole: 10-23, tutti i giorni, durata 60m (default), skip se già esiste.
    """
    DEFAULT_PRICE_BY_SPORT = {
        1: 3000,  # Padel
        2: 5000,  # Calcetto
    }

    price_cents = payload.price_cents
    if price_cents is None:
        price_cents = DEFAULT_PRICE_BY_SPORT.get(payload.sport_id)
        if price_cents is None:
            raise HTTPException(status_code=400, detail="sport_id non supportato (manca prezzo default)")

    # validazione range date
    if payload.date_to < payload.date_from:
        raise HTTPException(status_code=400, detail="date_to deve essere >= date_from")

    # validazione orari
    # (end_time deve permettere almeno uno slot completo)
    start_dt_dummy = datetime.combine(payload.date_from, payload.start_time)
    end_dt_dummy = datetime.combine(payload.date_from, payload.end_time)
    if end_dt_dummy <= start_dt_dummy:
        raise HTTPException(status_code=400, detail="end_time deve essere dopo start_time")

    cur = db.cursor(dictionary=True)
    try:
        # 1) prendi campi attivi dello sport
        cur.execute(
            """
            SELECT id, name
            FROM fields
            WHERE sport_id = %s AND is_active = 1
            ORDER BY name ASC
            """,
            (payload.sport_id,),
        )
        fields = cur.fetchall()
        if not fields:
            raise HTTPException(status_code=404, detail="Nessun campo attivo trovato per questo sport_id")

        created = 0
        skipped = 0

        # 2) loop giorni inclusivo
        day = payload.date_from
        while day <= payload.date_to:
            day_start = datetime.combine(day, payload.start_time)
            day_end = datetime.combine(day, payload.end_time)

            # 3) loop campi
            for f in fields:
                field_id = f["id"]

                # 4) loop slot nella finestra oraria
                t = day_start
                while t + timedelta(minutes=payload.slot_minutes) <= day_end:
                    starts_at = t
                    ends_at = t + timedelta(minutes=payload.slot_minutes)

                    # SKIP duplicati: controlliamo se esiste già lo stesso slot
                    cur.execute(
                        """
                        SELECT 1
                        FROM slots
                        WHERE field_id = %s AND starts_at = %s AND ends_at = %s
                        LIMIT 1
                        """,
                        (field_id, starts_at, ends_at),
                    )
                    exists = cur.fetchone() is not None

                    if exists:
                        skipped += 1
                    else:
                        cur.execute(
                            """
                            INSERT INTO slots (field_id, starts_at, ends_at, price_cents, is_active)
                            VALUES (%s, %s, %s, %s, 1)
                            """,
                            (field_id, starts_at, ends_at, price_cents),
                        )
                        created += 1

                    t = ends_at  # prossimo slot

            day = day + timedelta(days=1)

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
            "created": created,
            "skipped": skipped,
        }
    finally:
        cur.close()
