from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    course: str | None = None
    institution: str | None = None
    specialty: str | None = None
    council_number: str | None = None

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    is_active: bool
    lgpd_consent: bool
    course: str | None = None
    institution: str | None = None
    specialty: str | None = None
    created_at: datetime

    model_config = {'from_attributes': True}

class LGPDConsent(BaseModel):
    consent: bool
