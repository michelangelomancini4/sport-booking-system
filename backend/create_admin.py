# backend/create_admin.py

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth.security import hash_password
from app.db import get_conn

username = "admin"
password = "admin123"

conn = get_conn()
cursor = conn.cursor()

cursor.execute(
    "INSERT INTO admin_users (username, password_hash) VALUES (%s, %s)",
    (username, hash_password(password))
)
conn.commit()
cursor.close()
conn.close()

print(f"Admin '{username}' creato con successo!")