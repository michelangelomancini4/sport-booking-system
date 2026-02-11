from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

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
    phone: Optional[str] = None
    email: Optional[str] = None

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

