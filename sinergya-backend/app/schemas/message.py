from pydantic import BaseModel
from datetime import datetime
import uuid

class MessageCreate(BaseModel):
    patient_id: uuid.UUID
    context: str
    content: str

class MessageOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    author_id: uuid.UUID
    context: str
    content: str
    created_at: datetime

    model_config = {'from_attributes': True}
