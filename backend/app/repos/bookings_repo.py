from typing import Optional, Dict, Any, List

BOOKING_FULL_SELECT = """
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
    WHERE b.id_booking = %s
"""


def fetch_booking_full(cur, booking_id: int) -> Optional[Dict[str, Any]]:
    cur.execute(BOOKING_FULL_SELECT, (booking_id,))
    return cur.fetchone()


def fetch_bookings_list(
    cur,
    day=None,
    field_id=None,
    customer_id=None,
    status=None,
    q=None,
) -> List[Dict[str, Any]]:
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

    if status is not None and status != "":
        where.append("b.status = %s")
        params.append(status)

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
    return cur.fetchall()


def insert_booking(cur, slot_id: int, customer_id: int, players_count: int, notes=None) -> int:
    """Inserisce una booking e restituisce l'id generato."""
    cur.execute("""
        INSERT INTO bookings (slot_id, customer_id, players_count, notes)
        VALUES (%s, %s, %s, %s)
    """, (slot_id, customer_id, players_count, notes))
    return cur.lastrowid


def update_booking(cur, booking_id: int, fields: dict) -> int:
    """
    Aggiorna i campi passati in fields (es. {"players_count": 2, "notes": "..."}).
    Restituisce il numero di righe aggiornate.
    """
    set_clauses = [f"{k} = %s" for k in fields]
    params = list(fields.values()) + [booking_id]
    sql = "UPDATE bookings SET " + ", ".join(set_clauses) + " WHERE id_booking = %s"
    cur.execute(sql, tuple(params))
    return cur.rowcount


def cancel_booking(cur, booking_id: int) -> int:
    """
    Archivia la booking in bookings_history e la elimina da bookings.
    Restituisce il numero di righe eliminate (0 se non esiste).
    """
    # 1) prendi i dati della booking prima di eliminarla
    cur.execute("""
        SELECT * FROM bookings WHERE id_booking = %s
    """, (booking_id,))
    booking = cur.fetchone()

    if booking is None:
        return 0

    # 2) inserisci in bookings_history
    cur.execute("""
        INSERT INTO bookings_history
            (booking_id, slot_id, customer_id, players_count, notes, status, created_at)
        VALUES (%s, %s, %s, %s, %s, 'cancelled', %s)
    """, (
        booking["id_booking"],
        booking["slot_id"],
        booking["customer_id"],
        booking["players_count"],
        booking["notes"],
        booking["created_at"],
    ))

    # 3) elimina fisicamente da bookings
    cur.execute("""
        DELETE FROM bookings WHERE id_booking = %s
    """, (booking_id,))

    return cur.rowcount


def booking_exists(cur, booking_id: int) -> bool:
    cur.execute("SELECT 1 FROM bookings WHERE id_booking = %s", (booking_id,))
    return cur.fetchone() is not None