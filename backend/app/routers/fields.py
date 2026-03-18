from fastapi import APIRouter, Depends, Query
from app.db import get_db
from app.schemas import FieldsListOut
from app.repos.fields_repo import fetch_all_fields

router = APIRouter(prefix="/fields", tags=["fields"])


@router.get("", response_model=FieldsListOut)
def list_fields(
    sport_id: int | None = Query(default=None),
    db=Depends(get_db),
):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_all_fields(cur, sport_id=sport_id)
        return {"rows": rows}
    finally:
        cur.close()