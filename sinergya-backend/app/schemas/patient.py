from pydantic import BaseModel
from datetime import date, datetime
import uuid

class PatientCreate(BaseModel):
    name: str
    specialties: str
    birth_date: date | None = None
    is_minor: bool = False
    notes: str | None = None
    legal_guardian_id: uuid.UUID | None = None

class PatientOut(BaseModel):
    id: uuid.UUID
    name: str
    specialties: str
    birth_date: date | None = None
    is_minor: bool
    is_active: bool
    created_at: datetime

    model_config = {'from_attributes': True}
