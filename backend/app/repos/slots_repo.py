from datetime import date, datetime, time, timedelta
from typing import Optional, Dict, Any, List


def fetch_all_slots(cur) -> List[Dict[str, Any]]:
    cur.execute("""
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
        ORDER BY s.starts_at ASC
    """)
    return cur.fetchall()


def fetch_free_slots(
    cur,
    day: date,
    field_id=None,
    sport_id=None,
) -> List[Dict[str, Any]]:
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
        LEFT JOIN bookings b
          ON b.slot_id = s.id_slots
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
    return cur.fetchall()


def slot_exists(cur, field_id: int, starts_at: datetime, ends_at: datetime) -> bool:
    cur.execute("""
        SELECT 1
        FROM slots
        WHERE field_id = %s AND starts_at = %s AND ends_at = %s
        LIMIT 1
    """, (field_id, starts_at, ends_at))
    return cur.fetchone() is not None


def insert_slot(cur, field_id: int, starts_at: datetime, ends_at: datetime, price_cents: int) -> None:
    cur.execute("""
        INSERT INTO slots (field_id, starts_at, ends_at, price_cents, is_active)
        VALUES (%s, %s, %s, %s, 1)
    """, (field_id, starts_at, ends_at, price_cents))


def fetch_active_fields_by_sport(cur, sport_id: int) -> List[Dict[str, Any]]:
    cur.execute("""
        SELECT id, name
        FROM fields
        WHERE sport_id = %s AND is_active = 1
        ORDER BY name ASC
    """, (sport_id,))
    return cur.fetchall()


def generate_slots_bulk(
    cur,
    fields: List[Dict[str, Any]],
    date_from: date,
    date_to: date,
    start_time: time,
    end_time: time,
    slot_minutes: int,
    price_cents: int,
) -> Dict[str, int]:
    """
    Genera slot per tutti i campi passati nel range di date e orari.
    Restituisce {"created": N, "skipped": N}.
    """
    created = 0
    skipped = 0

    day = date_from
    while day <= date_to:
        day_start = datetime.combine(day, start_time)
        day_end = datetime.combine(day, end_time)

        for field in fields:
            t = day_start
            while t + timedelta(minutes=slot_minutes) <= day_end:
                starts_at = t
                ends_at = t + timedelta(minutes=slot_minutes)

                if slot_exists(cur, field["id"], starts_at, ends_at):
                    skipped += 1
                else:
                    insert_slot(cur, field["id"], starts_at, ends_at, price_cents)
                    created += 1

                t = ends_at

        day = day + timedelta(days=1)

    return {"created": created, "skipped": skipped}