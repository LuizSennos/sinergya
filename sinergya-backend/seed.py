"""
Script de seed — cria usuários de teste para cada perfil do sistema.
Rode dentro da pasta sinergya-backend com o venv ativado:
  python seed.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.group import GroupMember
from app.models.message import Message
from app.models.diary import DiaryEntry
from app.models.task import Task
from app.models.audit import AuditLog
from app.core.security import hash_password
from datetime import datetime

db = SessionLocal()

users = [
    {
        "name": "Admin Sinergya",
        "email": "admin@sinergya.com",
        "password": "admin123",
        "role": UserRole.admin,
    },
    {
        "name": "Dra. Ana Paula",
        "email": "ana@sinergya.com",
        "password": "prof123",
        "role": UserRole.profissional,
        "specialty": "Psicologia",
        "council_number": "CRP 06/12345",
    },
    {
        "name": "Dr. Carlos Melo",
        "email": "carlos@sinergya.com",
        "password": "prof123",
        "role": UserRole.profissional,
        "specialty": "Fonoaudiologia",
        "council_number": "CRFa 2/12345",
    },
    {
        "name": "Sup. Fernanda",
        "email": "fernanda@sinergya.com",
        "password": "sup123",
        "role": UserRole.supervisor,
        "specialty": "Psicologia Clínica",
    },
    {
        "name": "João Silva",
        "email": "joao@email.com",
        "password": "pac123",
        "role": UserRole.paciente,
    },
    {
        "name": "Maria Costa",
        "email": "maria@email.com",
        "password": "pac123",
        "role": UserRole.paciente,
    },
    {
        "name": "Acad. Lucas",
        "email": "lucas@universidade.com",
        "password": "acad123",
        "role": UserRole.academico,
        "course": "Psicologia",
        "institution": "USP",
    },
]

print("\n🌱 Criando usuários de teste...\n")

for u in users:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        print(f"  ⚠️  Já existe: {u['email']}")
        continue

    user = User(
        name=u["name"],
        email=u["email"],
        hashed_password=hash_password(u["password"]),
        role=u["role"],
        is_active=True,
        lgpd_consent=True,
        lgpd_consent_at=datetime.utcnow(),
        specialty=u.get("specialty"),
        council_number=u.get("council_number"),
        course=u.get("course"),
        institution=u.get("institution"),
    )
    db.add(user)
    db.commit()
    print(f"  ✅ Criado: {u['email']} | senha: {u['password']} | perfil: {u['role']}")

db.close()
print("\n✅ Seed concluído!\n")
print("=" * 50)
print("USUÁRIOS DE TESTE:")
print("=" * 50)
print("admin@sinergya.com     | admin123  | Admin")
print("ana@sinergya.com       | prof123   | Profissional")
print("carlos@sinergya.com    | prof123   | Profissional")
print("fernanda@sinergya.com  | sup123    | Supervisor")
print("joao@email.com         | pac123    | Paciente")
print("maria@email.com        | pac123    | Paciente")
print("lucas@universidade.com | acad123   | Acadêmico")
print("=" * 50)
