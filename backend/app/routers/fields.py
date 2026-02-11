from fastapi import APIRouter, Depends, Query
from app.db import get_db
from app.schemas import FieldsListOut

router = APIRouter(prefix="/fields", tags=["fields"])

@router.get("", response_model=FieldsListOut)
def list_fields(
    sport_id: int | None = Query(default=None),
    db=Depends(get_db),
):
    cur = db.cursor(dictionary=True)
    try:
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
        rows = cur.fetchall()
        return {"rows": rows}
    finally:
        cur.close()
