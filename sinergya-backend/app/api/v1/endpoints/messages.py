"""
app/api/messages.py

Endpoints de mensagens com suporte a anexos.
"""

import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBase
from typing import Optional
from supabase import create_client


import uuid as uuid_lib
from app.db.session import get_db
from app.core.security import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.message import Message, MessageContext, AttachmentType
from app.models.group import GroupMember
from app.services.audit import log

router = APIRouter()

BUCKET = os.environ.get("STORAGE_BUCKET", "sinergya-media")
SIGNED_URL_EXPIRY = 3600

def validate_uuid(value: str, field: str = "id") -> str:
    try:
        uuid_lib.UUID(str(value))
        return str(value)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail=f"'{field}' inválido: deve ser um UUID.")

PACIENTE_ROLES = {UserRole.paciente, UserRole.responsavel}
PROFISSIONAL_ROLES = {UserRole.profissional, UserRole.academico, UserRole.supervisor, UserRole.admin}

# ── Schemas ──────────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    patient_id:      str
    context:         MessageContext
    content:         Optional[str] = None
    attachment_url:  Optional[str] = None
    attachment_type: Optional[AttachmentType] = None
    attachment_name: Optional[str] = None
    attachment_size: Optional[int] = None
    attachment_mime:         Optional[str] = None
    attachment_storage_path: Optional[str] = None


class MessageOut(BaseModel):
    id:              str
    patient_id:      str
    author_id:       str
    author_name:     Optional[str]
    context:         str
    content:         Optional[str]
    attachment_url:  Optional[str]
    attachment_type: Optional[str]
    attachment_name: Optional[str]
    attachment_size: Optional[int]
    attachment_mime:         Optional[str]
    attachment_storage_path: Optional[str]
    created_at:              str

    class Config:
        from_attributes = True


# ── Helpers ──────────────────────────────────────────────────────────────────

def assert_linked(db: Session, current_user: User, patient_id: str):
    patient_id = validate_uuid(patient_id, "patient_id")

    if current_user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Administradores não acessam conteúdo clínico.")

    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        from app.models.patient import Patient
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id,
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        return

    linked = (
        db.query(GroupMember)
        .filter(
            GroupMember.patient_id == patient_id,
            GroupMember.user_id == current_user.id,
            GroupMember.is_active == True,
        )
        .first()
    )
    if not linked:
        raise HTTPException(status_code=403, detail="Sem vínculo com este paciente.")


def assert_can_read_tecnico(user: User):
    if user.role in PACIENTE_ROLES:
        raise HTTPException(status_code=403, detail="Acesso não permitido.")


def refresh_signed_url(storage_path: str) -> Optional[str]:
    try:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        supabase = create_client(url, key)
        signed = supabase.storage.from_(BUCKET).create_signed_url(
            path=storage_path,
            expires_in=SIGNED_URL_EXPIRY,
        )
        return signed.get("signedURL") or signed.get("signedUrl")
    except Exception:
        return None

def serialize_message(msg: Message) -> dict:
    url = msg.attachment_url
    # Renova URL se tiver storage_path salvo
    if msg.attachment_storage_path:
        refreshed = refresh_signed_url(msg.attachment_storage_path)
        if refreshed:
            url = refreshed
    return {
        "id":              str(msg.id),
        "patient_id":      str(msg.patient_id),
        "author_id":       str(msg.author_id),
        "author_name":     msg.author.name if msg.author else None,
        "context":         msg.context.value,
        "content":         msg.content,
        "attachment_url":  url,  # ← aqui, não msg.attachment_url
        "attachment_type": msg.attachment_type.value if msg.attachment_type else None,
        "attachment_name": msg.attachment_name,
        "attachment_size": msg.attachment_size,
        "attachment_mime":         msg.attachment_mime,
        "attachment_storage_path": getattr(msg, "attachment_storage_path", None),
        "created_at":              msg.created_at.isoformat(),
    }
# ── Endpoints ─────────────────────────────────────────────────────────────────
# IMPORTANTE: rotas estáticas SEMPRE antes das dinâmicas no FastAPI

@router.post("/", response_model=MessageOut)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.content or payload.content.strip() == "":
        payload.content = None

    if not payload.content and not payload.attachment_url:
        raise HTTPException(status_code=400, detail="Mensagem deve ter texto ou anexo.")

    assert_linked(db, current_user, payload.patient_id)

    if payload.context == MessageContext.tecnico:
        assert_can_read_tecnico(current_user)

    msg = Message(
        patient_id      = payload.patient_id,
        author_id       = current_user.id,
        context         = payload.context,
        content         = payload.content,
        attachment_url  = payload.attachment_url,
        attachment_type = payload.attachment_type,
        attachment_name = payload.attachment_name,
        attachment_size = payload.attachment_size,
        attachment_mime         = payload.attachment_mime,
        attachment_storage_path = payload.attachment_storage_path,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    action = "send_message_with_attachment" if payload.attachment_url else "send_message"
    log(db, current_user, action, "message", msg.id, payload.patient_id)

    return serialize_message(msg)


# ── Rotas estáticas (sem parâmetros dinâmicos) ────────────────────────────────

@router.get("/unread-counts")
def unread_counts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retorna contagem de mensagens não lidas por paciente para o usuário atual."""
    from sqlalchemy import func
    rows = db.query(
        Message.patient_id,
        func.count(Message.id).label("count")
    ).filter(
        Message.author_id != current_user.id,
        Message.is_read == False
    ).group_by(Message.patient_id).all()
    return {str(r.patient_id): r.count for r in rows}


# ── Rotas dinâmicas (com parâmetros) ─────────────────────────────────────────

@router.get("/{patient_id}/{context}")
def list_messages(
    patient_id: str,
    context: MessageContext,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_linked(db, current_user, patient_id)

    if context == MessageContext.tecnico:
        assert_can_read_tecnico(current_user)

    messages = (
        db.query(Message)
        .filter(
            Message.patient_id == patient_id,
            Message.context == context,
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return [serialize_message(m) for m in messages]


@router.patch("/{patient_id}/{context}/read")
def mark_as_read(
    patient_id: str,
    context: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marca todas as mensagens de outros autores como lidas."""
    db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.context == context,
        Message.author_id != current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"ok": True}


class MessageEdit(PydanticBase):
    content: str

@router.patch("/{message_id}/edit")
def edit_message(
    message_id: str,
    payload: MessageEdit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message_id = validate_uuid(message_id, "message_id")
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada.")
    assert_linked(db, current_user, str(msg.patient_id))
    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Conteúdo não pode ser vazio.")
    msg.content = payload.content.strip()
    db.commit()
    return serialize_message(msg)


@router.delete("/{message_id}")
def delete_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    message_id = validate_uuid(message_id, "message_id")
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Mensagem não encontrada.")
    assert_linked(db, current_user, str(msg.patient_id))
    db.delete(msg)
    db.commit()
    return {"ok": True}


@router.get("/refresh-url/{patient_id}/{message_id}")
def refresh_attachment_url(
    patient_id: str,
    message_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Renova a URL pré-assinada de um anexo."""
    assert_linked(db, current_user, patient_id)

    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg or not msg.attachment_url:
        raise HTTPException(status_code=404, detail="Mensagem ou anexo não encontrado.")

    new_url = refresh_signed_url(msg.attachment_url)
    if not new_url:
        raise HTTPException(status_code=500, detail="Erro ao renovar URL.")

    return {"url": new_url}