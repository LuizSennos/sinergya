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
