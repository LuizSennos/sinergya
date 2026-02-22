from pydantic import BaseModel
from datetime import datetime
import uuid

class DiaryEntryCreate(BaseModel):
    patient_id: uuid.UUID
    content: str

class DiaryEntryOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    author_id: uuid.UUID
    content: str
    created_at: datetime

    model_config = {'from_attributes': True}
