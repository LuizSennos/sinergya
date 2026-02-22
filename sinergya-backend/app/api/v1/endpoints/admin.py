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
