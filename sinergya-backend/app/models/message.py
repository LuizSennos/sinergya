from sqlalchemy import Column, Text, ForeignKey, DateTime, Enum as SAEnum, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base


class MessageContext(str, enum.Enum):
    assistencial = "assistencial"
    tecnico = "tecnico"


class AttachmentType(str, enum.Enum):
    image = "image"
    document = "document"
    audio = "audio"


class Message(Base):
    __tablename__ = "messages"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id    = Column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False)
    author_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    context       = Column(SAEnum(MessageContext), nullable=False)

    # Conteúdo (texto e/ou anexo — pelo menos um obrigatório)
    content           = Column(Text, nullable=True)
    attachment_url    = Column(Text, nullable=True)
    attachment_type   = Column(SAEnum(AttachmentType), nullable=True)
    attachment_name   = Column(Text, nullable=True)
    attachment_size   = Column(Integer, nullable=True)   # bytes
    attachment_mime         = Column(Text, nullable=True)
    attachment_storage_path = Column(Text, nullable=True)  # path permanente no bucket para renovar URL
    is_read = Column(Boolean, default=False)  # ← adiciona

    created_at    = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient")
    author  = relationship("User", back_populates="messages", foreign_keys=[author_id])