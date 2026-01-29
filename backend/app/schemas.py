from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

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

    starts_at: datetime
    ends_at: datetime

    players_count: int
    notes: Optional[str] = None

    created_at: datetime


class BookingsListOut(BaseModel):
    rows: List[BookingOut]

# CUSTOMER SECTION

class CustomerOut(BaseModel):
    id: int
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class CustomersListOut(BaseModel):
    rows: List[CustomerOut]
