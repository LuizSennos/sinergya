from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.group import GroupMember, GroupType
from app.models.user import User, UserRole
from app.schemas.group import GroupMemberCreate, GroupMemberOut
from app.core.security import get_current_user, require_roles

router = APIRouter()

def check_group_access(patient_id: str, current_user: User, db: Session):
    """Admin não acessa grupos (LGPD). Profissional precisa de vínculo."""
    if current_user.role == UserRole.admin:
        raise HTTPException(status_code=403, detail="Administradores não acessam dados clínicos.")
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=403, detail="Acesso negado.")
    member = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == current_user.id,
        GroupMember.is_active == True
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Sem acesso a este grupo.")

@router.post('/', response_model=list[GroupMemberOut], dependencies=[Depends(require_roles(UserRole.supervisor))])
def bind_user_to_patient(
    payload: GroupMemberCreate,
    db: Session = Depends(get_db)
):
    """Apenas supervisores podem vincular profissionais a pacientes."""
    members = []
    for group_type in [GroupType.assistencial, GroupType.tecnico]:
        existing = db.query(GroupMember).filter(
            GroupMember.patient_id == payload.patient_id,
            GroupMember.user_id == payload.user_id,
            GroupMember.group_type == group_type
        ).first()
        if existing:
            if not existing.is_active:
                existing.is_active = True
                db.commit()
                db.refresh(existing)
            members.append(existing)
        else:
            m = GroupMember(
                patient_id=payload.patient_id,
                user_id=payload.user_id,
                group_type=group_type
            )
            db.add(m)
            db.commit()
            db.refresh(m)
            members.append(m)
    return members

@router.get('/{patient_id}', response_model=list[GroupMemberOut])
def get_group_members(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_group_access(patient_id, current_user, db)
    return db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.is_active == True
    ).all()

@router.delete('/{patient_id}/{user_id}', dependencies=[Depends(require_roles(UserRole.supervisor))])
def remove_member(
    patient_id: str,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Apenas supervisores podem remover profissionais de grupos."""
    members = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == user_id
    ).all()
    for m in members:
        m.is_active = False
    db.commit()
    return {'ok': True}