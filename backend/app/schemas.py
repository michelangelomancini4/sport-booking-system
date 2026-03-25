from pydantic import BaseModel, Field, field_validator
import re
from typing import List, Optional
from datetime import datetime , time , date

# health test
class HealthOut(BaseModel):
    ok: bool


# BOOKING SECTION
class BookingCreate(BaseModel):
    slot_id: int
    customer_id: int
    players_count: int = Field(default=1, ge=1)
    notes: str | None = None

class BookingOut(BaseModel):
    id_booking: int
    slot_id: int
    customer_id: int

    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None

    field_name: str
    field_id: int
    sport_id: int
    sport_name: str

    starts_at: datetime
    ends_at: datetime

    players_count: int
    notes: Optional[str] = None

    status: str
    created_at: datetime




class BookingsListOut(BaseModel):
    rows: List[BookingOut]

class BookingCreateOut(BaseModel):
    booking: BookingOut

class DeleteBookingOut(BaseModel):
    ok: bool
    deleted_id: int


class BookingUpdate(BaseModel):
    players_count: Optional[int] = Field(default=None, ge=1, le=50)
    notes: Optional[str] = None

class BookingHistoryOut(BaseModel):
    id_booking_history: int
    booking_id: int
    slot_id: int
    customer_id: int

    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None

    field_name: str
    field_id: int
    sport_id: int
    sport_name: str

    starts_at: datetime
    ends_at: datetime

    players_count: int
    notes: Optional[str] = None

    status: str
    created_at: datetime
    archived_at: datetime

class BookingsHistoryListOut(BaseModel):
    rows: List[BookingHistoryOut]

class PublicBookingCreate(BaseModel):
    slot_id: int
    full_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=6, max_length=30)
    email: Optional[str] = None
    players_count: int = Field(default=1, ge=1)
    notes: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        cleaned = re.sub(r"[\s\-]", "", v)
        if not re.match(r"^\+?\d{6,20}$", cleaned):
            raise ValueError("Numero di telefono non valido")
        return cleaned  
# CUSTOMER SECTION

class CustomerOut(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class CustomersListOut(BaseModel):
    rows: List[CustomerOut]

class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, min_length=6, max_length=30)
    email: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        # rimuove spazi e trattini per confronto
        cleaned = re.sub(r"[\s\-]", "", v)
        if not re.match(r"^\+?\d{6,20}$", cleaned):
            raise ValueError("Numero di telefono non valido")
        return v

class CustomerCreateOut(BaseModel):
    customer: CustomerOut
class CustomerGetOut(BaseModel):
    customer: CustomerOut

# SLOT SECTION

class SlotOut(BaseModel):
    id_slots: int
    field_id: int
    field_name: str
    starts_at: datetime
    ends_at: datetime
    price_cents: int
    is_active: int  
    sport_id: int
    sport_name: str

class SlotsListOut(BaseModel):
    rows: List[SlotOut]

class FreeSlotsOut(BaseModel):
    rows: List[SlotOut]
    day: str

class SlotsGenerateIn(BaseModel):
    sport_id: int
    date_from: date
    date_to: date

    start_time: time = Field(default=time(10, 0))
    end_time: time = Field(default=time(23, 0))

    slot_minutes: int = Field(default=60, ge=15, le=240)

    # opzionale: se non lo passi, lo deduciamo da sport_id (Padel 30€, Calcetto 50€)
    price_cents: Optional[int] = Field(default=None, ge=0)


class SlotsGenerateOut(BaseModel):
    sport_id: int
    date_from: date
    date_to: date
    start_time: time
    end_time: time
    slot_minutes: int
    price_cents: int

    fields_count: int
    created: int
    skipped: int

# FIELDS
class FieldOut(BaseModel):
    id: int
    name: str
    sport_id: int
    sport_name: str
    is_active: int

class FieldsListOut(BaseModel):
    rows: List[FieldOut]

# --- Auth ---

class Token(BaseModel):
    access_token: str
    token_type: str
# OPENING HOURS

class OpeningHourOut(BaseModel):
    id: int
    day_of_week: int
    day_name: str
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    is_closed: int

class OpeningHoursListOut(BaseModel):
    rows: List[OpeningHourOut]

class OpeningHourTodayOut(BaseModel):
    day_of_week: int
    day_name: str
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    is_closed: int