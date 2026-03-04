"""
app/api/upload.py
"""

import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from supabase import create_client, Client

import uuid as uuid_lib
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.group import GroupMember
from app.services.audit import log
from app.core.config import settings

router = APIRouter()

# ── Supabase ─────────────────────────────────────────────────────────────────

def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

BUCKET = settings.STORAGE_BUCKET
SIGNED_URL_EXPIRY = 3600

# ── Tipos e limites ───────────────────────────────────────────────────────────

ALLOWED_MIME = {
    "image/jpeg":    ("image", ".jpg"),
    "image/png":     ("image", ".png"),
    "image/webp":    ("image", ".webp"),
    "image/gif":     ("image", ".gif"),
    "application/pdf": ("document", ".pdf"),
    "application/msword": ("document", ".doc"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ("document", ".docx"),
    "application/vnd.ms-excel": ("document", ".xls"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ("document", ".xlsx"),
    "audio/webm": ("audio", ".webm"),
    "audio/ogg":  ("audio", ".ogg"),
    "audio/mpeg": ("audio", ".mp3"),
    "audio/mp4":  ("audio", ".m4a"),
    "audio/wav":  ("audio", ".wav"),
}

MAX_SIZE = {
    "image":    10 * 1024 * 1024,
    "document": 20 * 1024 * 1024,
    "audio":     5 * 1024 * 1024,
}

# ── Magic bytes ───────────────────────────────────────────────────────────────

def detect_mime(content: bytes, filename: str) -> str:
    header = content[:16]
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if header[:4] == b"RIFF" and content[8:12] == b"WEBP": return "image/webp"
    if header[:4] == b"RIFF" and content[8:12] == b"WAVE": return "audio/wav"
    if header[:4] == b"PK\x03\x04":
        if ext == "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if ext == "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return "application/zip"
    if header[:4] == b"\xd0\xcf\x11\xe0":
        return "application/vnd.ms-excel" if ext == "xls" else "application/msword"
    checks = [
        (b"\xff\xd8\xff", 0, "image/jpeg"),
        (b"\x89PNG\r\n\x1a\n", 0, "image/png"),
        (b"GIF87a", 0, "image/gif"), (b"GIF89a", 0, "image/gif"),
        (b"%PDF-", 0, "application/pdf"),
        (b"\x1aE\xdf\xa3", 0, "audio/webm"),
        (b"OggS", 0, "audio/ogg"),
        (b"ID3", 0, "audio/mpeg"),
        (b"\xff\xfb", 0, "audio/mpeg"), (b"\xff\xf3", 0, "audio/mpeg"),
        (b"ftyp", 4, "audio/mp4"),
    ]
    for magic, offset, mime in checks:
        if header[offset:offset + len(magic)] == magic:
            return mime
    return "application/octet-stream"

def validate_mime(content: bytes, filename: str) -> tuple[str, str, str]:
    mime = detect_mime(content, filename)
    if mime not in ALLOWED_MIME:
        raise HTTPException(status_code=415, detail=f"Tipo não permitido: {mime}")
    attachment_type, ext = ALLOWED_MIME[mime]
    return mime, attachment_type, ext

def check_size(content: bytes, attachment_type: str) -> int:
    size = len(content)
    limit = MAX_SIZE[attachment_type]
    if size > limit:
        raise HTTPException(status_code=413, detail=f"Arquivo muito grande. Limite: {limit // (1024*1024)} MB")
    return size

def validate_uuid(value: str, field: str = "id") -> str:
    try:
        uuid_lib.UUID(str(value))
        return str(value)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail=f"'{field}' inválido.")

# ── Autorização ───────────────────────────────────────────────────────────────

def assert_linked(db: Session, current_user: User, patient_id: str):
    """Verifica se o usuário tem acesso ao paciente para upload/download."""
    patient_id = validate_uuid(patient_id, "patient_id")
    # Admin pode fazer upload (criação de paciente, vínculo operacional)
    if current_user.role == UserRole.admin:
        return
    # Paciente/responsável acessa o próprio registro
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id,
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        return
    # Profissional precisa de vínculo ativo
    linked = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == current_user.id,
        GroupMember.is_active == True,
    ).first()
    if not linked:
        raise HTTPException(status_code=403, detail="Sem vínculo com este paciente.")

def storage_path(patient_id: str, attachment_type: str, ext: str) -> str:
    return f"attachments/{patient_id}/{uuid.uuid4()}{ext}"

# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    group: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assert_linked(db, current_user, patient_id)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    mime, attachment_type, ext = validate_mime(content, file.filename or "")
    size = check_size(content, attachment_type)

    supabase = get_supabase()
    path = storage_path(patient_id, attachment_type, ext)

    upload_response = supabase.storage.from_(BUCKET).upload(
        path=path,
        file=content,
        file_options={"content-type": mime, "upsert": False},
    )
    if hasattr(upload_response, "error") and upload_response.error:
        raise HTTPException(status_code=500, detail="Erro no upload para o storage.")

    signed = supabase.storage.from_(BUCKET).create_signed_url(
        path=path,
        expires_in=SIGNED_URL_EXPIRY,
    )
    signed_url = signed.get("signedURL") or signed.get("signedUrl")
    if not signed_url:
        raise HTTPException(status_code=500, detail="Erro ao gerar URL.")

    log(db, current_user, "upload_file", "message_attachment", None,
        f"{attachment_type}:{file.filename}:{patient_id}")

    return {
        "url":             signed_url,
        "attachment_type": attachment_type,
        "attachment_name": file.filename,
        "attachment_size": size,
        "attachment_mime": mime,
        "storage_path":    path,
    }

# ── Renovar URL pré-assinada ──────────────────────────────────────────────────

@router.get("/signed-url")
async def get_signed_url(
    storage_path: str,
    patient_id: str,          # obrigatório — para verificar vínculo
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Renova a URL pré-assinada de um anexo já existente.
    Requer patient_id para verificar vínculo antes de conceder acesso.
    """
    # Valida que o path pertence ao patient_id declarado (evita path traversal)
    if not storage_path.startswith(f"attachments/{patient_id}/"):
        raise HTTPException(status_code=403, detail="Path não pertence ao paciente informado.")

    # Verifica vínculo
    assert_linked(db, current_user, patient_id)

    supabase = get_supabase()
    result = supabase.storage.from_(BUCKET).create_signed_url(
        storage_path, SIGNED_URL_EXPIRY
    )
    signed_url = result.get("signedURL") or result.get("signedUrl")
    if not signed_url:
        raise HTTPException(status_code=500, detail="Erro ao renovar URL.")

    return {"url": signed_url}