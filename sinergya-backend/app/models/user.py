from sqlalchemy import Column, String, Boolean, Enum as SAEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base

class UserRole(str, enum.Enum):
    admin = 'admin'
    academico = 'academico'
    supervisor = 'supervisor'
    profissional = 'profissional'
    paciente = 'paciente'
    responsavel = 'responsavel'

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    lgpd_consent = Column(Boolean, default=False)
    lgpd_consent_at = Column(DateTime, nullable=True)
    course = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    council_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    wallpaper_preference = Column(String, default="botanical", nullable=True)

    messages = relationship('Message', back_populates='author', foreign_keys='Message.author_id')
    diary_entries = relationship('DiaryEntry', back_populates='author')
    tasks = relationship('Task', back_populates='created_by')
    audit_logs = relationship('AuditLog', back_populates='user')
