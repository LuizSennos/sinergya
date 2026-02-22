from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.endpoints import auth, users, patients, groups, messages, diary, tasks, admin

app = FastAPI(
    title=settings.APP_NAME,
    description="Plataforma multiprofissional de saúde — MVP",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/auth",     tags=["Auth"])
app.include_router(users.router,    prefix="/users",    tags=["Usuários"])
app.include_router(patients.router, prefix="/patients", tags=["Pacientes"])
app.include_router(groups.router,   prefix="/groups",   tags=["Grupos"])
app.include_router(messages.router, prefix="/messages", tags=["Mensagens"])
app.include_router(diary.router,    prefix="/diary",    tags=["Diário"])
app.include_router(tasks.router,    prefix="/tasks",    tags=["Tarefas"])
app.include_router(admin.router,    prefix="/admin",    tags=["Admin"])

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}