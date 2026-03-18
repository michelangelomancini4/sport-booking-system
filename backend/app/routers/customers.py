from fastapi import APIRouter, Depends, HTTPException
from mysql.connector import IntegrityError

from app.db import get_db
from app.schemas import CustomersListOut, CustomerCreate, CustomerCreateOut, CustomerGetOut
from app.repos.customers_repo import (
    fetch_all_customers,
    fetch_customer_by_id,
    fetch_customer_by_phone,
    insert_customer,
)

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomersListOut)
def list_customers(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        rows = fetch_all_customers(cur)
        return {"rows": rows}
    finally:
        cur.close()


@router.get("/by-phone/{phone}")
def get_customer_by_phone(phone: str, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        customer = fetch_customer_by_phone(cur, phone)
        return {"customer": customer}
    finally:
        cur.close()


@router.get("/{customer_id}", response_model=CustomerGetOut)
def get_customer(customer_id: int, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        customer = fetch_customer_by_id(cur, customer_id)
        if customer is None:
            raise HTTPException(status_code=404, detail="Cliente non trovato")
        return {"customer": customer}
    finally:
        cur.close()


@router.post("", response_model=CustomerCreateOut, status_code=201)
def create_customer(payload: CustomerCreate, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        customer_id = insert_customer(
            cur,
            full_name=payload.full_name,
            phone=payload.phone,
            email=payload.email,
        )
        db.commit()
        customer = fetch_customer_by_id(cur, customer_id)
        return {"customer": customer}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Dati cliente non validi")
    except Exception:
        db.rollback()
        raise
    finally:
        cur.close()