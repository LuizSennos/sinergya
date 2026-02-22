from pydantic import BaseModel
from datetime import datetime
import uuid

class TaskCreate(BaseModel):
    patient_id: uuid.UUID
    title: str
    description: str | None = None

class TaskDone(BaseModel):
    is_done: bool

class TaskOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    created_by_id: uuid.UUID
    title: str
    description: str | None = None
    is_done: bool
    done_at: datetime | None = None
    created_at: datetime

    model_config = {'from_attributes': True}
