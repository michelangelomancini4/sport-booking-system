# backend/app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.auth.security import verify_password, create_access_token
from app.repos import admin_repo  # lo creiamo dopo
from app.schemas import Token      # lo aggiungiamo dopo

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Riceve username e password come form data.
    Restituisce un JWT se le credenziali sono corrette.
    """
    # 1. Cerca l'admin nel DB per username
    admin = admin_repo.get_by_username(form_data.username)

    # 2. Se non esiste O la password è sbagliata → stesso errore
    #    (non diciamo quale dei due è sbagliato — security by design)
    if not admin or not verify_password(form_data.password, admin["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Controlla che l'account sia attivo
    if not admin["is_active"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabilitato",
        )

    # 4. Crea e restituisce il token
    token = create_access_token(data={"sub": admin["username"]})
    return {"access_token": token, "token_type": "bearer"}