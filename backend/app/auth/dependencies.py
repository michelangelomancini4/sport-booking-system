from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.auth.security import decode_access_token

# Dice a FastAPI dove si trova l'endpoint di login
# Questo serve anche per la documentazione automatica in /docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_admin(token: str = Depends(oauth2_scheme)):
    """
    Dependency che protegge gli endpoint admin.
    FastAPI la chiama automaticamente prima di eseguire
    qualsiasi endpoint che la usa come Depends().
    """
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido o scaduto",
            headers={"WWW-Authenticate": "Bearer"},
        )

    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token malformato",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return username  # restituisce lo username dell'admin autenticato