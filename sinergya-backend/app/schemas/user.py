from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    specialty: Optional[str] = None
    council_number: Optional[str] = None
    course: Optional[str] = None
    institution: Optional[str] = None

class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    is_active: bool
    lgpd_consent: bool
    specialty: Optional[str] = None
    council_number: Optional[str] = None
    course: Optional[str] = None
    institution: Optional[str] = None
    created_at: datetime
    wallpaper_preference: Optional[str] = "botanical"

    model_config = {"from_attributes": True}

class LGPDConsent(BaseModel):
    consent: bool