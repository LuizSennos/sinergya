# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, '.')

from app.db.session import SessionLocal
from sqlalchemy import text

db = SessionLocal()

db.execute(text("UPDATE patients SET name='João Silva', specialties='Psicologia • Fonoaudiologia' WHERE name LIKE '%Jo%Silva%'"))
db.execute(text("UPDATE users SET name='João Silva' WHERE email='joao@email.com'"))
db.commit()
db.close()
print("OK - nomes corrigidos!")
