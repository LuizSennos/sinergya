import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import auth, users, patients, groups, messages, diary, tasks, admin, upload

# ─── CONFIGURAÇÃO DE AMBIENTE ────────────────────────────────────────────────
# Pega as origens do ENV ou usa localhost como fallback
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
origins = [origin.strip() for origin in allowed_origins_raw.split(",")]

app = FastAPI(
    title="Sinergya API",
    description="Plataforma multiprofissional de saúde",
    version="0.1.0",
    # Isso ajuda o Swagger a carregar corretamente atrás do proxy da DigitalOcean
    root_path=os.getenv("ROOT_PATH", ""), 
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROTAS ───────────────────────────────────────────────────────────────────
# Rota raiz para evitar o erro 404 ao abrir o link principal
@app.get("/")
def read_root():
    return {"message": "Sinergya API is running. Go to /docs for documentation."}

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
