from typing import Optional, Dict, Any, List


def fetch_all_customers(cur) -> List[Dict[str, Any]]:
    cur.execute("""
        SELECT id, full_name, phone, email
        FROM customers
        ORDER BY full_name ASC
    """)
    return cur.fetchall()


def fetch_customer_by_id(cur, customer_id: int) -> Optional[Dict[str, Any]]:
    cur.execute("""
        SELECT id, full_name, phone, email
        FROM customers
        WHERE id = %s
    """, (customer_id,))
    return cur.fetchone()


def fetch_customer_by_phone(cur, phone: str) -> Optional[Dict[str, Any]]:
    cur.execute("""
        SELECT id, full_name, phone, email
        FROM customers
        WHERE phone = %s
        LIMIT 1
    """, (phone,))
    return cur.fetchone()


def insert_customer(cur, full_name: str, phone=None, email=None) -> int:
    """Inserisce un cliente e restituisce l'id generato."""
    cur.execute("""
        INSERT INTO customers (full_name, phone, email)
        VALUES (%s, %s, %s)
    """, (full_name, phone, email))
    return cur.lastrowid