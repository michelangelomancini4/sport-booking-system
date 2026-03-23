# backend/app/repos/admin_repo.py

from app.db import get_conn


def get_by_username(username: str) -> dict | None:
    """
    Cerca un admin per username.
    Restituisce un dict con i dati o None se non esiste.
    """
    conn = get_conn()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, password_hash, is_active FROM admin_users WHERE username = %s",
            (username,)
        )
        return cursor.fetchone()  # None se non trovato
    finally:
        cursor.close()
        conn.close()