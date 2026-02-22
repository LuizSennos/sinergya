from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token

def authenticate(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def login(db: Session, email: str, password: str):
    user = authenticate(db, email, password)
    if not user:
        return None
    token = create_access_token({'sub': str(user.id), 'role': user.role})
    return {
        'access_token': token,
        'token_type': 'bearer',
        'role': user.role,
        'name': user.name,
        'user_id': str(user.id),
        'lgpd_consent': user.lgpd_consent,
    }
