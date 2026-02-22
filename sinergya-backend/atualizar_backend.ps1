# Atualiza todos os endpoints do backend Sinergya
# Rode dentro da pasta sinergya-backend

Write-Host "Atualizando endpoints..." -ForegroundColor Cyan

# ===== auth.py =====
@"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import login

router = APIRouter()

@router.post('/login', response_model=TokenResponse, summary='Login')
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    result = login(db, payload.email, payload.password)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Email ou senha incorretos.')
    return result
"@ | Set-Content app\api\v1\endpoints\auth.py

# ===== services/auth.py =====
@"
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
"@ | Set-Content app\services\auth.py

# ===== schemas/auth.py =====
@"
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
    role: str
    name: str
    user_id: str
    lgpd_consent: bool = False
"@ | Set-Content app\schemas\auth.py

# ===== users.py =====
@"
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
"@ | Set-Content app\api\v1\endpoints\users.py

# ===== patients.py =====
@"
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
"@ | Set-Content app\api\v1\endpoints\patients.py

# ===== groups.py =====
@"
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
"@ | Set-Content app\api\v1\endpoints\groups.py

# ===== messages.py =====
@"
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.message import Message, MessageContext
from app.models.group import GroupMember, GroupType
from app.models.user import User, UserRole
from app.schemas.message import MessageCreate, MessageOut
from app.core.security import get_current_user
from app.services.audit import log

router = APIRouter()

def check_group_access(patient_id: str, context: MessageContext, current_user: User, db: Session):
    if current_user.role == UserRole.admin:
        return
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        if context == MessageContext.tecnico:
            raise HTTPException(status_code=403, detail='Paciente nao tem acesso ao grupo tecnico.')
        return
    group_type = GroupType.assistencial if context == MessageContext.assistencial else GroupType.tecnico
    member = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == current_user.id,
        GroupMember.group_type == group_type,
        GroupMember.is_active == True
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail='Sem acesso a este grupo.')

@router.get('/{patient_id}', response_model=list[MessageOut])
def get_messages(patient_id: str, context: MessageContext, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_group_access(patient_id, context, current_user, db)
    return db.query(Message).filter(Message.patient_id == patient_id, Message.context == context).order_by(Message.created_at).all()

@router.post('/', response_model=MessageOut)
def send_message(payload: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    check_group_access(str(payload.patient_id), payload.context, current_user, db)
    msg = Message(patient_id=payload.patient_id, author_id=current_user.id, context=payload.context, content=payload.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    log(db, current_user, 'send_message', 'message', msg.id, f'context={payload.context}')
    return msg
"@ | Set-Content app\api\v1\endpoints\messages.py

# ===== diary.py =====
@"
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
"@ | Set-Content app\api\v1\endpoints\diary.py

# ===== tasks.py =====
@"
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.task import Task
from app.models.user import User, UserRole
from app.schemas.task import TaskCreate, TaskOut, TaskDone
from app.core.security import get_current_user, require_roles
from app.services.audit import log

router = APIRouter()

@router.get('/{patient_id}', response_model=list[TaskOut])
def get_tasks(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.patient_id == patient_id).order_by(Task.created_at.desc()).all()

@router.post('/', response_model=TaskOut, dependencies=[Depends(require_roles(UserRole.academico, UserRole.profissional, UserRole.supervisor, UserRole.admin))])
def create_task(payload: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = Task(patient_id=payload.patient_id, created_by_id=current_user.id, title=payload.title, description=payload.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    log(db, current_user, 'create_task', 'task', task.id, f'patient={payload.patient_id}')
    return task

@router.patch('/{task_id}/done', response_model=TaskOut)
def mark_done(task_id: str, payload: TaskDone, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='Tarefa nao encontrada.')
    task.is_done = payload.is_done
    task.done_at = datetime.utcnow() if payload.is_done else None
    db.commit()
    db.refresh(task)
    return task

@router.delete('/{task_id}')
def delete_task(task_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='Tarefa nao encontrada.')
    if current_user.role != UserRole.admin and str(task.created_by_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail='Sem permissao para excluir.')
    db.delete(task)
    db.commit()
    return {'ok': True}
"@ | Set-Content app\api\v1\endpoints\tasks.py

# ===== admin.py =====
@"
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.audit import AuditLog
from app.models.message import Message
from app.models.task import Task
from app.core.security import require_roles

router = APIRouter()

@router.get('/stats', dependencies=[Depends(require_roles(UserRole.admin))])
def stats(db: Session = Depends(get_db)):
    return {
        'total_users': db.query(User).count(),
        'active_users': db.query(User).filter(User.is_active == True).count(),
        'total_patients': db.query(Patient).filter(Patient.is_active == True).count(),
        'total_messages': db.query(Message).count(),
        'total_tasks': db.query(Task).count(),
        'total_audit_logs': db.query(AuditLog).count(),
        'users_by_role': {role.value: db.query(User).filter(User.role == role).count() for role in UserRole}
    }

@router.get('/audit-logs', dependencies=[Depends(require_roles(UserRole.admin))])
def audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
"@ | Set-Content app\api\v1\endpoints\admin.py

Write-Host "Endpoints atualizados!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora rode: python seed.py" -ForegroundColor Yellow
