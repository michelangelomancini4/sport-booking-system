from pydantic import BaseModel, Field


class BookingCreate(BaseModel):
    slot_id: int
    customer_id: int
    players_count: int = Field(default=1, ge=1)
    notes: str | None = None
