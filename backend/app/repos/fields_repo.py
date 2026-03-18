from typing import Optional, Dict, Any, List


def fetch_all_fields(cur, sport_id=None) -> List[Dict[str, Any]]:
    sql = """
        SELECT
          f.id,
          f.name,
          f.sport_id,
          sp.name AS sport_name,
          f.is_active
        FROM fields f
        JOIN sports sp ON sp.id = f.sport_id
        WHERE f.is_active = 1
    """
    params = []
    if sport_id is not None:
        sql += " AND f.sport_id = %s"
        params.append(sport_id)

    sql += " ORDER BY sp.name ASC, f.name ASC"

    cur.execute(sql, tuple(params))
    return cur.fetchall()