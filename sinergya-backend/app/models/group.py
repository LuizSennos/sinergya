from sqlalchemy import Column, Enum as SAEnum, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base

class GroupType(str, enum.Enum):
    assistencial = 'assistencial'
    tecnico = 'tecnico'

class GroupMember(Base):
    __tablename__ = 'group_members'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    group_type = Column(SAEnum(GroupType), nullable=False)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient', back_populates='group_members')
    user = relationship('User')
