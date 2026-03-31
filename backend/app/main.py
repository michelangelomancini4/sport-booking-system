import os
from dotenv import load_dotenv

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.bookings import router as bookings_router
from app.routers.customers import router as customers_router
from app.routers.slots import router as slots_router
from app.routers.fields import router as fields_router
from app.routers.auth import router as auth_router  
from app.routers.opening_hours import router as opening_hours_router

from app.schemas import HealthOut

load_dotenv()

# Legge le origini consentite dal .env, fallback su localhost per sviluppo
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [o.strip() for o in cors_origins.split(",")]

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthOut)
def health():
    return {"ok": True}

@app.get("/")
def root():
    return {"message": "API Sport Booking attiva"}

app.include_router(auth_router)      
app.include_router(slots_router)
app.include_router(customers_router)
app.include_router(bookings_router)
app.include_router(fields_router)
app.include_router(opening_hours_router)