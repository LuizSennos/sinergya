from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, users, patients, groups, messages, diary, tasks, admin, upload




app = FastAPI(
    title="Sinergya API",
    description="Plataforma multiprofissional de saúde",
    version="0.1.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://sinergya-app-3i8h9.ondigitalocean.app",
        "https://sinergya.app.br",
        "*",  # temporário para apresentação
        
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROTAS ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Usuários"])
app.include_router(patients.router, prefix="/patients", tags=["Pacientes"])
app.include_router(groups.router, prefix="/groups", tags=["Grupos"])
app.include_router(diary.router, prefix="/diary", tags=["Diário"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tarefas"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(upload.router,   prefix="/upload",   tags=["upload"])
app.include_router(messages.router, prefix="/messages", tags=["Mensagens"])

@app.get("/health", tags=["Sistema"])
def health():
    return {"status": "ok", "app": "Sinergya"}