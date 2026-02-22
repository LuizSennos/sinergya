# Cria todos os schemas
# Rode dentro da pasta sinergya-backend

"" | Set-Content app\schemas\__init__.py

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
"@ | Set-Content app\schemas\auth.py

# ===== schemas/user.py =====
@"
from pydantic import BaseModel, EmailStr
from datetime import datetime
import uuid

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str
    course: str | None = None
    institution: str | None = None
    specialty: str | None = None
    council_number: str | None = None

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str
    is_active: bool
    lgpd_consent: bool
    course: str | None = None
    institution: str | None = None
    specialty: str | None = None
    created_at: datetime

    model_config = {'from_attributes': True}

class LGPDConsent(BaseModel):
    consent: bool
"@ | Set-Content app\schemas\user.py

# ===== schemas/patient.py =====
@"
from pydantic import BaseModel
from datetime import date, datetime
import uuid

class PatientCreate(BaseModel):
    name: str
    specialties: str
    birth_date: date | None = None
    is_minor: bool = False
    notes: str | None = None
    legal_guardian_id: uuid.UUID | None = None

class PatientOut(BaseModel):
    id: uuid.UUID
    name: str
    specialties: str
    birth_date: date | None = None
    is_minor: bool
    is_active: bool
    created_at: datetime

    model_config = {'from_attributes': True}
"@ | Set-Content app\schemas\patient.py

# ===== schemas/group.py =====
@"
from pydantic import BaseModel
import uuid

class GroupMemberCreate(BaseModel):
    patient_id: uuid.UUID
    user_id: uuid.UUID
    group_type: str

class GroupMemberOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    user_id: uuid.UUID
    group_type: str
    is_active: bool

    model_config = {'from_attributes': True}
"@ | Set-Content app\schemas\group.py

# ===== schemas/message.py =====
@"
from pydantic import BaseModel
from datetime import datetime
import uuid

class MessageCreate(BaseModel):
    patient_id: uuid.UUID
    context: str
    content: str

class MessageOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    author_id: uuid.UUID
    context: str
    content: str
    created_at: datetime

    model_config = {'from_attributes': True}
"@ | Set-Content app\schemas\message.py

# ===== schemas/diary.py =====
@"
from pydantic import BaseModel
from datetime import datetime
import uuid

class DiaryEntryCreate(BaseModel):
    patient_id: uuid.UUID
    content: str

class DiaryEntryOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    author_id: uuid.UUID
    content: str
    created_at: datetime

    model_config = {'from_attributes': True}
"@ | Set-Content app\schemas\diary.py

# ===== schemas/task.py =====
@"
from pydantic import BaseModel
from datetime import datetime
import uuid

class TaskCreate(BaseModel):
    patient_id: uuid.UUID
    title: str
    description: str | None = None

class TaskDone(BaseModel):
    is_done: bool

class TaskOut(BaseModel):
    id: uuid.UUID
    patient_id: uuid.UUID
    created_by_id: uuid.UUID
    title: str
    description: str | None = None
    is_done: bool
    done_at: datetime | None = None
    created_at: datetime

    model_config = {'from_attributes': True}
"@ | Set-Content app\schemas\task.py

Write-Host "Schemas criados com sucesso!" -ForegroundColor Green
