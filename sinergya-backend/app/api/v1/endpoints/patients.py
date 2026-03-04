from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.patient import Patient
from app.models.group import GroupMember
from app.models.user import User, UserRole
from app.schemas.patient import PatientCreate, PatientOut, PatientUpdate, PatientBase
from app.core.security import get_current_user
from app.services.audit import log
import uuid

router = APIRouter()

def check_patient_access(patient_id: str, current_user: User, db: Session):
    """Verifica se o usuário tem acesso ao paciente."""
    if current_user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Administradores não acessam dados clínicos.")
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        return
    member = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == current_user.id,
        GroupMember.is_active == True
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Sem acesso a este paciente.")

@router.get("/me", response_model=PatientOut, summary="Meu registro de paciente")
def get_my_patient(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=403, detail="Apenas pacientes e responsáveis.")
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Nenhum registro de paciente vinculado.")
    return patient

# ── Admin list — deve ficar ANTES de /{patient_id} para não ser capturado como UUID ──
@router.get("/admin-list", summary="Listar pacientes (admin)")
def list_patients_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista pacientes para o painel admin. Retorna apenas campos operacionais, sem dados clínicos (LGPD)."""
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores.")
    patients = db.query(Patient).order_by(Patient.created_at.desc()).all()
    return [
        {
            "id":         str(p.id),
            "name":       p.name,
            "user_id":    str(p.user_id) if p.user_id else None,
            "is_active":  p.is_active,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in patients
    ]

@router.get("/", response_model=List[PatientOut], summary="Listar pacientes")
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Administradores não acessam dados clínicos.")
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        return db.query(Patient).filter(
            Patient.user_id == current_user.id,
            Patient.is_active == True
        ).all()
    member_patient_ids = db.query(GroupMember.patient_id).filter(
        GroupMember.user_id == current_user.id,
        GroupMember.is_active == True
    ).all()
    ids = [m[0] for m in member_patient_ids]
    return db.query(Patient).filter(Patient.id.in_(ids), Patient.is_active == True).all()

@router.get("/{patient_id}", response_model=PatientOut, summary="Detalhe do paciente")
def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_patient_access(patient_id, current_user, db)
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado.")
    return patient

@router.post("/", response_model=PatientOut, summary="Criar paciente")
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Apenas administradores podem criar pacientes.")
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    log(db, current_user, "create_patient", "patient", patient.id, patient.name)
    return patient

@router.patch("/{patient_id}/bind-user", response_model=PatientOut, summary="Vincular usuário ao paciente")
def bind_user_to_patient(
    patient_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Apenas administradores.")
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    if user.role not in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=400, detail="Usuário precisa ter role paciente ou responsavel.")
    patient.user_id = user.id
    db.commit()
    db.refresh(patient)
    log(db, current_user, "bind_user_patient", "patient", patient.id, f"user={user.email}")
    return patient