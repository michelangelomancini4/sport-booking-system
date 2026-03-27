from datetime import datetime

DAYS_IT = {
    0: "Lunedì",
    1: "Martedì",
    2: "Mercoledì",
    3: "Giovedì",
    4: "Venerdì",
    5: "Sabato",
    6: "Domenica",
}


def fetch_all_opening_hours(cur) -> list[dict]:
    """
    Restituisce tutti e 7 i giorni ordinati per day_of_week.
    Aggiunge il campo 'day_name' in italiano per il frontend.
    """
    cur.execute("""
        SELECT
            id,
            day_of_week,
            open_time,
            close_time,
            is_closed
        FROM opening_hours
        ORDER BY day_of_week ASC
    """)
    rows = cur.fetchall()

    for row in rows:
        row["day_name"] = DAYS_IT.get(row["day_of_week"], "?")
        if row["open_time"] is not None:
            row["open_time"] = _timedelta_to_str(row["open_time"])
        if row["close_time"] is not None:
            row["close_time"] = _timedelta_to_str(row["close_time"])

    return rows


def fetch_today_opening_hours(cur) -> dict | None:
    
    today_dow = datetime.now().weekday()  

    cur.execute("""
        SELECT
            id,
            day_of_week,
            open_time,
            close_time,
            is_closed
        FROM opening_hours
        WHERE day_of_week = %s
    """, (today_dow,))

    row = cur.fetchone()
    if row is None:
        return None

    row["day_name"] = DAYS_IT.get(row["day_of_week"], "?")
    if row["open_time"] is not None:
        row["open_time"] = _timedelta_to_str(row["open_time"])
    if row["close_time"] is not None:
        row["close_time"] = _timedelta_to_str(row["close_time"])

    return row


def _timedelta_to_str(td) -> str:
    """
    MySQL restituisce i campi TIME come timedelta Python.
    Esempio: timedelta(seconds=32400) → "09:00"
    Questa funzione fa la conversione.

    
    """
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    return f"{hours:02d}:{minutes:02d}"

def update_opening_hours_bulk(cur, days: list[dict]) -> int:
    """
    Aggiorna tutti i giorni passati in una sola chiamata.
    
    Ogni dict in `days` deve avere:
      - day_of_week: int (0-6)
      - open_time: str | None  es. "09:00"
      - close_time: str | None es. "23:00"
      - is_closed: bool
    
    Restituisce il numero di righe aggiornate.
    """
    updated = 0

    for day in days:
        cur.execute("""
            UPDATE opening_hours
            SET
                open_time  = %s,
                close_time = %s,
                is_closed  = %s
            WHERE day_of_week = %s
        """, (
            None if day.is_closed else day.open_time,
            None if day.is_closed else day.close_time,
            1 if day.is_closed else 0,
            day.day_of_week,
        ))
        updated += cur.rowcount

    return updated