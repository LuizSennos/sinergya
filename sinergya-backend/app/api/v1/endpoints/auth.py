from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import login
from fastapi.security import OAuth2PasswordRequestForm

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