from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.patient import Patient
from app.models.group import GroupMember
from app.models.user import User, UserRole
from app.schemas.patient import PatientCreate, PatientOut
from app.core.security import get_current_user, require_roles

router = APIRouter()

@router.get('/', response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.admin:
        return db.query(Patient).filter(Patient.is_active == True).all()
    linked_ids = db.query(GroupMember.patient_id).filter(GroupMember.user_id == current_user.id, GroupMember.is_active == True).distinct().all()
    ids = [r[0] for r in linked_ids]
    return db.query(Patient).filter(Patient.id.in_(ids), Patient.is_active == True).all()

@router.get('/{patient_id}', response_model=PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente nao encontrado.')
    return patient

@router.post('/', response_model=PatientOut, dependencies=[Depends(require_roles(UserRole.admin, UserRole.supervisor, UserRole.profissional, UserRole.academico))])
def create_patient(payload: PatientCreate, db: Session = Depends(get_db)):
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
