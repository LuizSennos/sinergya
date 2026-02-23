from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.message import MessageContext

class MessageCreate(BaseModel):
    patient_id: UUID
    context: MessageContext
    content: str

class MessageOut(BaseModel):
    id: UUID
    patient_id: UUID
    author_id: UUID
    context: MessageContext
    content: str
    created_at: datetime
    author_name: str | None = None
    author_role: str | None = None

    model_config = {"from_attributes": True}