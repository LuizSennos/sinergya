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
        return
    # Paciente/responsável só acessa o próprio registro
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        patient = db.query(Patient).filter(
            Patient.id == patient_id,
            Patient.user_id == current_user.id
        ).first()
        if not patient:
            raise HTTPException(status_code=403, detail="Acesso negado.")
        return
    # Profissional precisa estar vinculado ao grupo
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
    """Retorna o registro de paciente vinculado ao usuário logado."""
    if current_user.role not in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=403, detail="Apenas pacientes e responsáveis.")
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Nenhum registro de paciente vinculado.")
    return patient

@router.get("/", response_model=List[PatientOut], summary="Listar pacientes")
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == UserRole.admin:
        return db.query(Patient).filter(Patient.is_active == True).all()
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        patients = db.query(Patient).filter(
            Patient.user_id == current_user.id,
            Patient.is_active == True
        ).all()
        return patients
    # Profissional: retorna só pacientes do seu grupo
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
    """Vincula uma conta de usuário (paciente/responsável) ao registro do paciente."""
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