from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.group import GroupMember, GroupType
from app.models.user import User, UserRole
from app.schemas.group import GroupMemberCreate, GroupMemberOut
from app.core.security import get_current_user, require_roles

router = APIRouter()

@router.post('/', response_model=list[GroupMemberOut], dependencies=[Depends(require_roles(UserRole.admin, UserRole.supervisor))])
def bind_user_to_patient(payload: GroupMemberCreate, db: Session = Depends(get_db)):
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
            m = GroupMember(patient_id=payload.patient_id, user_id=payload.user_id, group_type=group_type)
            db.add(m)
            db.commit()
            db.refresh(m)
            members.append(m)
    return members

@router.get('/{patient_id}', response_model=list[GroupMemberOut])
def get_group_members(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(GroupMember).filter(GroupMember.patient_id == patient_id, GroupMember.is_active == True).all()

@router.delete('/{patient_id}/{user_id}', dependencies=[Depends(require_roles(UserRole.admin, UserRole.supervisor))])
def remove_member(patient_id: str, user_id: str, db: Session = Depends(get_db)):
    members = db.query(GroupMember).filter(GroupMember.patient_id == patient_id, GroupMember.user_id == user_id).all()
    for m in members:
        m.is_active = False
    db.commit()
    return {'ok': True}
