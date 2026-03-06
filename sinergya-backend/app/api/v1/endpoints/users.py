from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserOut, LGPDConsent
from app.core.security import hash_password, get_current_user, require_roles, verify_password
from app.services.audit import log
from pydantic import BaseModel as PydanticBase

router = APIRouter()


class UpdateProfile(PydanticBase):
    name: str


class UpdatePassword(PydanticBase):
    current_password: str
    new_password: str


@router.post('/', response_model=UserOut, dependencies=[Depends(require_roles(UserRole.admin))])
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
    log(db, current_user, "create_user", "user", user.id, user.email)
    return user


# ── Rotas estáticas /me ANTES das dinâmicas /{user_id} ───────────────────────

@router.get('/me', response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me/preferences")
def update_preferences(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if "wallpaper" in payload:
        current_user.wallpaper_preference = payload["wallpaper"]
        db.commit()
    return {"ok": True}


@router.patch("/me/profile")
def update_profile(
    payload: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Nome não pode ser vazio.")
    current_user.name = payload.name.strip()
    db.commit()
    log(db, current_user, "update_profile", "user", current_user.id, current_user.email)
    return {"ok": True, "name": current_user.name}


@router.patch("/me/password")
def update_password(
    payload: UpdatePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="Nova senha deve ter ao menos 6 caracteres.")
    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    log(db, current_user, "update_password", "user", current_user.id, current_user.email)
    return {"ok": True}


@router.post('/lgpd-consent')
def lgpd_consent(
    payload: LGPDConsent,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.lgpd_consent = payload.consent
    current_user.lgpd_consent_at = datetime.utcnow()
    db.commit()
    return {'ok': True}


# ── Rotas dinâmicas /{user_id} ────────────────────────────────────────────────

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


@router.patch("/{user_id}/status", response_model=UserOut, summary="Ativar ou desativar usuário")
def toggle_user_status(
    user_id: str,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Apenas administradores.")
    if str(current_user.id) == user_id:
        raise HTTPException(status_code=400, detail="Você não pode desativar sua própria conta.")
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    target.is_active = payload.get("is_active", target.is_active)
    db.commit()
    db.refresh(target)
    action = "activate_user" if target.is_active else "deactivate_user"
    log(db, current_user, action, "user", target.id, target.email)
    return target