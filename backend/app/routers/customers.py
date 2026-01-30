from fastapi import APIRouter, Depends, HTTPException
from mysql.connector import IntegrityError

from app.db import get_db
from app.schemas import CustomersListOut, CustomerCreate, CustomerCreateOut, CustomerGetOut

router = APIRouter(prefix="/customers", tags=["customers"])

@router.get("", response_model=CustomersListOut)
def list_customers(db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT id, full_name, phone, email
            FROM customers
            ORDER BY full_name ASC
        """)
        rows = cur.fetchall()
        return {"rows": rows}
    finally:
        cur.close()


@router.get("/{customer_id}", response_model=CustomerGetOut)
def get_customer(customer_id: int, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT id, full_name, phone, email
            FROM customers
            WHERE id = %s
        """, (customer_id,))
        customer = cur.fetchone()
        if customer is None:
            raise HTTPException(status_code=404, detail="Cliente non trovato")
        return {"customer": customer}
    finally:
        cur.close()


@router.post("", response_model=CustomerCreateOut, status_code=201)
def create_customer(payload: CustomerCreate, db=Depends(get_db)):
    cur = db.cursor(dictionary=True)
    try:
        cur.execute("""
            INSERT INTO customers (full_name, phone, email)
            VALUES (%s, %s, %s)
        """, (payload.full_name, payload.phone, payload.email))
        db.commit()

        customer_id = cur.lastrowid
        cur.execute("""
            SELECT id, full_name, phone, email
            FROM customers
            WHERE id = %s
        """, (customer_id,))
        customer = cur.fetchone()

        return {"customer": customer}

    except IntegrityError:
        raise HTTPException(status_code=400, detail="Dati cliente non validi")
    finally:
        cur.close()
