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
            raise HTTPException(status_code=403, detail="Paciente não tem acesso ao grupo técnico.")
        return
    group_type = GroupType.assistencial if context == MessageContext.assistencial else GroupType.tecnico
    member = db.query(GroupMember).filter(
        GroupMember.patient_id == patient_id,
        GroupMember.user_id == current_user.id,
        GroupMember.group_type == group_type,
        GroupMember.is_active == True
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Sem acesso a este grupo.")

@router.get("/{patient_id}", summary="Listar mensagens")
def get_messages(
    patient_id: str,
    context: MessageContext,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_group_access(patient_id, context, current_user, db)
    messages = db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.context == context
    ).order_by(Message.created_at).all()

    # Enriquece com nome e role do autor
    result = []
    for msg in messages:
        author = db.query(User).filter(User.id == msg.author_id).first()
        item = MessageOut.model_validate(msg)
        if author:
            item.author_name = author.name
            item.author_role = author.role
        result.append(item)
    return result

@router.post("/", response_model=MessageOut, summary="Enviar mensagem")
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_group_access(str(payload.patient_id), payload.context, current_user, db)
    msg = Message(
        patient_id=payload.patient_id,
        author_id=current_user.id,
        context=payload.context,
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    log(db, current_user, "send_message", "message", msg.id, f"context={payload.context}")

    item = MessageOut.model_validate(msg)
    item.author_name = current_user.name
    item.author_role = current_user.role
    return item