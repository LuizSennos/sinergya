from sqlalchemy import Column, String, Text, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class Patient(Base):
    __tablename__ = 'patients'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=True)
    is_minor = Column(Boolean, default=False)
    specialties = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    legal_guardian_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)

    legal_guardian = relationship('User', foreign_keys=[legal_guardian_id])
    group_members = relationship('GroupMember', back_populates='patient')
    diary_entries = relationship('DiaryEntry', back_populates='patient')
    tasks = relationship('Task', back_populates='patient')
