# Cria todos os arquivos de endpoints
# Rode dentro da pasta sinergya-backend

"" | Set-Content app\api\__init__.py
"" | Set-Content app\api\v1\__init__.py
"" | Set-Content app\api\v1\endpoints\__init__.py

# ===== auth.py =====
@"
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth import login

router = APIRouter()

@router.post('/login', response_model=TokenResponse)
def login_endpoint(payload: LoginRequest, db: Session = Depends(get_db)):
    result = login(db, payload.email, payload.password)
    if not result:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Credenciais invalidas.')
    return result
"@ | Set-Content app\api\v1\endpoints\auth.py

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
def me(current_user=Depends(get_current_user)):
    return current_user

@router.post('/lgpd-consent')
def lgpd_consent(payload: LGPDConsent, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    current_user.lgpd_consent = payload.consent
    current_user.lgpd_consent_at = datetime.utcnow()
    db.commit()
    return {'ok': True}

@router.get('/', response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_roles(UserRole.admin))):
    return db.query(User).all()

@router.patch('/{user_id}/activate')
def toggle_active(user_id: str, active: bool, db: Session = Depends(get_db), _=Depends(require_roles(UserRole.admin))):
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
from app.models.user import UserRole
from app.schemas.patient import PatientCreate, PatientOut
from app.core.security import get_current_user, require_roles

router = APIRouter()

@router.get('/', response_model=list[PatientOut])
def list_patients(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Patient).filter(Patient.is_active == True).all()

@router.get('/{patient_id}', response_model=PatientOut)
def get_patient(patient_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail='Paciente nao encontrado.')
    return patient

@router.post('/', response_model=PatientOut)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.supervisor, UserRole.profissional, UserRole.academico))
):
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
"@ | Set-Content app\api\v1\endpoints\patients.py

# ===== groups.py =====
@"
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.group import GroupMember, GroupType
from app.models.user import UserRole
from app.schemas.group import GroupMemberCreate, GroupMemberOut
from app.core.security import get_current_user, require_roles

router = APIRouter()

@router.post('/', response_model=list[GroupMemberOut])
def bind_user_to_patient(
    payload: GroupMemberCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.admin, UserRole.supervisor))
):
    members = []
    for group_type in [GroupType.assistencial, GroupType.tecnico]:
        existing = db.query(GroupMember).filter(
            GroupMember.patient_id == payload.patient_id,
            GroupMember.user_id == payload.user_id,
            GroupMember.group_type == group_type
        ).first()
        if not existing:
            m = GroupMember(patient_id=payload.patient_id, user_id=payload.user_id, group_type=group_type)
            db.add(m)
            members.append(m)
    db.commit()
    for m in members:
        db.refresh(m)
    return members

@router.get('/{patient_id}', response_model=list[GroupMemberOut])
def get_group(patient_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(GroupMember).filter(GroupMember.patient_id == patient_id, GroupMember.is_active == True).all()
"@ | Set-Content app\api\v1\endpoints\groups.py

# ===== messages.py =====
@"
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.message import Message, MessageContext
from app.models.user import UserRole
from app.schemas.message import MessageCreate, MessageOut
from app.core.security import get_current_user
from app.services.audit import log

router = APIRouter()

@router.get('/{patient_id}', response_model=list[MessageOut])
def get_messages(patient_id: str, context: MessageContext, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        if context == MessageContext.tecnico:
            raise HTTPException(status_code=403, detail='Acesso negado ao grupo tecnico.')
    return db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.context == context
    ).order_by(Message.created_at).all()

@router.post('/', response_model=MessageOut)
def send_message(payload: MessageCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role in [UserRole.paciente, UserRole.responsavel]:
        if payload.context == MessageContext.tecnico:
            raise HTTPException(status_code=403, detail='Paciente nao pode enviar mensagem tecnica.')
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
from app.models.user import UserRole
from app.schemas.diary import DiaryEntryCreate, DiaryEntryOut
from app.core.security import get_current_user

router = APIRouter()

@router.get('/{patient_id}', response_model=list[DiaryEntryOut])
def get_diary(patient_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(DiaryEntry).filter(DiaryEntry.patient_id == patient_id).order_by(DiaryEntry.created_at).all()

@router.post('/', response_model=DiaryEntryOut)
def create_entry(payload: DiaryEntryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in [UserRole.paciente, UserRole.responsavel]:
        raise HTTPException(status_code=403, detail='Apenas paciente ou responsavel pode escrever no diario.')
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
from app.models.user import UserRole
from app.schemas.task import TaskCreate, TaskOut, TaskDone
from app.core.security import get_current_user, require_roles

router = APIRouter()

@router.get('/{patient_id}', response_model=list[TaskOut])
def get_tasks(patient_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Task).filter(Task.patient_id == patient_id).order_by(Task.created_at).all()

@router.post('/', response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(UserRole.academico, UserRole.profissional, UserRole.supervisor))
):
    task = Task(patient_id=payload.patient_id, created_by_id=current_user.id, title=payload.title, description=payload.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch('/{task_id}/done', response_model=TaskOut)
def mark_done(task_id: str, payload: TaskDone, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail='Tarefa nao encontrada.')
    task.is_done = payload.is_done
    task.done_at = datetime.utcnow() if payload.is_done else None
    db.commit()
    db.refresh(task)
    return task
"@ | Set-Content app\api\v1\endpoints\tasks.py

# ===== admin.py =====
@"
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.audit import AuditLog
from app.core.security import require_roles

router = APIRouter()

@router.get('/stats')
def stats(db: Session = Depends(get_db), _=Depends(require_roles(UserRole.admin))):
    return {
        'total_users': db.query(User).count(),
        'active_users': db.query(User).filter(User.is_active == True).count(),
        'total_logs': db.query(AuditLog).count(),
    }

@router.get('/audit-logs')
def audit_logs(db: Session = Depends(get_db), _=Depends(require_roles(UserRole.admin))):
    return db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(100).all()
"@ | Set-Content app\api\v1\endpoints\admin.py

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
    }
"@ | Set-Content app\services\auth.py

# ===== services/audit.py =====
@"
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log(db: Session, user, action: str, entity: str = None, entity_id=None, detail: str = None):
    entry = AuditLog(
        user_id=user.id,
        user_role=user.role,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id else None,
        detail=detail,
    )
    db.add(entry)
    db.commit()
"@ | Set-Content app\services\audit.py

"" | Set-Content app\services\__init__.py

Write-Host "Endpoints criados com sucesso!" -ForegroundColor Green
