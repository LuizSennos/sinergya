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
