from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, LGPDConsent
from app.core.security import hash_password, get_current_user, require_roles

router = APIRouter()

@router.post('/', response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail='Email ja cadastrado.')
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        course=payload.course,
        institution=payload.institution,
        specialty=payload.specialty,
        council_number=payload.council_number,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get('/me', response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post('/lgpd-consent')
def lgpd_consent(payload: LGPDConsent, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.lgpd_consent = payload.consent
    current_user.lgpd_consent_at = datetime.utcnow()
    db.commit()
    return {'ok': True}

@router.get('/', response_model=list[UserOut], dependencies=[Depends(require_roles(UserRole.admin))])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()

@router.patch('/{user_id}/activate', dependencies=[Depends(require_roles(UserRole.admin))])
def toggle_active(user_id: str, active: bool, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='Usuario nao encontrado.')
    user.is_active = active
    db.commit()
    return {'ok': True}
