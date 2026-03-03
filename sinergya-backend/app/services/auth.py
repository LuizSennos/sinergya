from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token

def authenticate(db: Session, email: str, password: str):
    print(f"[DEBUG] email: '{email}' | password: '{password}' | len: {len(password)}")
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        print("[DEBUG] user NAO encontrado")
        return None
    print(f"[DEBUG] hash no banco: '{user.hashed_password}'")
    result = verify_password(password, user.hashed_password)
    print(f"[DEBUG] verify_password result: {result}")
    return user if result else None

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


