from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.diary import DiaryEntry
from app.models.group import GroupMember
from app.models.user import User, UserRole
from app.schemas.diary import DiaryEntryCreate, DiaryEntryOut
from app.core.security import get_current_user

router = APIRouter()

@router.get('/{patient_id}', response_model=list[DiaryEntryOut])
def get_diary(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.admin, UserRole.paciente, UserRole.responsavel]:
        member = db.query(GroupMember).filter(GroupMember.patient_id == patient_id, GroupMember.user_id == current_user.id, GroupMember.is_active == True).first()
        if not member:
            raise HTTPException(status_code=403, detail='Sem acesso ao diario deste paciente.')
    return db.query(DiaryEntry).filter(DiaryEntry.patient_id == patient_id).order_by(DiaryEntry.created_at.desc()).all()

@router.post('/', response_model=DiaryEntryOut)
def create_entry(payload: DiaryEntryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=403, detail='Apenas o paciente ou responsavel pode escrever no diario.')
    entry = DiaryEntry(patient_id=payload.patient_id, author_id=current_user.id, content=payload.content)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
