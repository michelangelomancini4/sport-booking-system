import os
import mysql.connector
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

def get_conn():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "db_sportbooking"),
        port=int(os.getenv("DB_PORT", "3306")),
    )
def get_db() -> Generator:
    conn = get_conn()
    try:
        yield conn
    finally:
        conn.close()