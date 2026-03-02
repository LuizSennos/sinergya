"""
app/api/upload.py

Endpoint de upload de arquivos para o Supabase Storage.
Retorna URL pré-assinada com expiração de 1 hora.

Dependências:
  pip install supabase

Variáveis de ambiente necessárias:
  SUPABASE_URL
  SUPABASE_SERVICE_KEY   ← service role key (não a anon key)
  STORAGE_BUCKET         ← ex: "sinergya-media"
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
from app.models.group import GroupMember  # tabela de vínculo
from app.services.audit import log

from app.core.config import settings

router = APIRouter()

# ── Configuração Supabase ────────────────────────────────────────────────────

def get_supabase() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

BUCKET = settings.STORAGE_BUCKET

# ── Limites e tipos permitidos ───────────────────────────────────────────────

ALLOWED_MIME = {
    # Imagens
    "image/jpeg":    ("image", ".jpg"),
    "image/png":     ("image", ".png"),
    "image/webp":    ("image", ".webp"),
    "image/gif":     ("image", ".gif"),
    # Documentos
    "application/pdf":                                                  ("document", ".pdf"),
    "application/msword":                                               ("document", ".doc"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ("document", ".docx"),
    "application/vnd.ms-excel":                                         ("document", ".xls"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ("document", ".xlsx"),
    # Áudio
    "audio/webm":    ("audio", ".webm"),
    "audio/ogg":     ("audio", ".ogg"),
    "audio/mpeg":    ("audio", ".mp3"),
    "audio/mp4":     ("audio", ".m4a"),
    "audio/wav":     ("audio", ".wav"),
}

MAX_SIZE = {
    "image":    10 * 1024 * 1024,   # 10 MB
    "document": 20 * 1024 * 1024,   # 20 MB
    "audio":     5 * 1024 * 1024,   #  5 MB
}

SIGNED_URL_EXPIRY = 3600  # 1 hora em segundos

def validate_uuid(value: str, field: str = "id") -> str:
    """Garante que o valor é um UUID válido antes de bater no banco."""
    try:
        uuid_lib.UUID(str(value))
        return str(value)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=422, detail=f"'{field}' inválido: deve ser um UUID.")

# ── Helpers ──────────────────────────────────────────────────────────────────

# Magic bytes para detecção de MIME sem dependências de sistema
MAGIC_BYTES: list[tuple[bytes, int, str]] = [
    # Imagens
    (b"\xff\xd8\xff",             0, "image/jpeg"),
    (b"\x89PNG\r\n\x1a\n",      0, "image/png"),
    (b"RIFF",                        0, "image/webp"),   # confirma webp abaixo
    (b"GIF87a",                      0, "image/gif"),
    (b"GIF89a",                      0, "image/gif"),
    # PDF
    (b"%PDF-",                       0, "application/pdf"),
    # Office (ZIP-based: docx, xlsx)
    (b"PK\x03\x04",               0, "application/zip"),  # resolve abaixo pelo nome
    # Office legado
    (b"\xd0\xcf\x11\xe0",        0, "application/msword"),  # doc/xls legacy
    # Áudio
    (b"\x1aE\xdf\xa3",           0, "audio/webm"),
    (b"OggS",                        0, "audio/ogg"),
    (b"ID3",                         0, "audio/mpeg"),
    (b"\xff\xfb",                  0, "audio/mpeg"),
    (b"\xff\xf3",                  0, "audio/mpeg"),
    (b"\xff\xf2",                  0, "audio/mpeg"),
    (b"ftyp",                        4, "audio/mp4"),   # m4a
    (b"RIFF",                        0, "audio/wav"),   # wav — diferencia do webp abaixo
]

def detect_mime(content: bytes, filename: str) -> str:
    """Detecta MIME real pelos magic bytes do conteúdo."""
    header = content[:16]
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    # WEBP: RIFF....WEBP
    if header[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"

    # WAV: RIFF....WAVE
    if header[:4] == b"RIFF" and content[8:12] == b"WAVE":
        return "audio/wav"

    # ZIP-based Office — distingue pelo nome
    if header[:4] == b"PK\x03\x04":
        if ext == "docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if ext == "xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return "application/zip"  # não permitido

    # Legacy Office (doc/xls) — distingue pelo nome
    if header[:4] == b"\xd0\xcf\x11\xe0":
        if ext == "xls":
            return "application/vnd.ms-excel"
        return "application/msword"

    # Demais tipos: verifica por offset
    for magic, offset, mime in MAGIC_BYTES:
        if header[offset:offset + len(magic)] == magic:
            return mime

    return "application/octet-stream"  # desconhecido


def validate_mime(content: bytes, filename: str) -> tuple[str, str, str]:
    """
    Detecta o MIME real pelos magic bytes (sem dependências de sistema).
    Retorna (mime_type, attachment_type, extension).
    Levanta HTTPException 415 se não permitido.
    """
    mime = detect_mime(content, filename)
    if mime not in ALLOWED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Tipo de arquivo não permitido: {mime}"
        )
    attachment_type, ext = ALLOWED_MIME[mime]
    return mime, attachment_type, ext


def check_size(content: bytes, attachment_type: str):
    size = len(content)
    limit = MAX_SIZE[attachment_type]
    if size > limit:
        limit_mb = limit // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"Arquivo muito grande. Limite: {limit_mb} MB"
        )
    return size


def assert_linked(
    db: Session,
    current_user: User,
    patient_id: str,
):
    patient_id = validate_uuid(patient_id, "patient_id")
    if current_user.role == UserRole.admin:
        return
    # Paciente/responsável acessa o próprio registro
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        from app.models.patient import Patient
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id,
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        return
    # Profissional precisa de vínculo
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

def storage_path(patient_id: str, attachment_type: str, ext: str) -> str:
    """
    Gera o caminho no bucket:
    attachments/{patient_id}/{uuid}{ext}
    """
    return f"attachments/{patient_id}/{uuid.uuid4()}{ext}"


# ── Endpoint principal ───────────────────────────────────────────────────────

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    group: str = Form(...),          # 'assistencial' | 'tecnico'
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Faz upload de um arquivo para o Supabase Storage.

    Retorna:
      url           → URL pré-assinada (válida por 1h)
      attachment_type → 'image' | 'document' | 'audio'
      attachment_name → nome original do arquivo
      attachment_size → tamanho em bytes
      attachment_mime → MIME type real
      storage_path    → caminho no bucket (para deletar depois se necessário)
    """

    # 1. Verificar vínculo
    assert_linked(db, current_user, patient_id)

    # 2. Ler conteúdo
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Arquivo vazio.")

    # 3. Validar MIME pelo conteúdo real (não pelo nome)
    mime, attachment_type, ext = validate_mime(content, file.filename or "")

    # 4. Validar tamanho
    size = check_size(content, attachment_type)

    # 5. Gerar caminho e fazer upload
    supabase = get_supabase()
    path = storage_path(patient_id, attachment_type, ext)

    upload_response = supabase.storage.from_(BUCKET).upload(
        path=path,
        file=content,
        file_options={"content-type": mime, "upsert": False},
    )

    if hasattr(upload_response, "error") and upload_response.error:
        raise HTTPException(status_code=500, detail="Erro no upload para o storage.")

    # 6. Gerar URL pré-assinada
    signed = supabase.storage.from_(BUCKET).create_signed_url(
        path=path,
        expires_in=SIGNED_URL_EXPIRY,
    )

    signed_url = signed.get("signedURL") or signed.get("signedUrl")
    if not signed_url:
        raise HTTPException(status_code=500, detail="Erro ao gerar URL do arquivo.")

    # 7. Auditoria
    log(
        db,
        current_user,
        "upload_file",
        "message_attachment",
        None,
        f"{attachment_type}:{file.filename}:{patient_id}",
    )

    return {
        "url":             signed_url,
        "attachment_type": attachment_type,
        "attachment_name": file.filename,
        "attachment_size": size,
        "attachment_mime": mime,
        "storage_path":    path,   # guardar no frontend para refresh de URL depois
    }


@router.get("/signed-url")
async def get_signed_url(
    storage_path: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = supabase.storage.from_("sinergya-files").create_signed_url(
        storage_path, 3600  # 1 hora a partir de agora
    )
    return { "url": result["signedURL"] }