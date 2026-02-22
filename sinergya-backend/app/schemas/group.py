from pydantic import BaseModel
import uuid

class GroupMemberCreate(BaseModel):
    patient_id: uuid.UUID
    user_id: uuid.UUID
    group_type: str

class GroupMemberOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    user_id: uuid.UUID
    group_type: str
    is_active: bool

    model_config = {'from_attributes': True}
