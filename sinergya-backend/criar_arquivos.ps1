# Cria todos os arquivos do backend Sinergya
# Rode dentro da pasta sinergya-backend

# ===== app/db/base.py =====
@"
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

from app.models.user import User
from app.models.patient import Patient
from app.models.group import GroupMember
from app.models.message import Message
from app.models.diary import DiaryEntry
from app.models.task import Task
from app.models.audit import AuditLog
"@ | Set-Content app\db\base.py

# ===== app/db/session.py =====
@"
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
"@ | Set-Content app\db\session.py

"" | Set-Content app\db\__init__.py
"" | Set-Content app\core\__init__.py
"" | Set-Content app\models\__init__.py

# ===== app/core/config.py =====
@"
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = 'Sinergya'
    DEBUG: bool = True
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = '.env'

settings = Settings()
"@ | Set-Content app\core\config.py

# ===== app/core/security.py =====
@"
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/auth/login')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({'exp': expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from app.models.user import User
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Token invalido ou expirado.',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user

def require_roles(*roles):
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail='Acesso negado.')
        return current_user
    return checker
"@ | Set-Content app\core\security.py

# ===== app/models/user.py =====
@"
from sqlalchemy import Column, String, Boolean, Enum as SAEnum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base

class UserRole(str, enum.Enum):
    admin = 'admin'
    academico = 'academico'
    supervisor = 'supervisor'
    profissional = 'profissional'
    paciente = 'paciente'
    responsavel = 'responsavel'

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    lgpd_consent = Column(Boolean, default=False)
    lgpd_consent_at = Column(DateTime, nullable=True)
    course = Column(String, nullable=True)
    institution = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    council_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship('Message', back_populates='author', foreign_keys='Message.author_id')
    diary_entries = relationship('DiaryEntry', back_populates='author')
    tasks = relationship('Task', back_populates='created_by')
    audit_logs = relationship('AuditLog', back_populates='user')
"@ | Set-Content app\models\user.py

# ===== app/models/patient.py =====
@"
from sqlalchemy import Column, String, Text, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class Patient(Base):
    __tablename__ = 'patients'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    birth_date = Column(Date, nullable=True)
    is_minor = Column(Boolean, default=False)
    specialties = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    legal_guardian_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)

    legal_guardian = relationship('User', foreign_keys=[legal_guardian_id])
    group_members = relationship('GroupMember', back_populates='patient')
    diary_entries = relationship('DiaryEntry', back_populates='patient')
    tasks = relationship('Task', back_populates='patient')
"@ | Set-Content app\models\patient.py

# ===== app/models/group.py =====
@"
from sqlalchemy import Column, Enum as SAEnum, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base

class GroupType(str, enum.Enum):
    assistencial = 'assistencial'
    tecnico = 'tecnico'

class GroupMember(Base):
    __tablename__ = 'group_members'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    group_type = Column(SAEnum(GroupType), nullable=False)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient', back_populates='group_members')
    user = relationship('User')
"@ | Set-Content app\models\group.py

# ===== app/models/message.py =====
@"
from sqlalchemy import Column, Text, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.base import Base

class MessageContext(str, enum.Enum):
    assistencial = 'assistencial'
    tecnico = 'tecnico'

class Message(Base):
    __tablename__ = 'messages'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    context = Column(SAEnum(MessageContext), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient')
    author = relationship('User', back_populates='messages', foreign_keys=[author_id])
"@ | Set-Content app\models\message.py

# ===== app/models/diary.py =====
@"
from sqlalchemy import Column, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class DiaryEntry(Base):
    __tablename__ = 'diary_entries'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient', back_populates='diary_entries')
    author = relationship('User', back_populates='diary_entries')
"@ | Set-Content app\models\diary.py

# ===== app/models/task.py =====
@"
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey('patients.id'), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_done = Column(Boolean, default=False)
    done_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship('Patient', back_populates='tasks')
    created_by = relationship('User', back_populates='tasks')
"@ | Set-Content app\models\task.py

# ===== app/models/audit.py =====
@"
from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.base import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    user_role = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='audit_logs')
"@ | Set-Content app\models\audit.py

Write-Host "Todos os arquivos criados com sucesso!" -ForegroundColor Green
