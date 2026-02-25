import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Date, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.models.mixins import TimestampMixin

class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    specialties = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)   # novo campo
    is_minor = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)        # novo campo
    legal_guardian_id = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=True)  # novo campo
    is_active = Column(Boolean, default=True)

    # Vínculo direto com usuário paciente/responsável
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    # Relacionamentos
    user = relationship("User", foreign_keys=[user_id], backref="patient_record")
    messages = relationship("Message", back_populates="patient", cascade="all, delete-orphan")
    diary_entries = relationship("DiaryEntry", back_populates="patient", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="patient", cascade="all, delete-orphan")
    group_members = relationship("GroupMember", back_populates="patient", cascade="all, delete-orphan")
