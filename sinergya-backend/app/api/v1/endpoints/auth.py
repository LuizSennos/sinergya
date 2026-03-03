from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import login
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User

router = APIRouter()

@router.post('/login', response_model=TokenResponse, summary='Login')
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    result = login(db, payload.email, payload.password)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Email ou senha incorretos.')
    return result



@router.post("/token")
def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    result = login(db, form_data.username, form_data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Credenciais inválidas.")
    return result

@router.get('/debug-hash')
def debug_hash(db: Session = Depends(get_db)):
    from app.core.security import hash_password, verify_password
    user = db.query(User).filter(User.email == 'admin@sinergya.com').first()
    if not user:
        return {'error': 'user not found'}
    test = verify_password('Admin123', user.hashed_password)
    new_hash = hash_password('Admin123')
    return {
        'hash_in_db': user.hashed_password,
        'verify_result': test,
        'new_hash_generated': new_hash,
    }