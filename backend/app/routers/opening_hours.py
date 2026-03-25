from fastapi import APIRouter, Depends, HTTPException

from app.db import get_db
from app.schemas import OpeningHoursListOut, OpeningHourTodayOut
from app.repos.opening_hours_repo import (
    fetch_all_opening_hours,
    fetch_today_opening_hours,
)

router = APIRouter(prefix="/opening-hours", tags=["opening-hours"])


@router.get("", response_model=OpeningHoursListOut)
def list_opening_hours(db=Depends(get_db)):
    
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_all_opening_hours(cur)
        return {"rows": rows}
    finally:
        cur.close()


@router.get("/today", response_model=OpeningHourTodayOut)
def today_opening_hours(db=Depends(get_db)):
   
    cur = db.cursor(dictionary=True)
    try:
        row = fetch_today_opening_hours(cur)
        if row is None:
            
            raise HTTPException(
                status_code=404,
                detail="Orari di oggi non trovati nel database"
            )
        return row
    finally:
        cur.close()