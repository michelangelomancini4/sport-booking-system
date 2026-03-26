# backend/app/auth/security.py

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt
import os
from dotenv import load_dotenv

load_dotenv()

# Leggiamo dal .env — mai hardcodare segreti nel codice
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY mancante nel .env — l'app non può partire senza")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 ore — una giornata lavorativa


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Confronta la password in chiaro con l'hash salvato nel DB."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def hash_password(password: str) -> str:
    """Genera l'hash bcrypt di una password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict) -> str:
    """
    Crea un JWT firmato con i dati passati.
    Aggiunge automaticamente la scadenza.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Verifica e decodifica un JWT.
    Restituisce il payload se valido, None se scaduto o manomesso.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None