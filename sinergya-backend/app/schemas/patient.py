from pydantic import BaseModel
from datetime import date, datetime
import uuid
from typing import Optional


class PatientBase(BaseModel):
    name: Optional[str] = None
    specialties: Optional[str] = None
    birth_date: Optional[date] = None
    is_minor: Optional[bool] = None
    notes: Optional[str] = None
    legal_guardian_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class PatientCreate(PatientBase):
    name: str
    specialties: str


class PatientUpdate(PatientBase):
    pass


class PatientOut(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None

    name: str
    specialties: str
    birth_date: Optional[date] = None
    is_minor: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}