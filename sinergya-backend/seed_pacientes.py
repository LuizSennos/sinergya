"""
Seed completo — cria pacientes e vincula aos profissionais.
Rode dentro de sinergya-backend com venv ativado:
  python seed_pacientes.py
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.group import GroupMember, GroupType
from app.models.message import Message, MessageContext
from app.models.task import Task
from app.models.diary import DiaryEntry
from app.models.audit import AuditLog
from app.db.session import SessionLocal
from datetime import datetime

db = SessionLocal()

print("\n🌱 Criando pacientes e vínculos...\n")

# Busca IDs dos profissionais
def get_id(email):
    u = db.query(User).filter(User.email == email).first()
    return u.id if u else None

ana_id = get_id("ana@sinergya.com")
carlos_id = get_id("carlos@sinergya.com")
fernanda_id = get_id("fernanda@sinergya.com")
joao_user_id = get_id("joao@email.com")

if not ana_id:
    print("❌ Profissionais não encontrados. Rode o seed.py primeiro!")
    db.close()
    sys.exit(1)

# ─── PACIENTES ────────────────────────────────────────────────────────────────

pacientes_data = [
    {"name": "João Silva", "specialties": "Psicologia • Fonoaudiologia", "is_minor": False},
    {"name": "Maria Costa", "specialties": "Psicologia", "is_minor": False},
    {"name": "Lucas Mendes", "specialties": "Terapia Ocupacional • Fisioterapia", "is_minor": True},
]

pacientes_ids = []
for p_data in pacientes_data:
    existing = db.query(Patient).filter(Patient.name == p_data["name"]).first()
    if existing:
        print(f"  ⚠️  Já existe: {p_data['name']}")
        pacientes_ids.append(existing.id)
    else:
        p = Patient(**p_data, is_active=True)
        db.add(p)
        db.commit()
        pacientes_ids.append(p.id)
        print(f"  ✅ Criado: {p_data['name']}")

joao_id, maria_id, lucas_id = pacientes_ids[0], pacientes_ids[1], pacientes_ids[2]

# ─── VÍNCULOS ────────────────────────────────────────────────────────────────

def vincular(user_id, patient_id):
    if not user_id:
        return
    for gt in [GroupType.assistencial, GroupType.tecnico]:
        exists = db.query(GroupMember).filter(
            GroupMember.user_id == user_id,
            GroupMember.patient_id == patient_id,
            GroupMember.group_type == gt
        ).first()
        if not exists:
            db.add(GroupMember(user_id=user_id, patient_id=patient_id, group_type=gt, is_active=True))
    db.commit()

vincular(ana_id, joao_id)
vincular(carlos_id, joao_id)
vincular(fernanda_id, joao_id)
vincular(ana_id, maria_id)
vincular(ana_id, lucas_id)
vincular(carlos_id, lucas_id)
print("  ✅ Vínculos criados")

# ─── MENSAGENS ───────────────────────────────────────────────────────────────

def add_msg(patient_id, author_id, context, content):
    if not author_id:
        return
    exists = db.query(Message).filter(
        Message.patient_id == patient_id,
        Message.author_id == author_id,
        Message.content == content
    ).first()
    if not exists:
        db.add(Message(patient_id=patient_id, author_id=author_id, context=context, content=content, created_at=datetime.utcnow()))
        db.commit()

add_msg(joao_id, ana_id, MessageContext.assistencial, "Paciente apresentou melhora significativa na comunicação verbal durante as últimas sessões.")
add_msg(joao_id, carlos_id, MessageContext.assistencial, "Exercícios de respiração estão sendo bem aceitos. Continuaremos na próxima semana.")
add_msg(joao_id, fernanda_id, MessageContext.tecnico, "Equipe alinhada para integrar as abordagens. Próxima reunião técnica na sexta.")
add_msg(joao_id, ana_id, MessageContext.tecnico, "Registrar evolução clínica apenas após validação da equipe multidisciplinar.")
add_msg(maria_id, ana_id, MessageContext.assistencial, "Iniciamos trabalho focado em regulação emocional. Boa adesão ao processo.")
print("  ✅ Mensagens criadas")

# ─── TAREFAS ─────────────────────────────────────────────────────────────────

def add_task(patient_id, author_id, title, description, is_done=False):
    if not author_id:
        return
    exists = db.query(Task).filter(Task.patient_id == patient_id, Task.title == title).first()
    if not exists:
        db.add(Task(
            patient_id=patient_id,
            created_by_id=author_id,
            title=title,
            description=description,
            is_done=is_done,
            done_at=datetime.utcnow() if is_done else None,
            created_at=datetime.utcnow()
        ))
        db.commit()

add_task(joao_id, ana_id, "Exercícios de respiração diafragmática", "Realizar 3 séries de 10 respirações pela manhã e à noite.", is_done=True)
add_task(joao_id, carlos_id, "Leitura em voz alta — 10 minutos", "Ler qualquer texto em voz alta focando na dicção.")
add_task(joao_id, ana_id, "Diário de emoções", "Anotar 3 emoções sentidas ao longo do dia.")
print("  ✅ Tarefas criadas")

# ─── DIÁRIO ──────────────────────────────────────────────────────────────────

def add_diary(patient_id, author_id, content):
    if not author_id:
        return
    exists = db.query(DiaryEntry).filter(DiaryEntry.patient_id == patient_id, DiaryEntry.content == content).first()
    if not exists:
        db.add(DiaryEntry(patient_id=patient_id, author_id=author_id, content=content, created_at=datetime.utcnow()))
        db.commit()

add_diary(joao_id, joao_user_id, "Hoje me senti mais tranquilo durante as atividades. Consegui fazer os exercícios de respiração.")
add_diary(joao_id, joao_user_id, "Tive dificuldade para dormir ontem, mas acordei disposto. A sessão de hoje foi cansativa mas boa.")
print("  ✅ Diário criado")

db.close()

print("\n✅ Seed completo!\n")
print("=" * 50)
print("PACIENTES:")
print(f"  João Silva   — {joao_id}")
print(f"  Maria Costa  — {maria_id}")
print(f"  Lucas Mendes — {lucas_id}")
print("=" * 50)
print("\nLogin: admin@sinergya.com / admin123\n")