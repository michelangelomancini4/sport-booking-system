from typing import Optional, Dict, Any
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
