# 🚀 Guia de Deploy — Sinergya + DigitalOcean
> Passo a passo para iniciantes. Siga como receita de bolo.

---

## 📋 O que você vai precisar antes de começar
- Conta na DigitalOcean (digitalocean.com) — crie com o cartão do cliente
- Repositório do projeto no GitHub (frontend + backend)
- Domínio sinergya.app.br (já registrado no Registro.br)

---

## 🏗️ Arquitetura Final

```
sinergya.app.br         → Frontend (Next.js) — App Platform Static
api.sinergya.app.br     → Backend (FastAPI)  — App Platform Basic ~US$5/mês
db interno              → PostgreSQL Managed  — ~US$15/mês
─────────────────────────────────────────────────────
TOTAL: ~US$20/mês (~R$100/mês)
```

---

## PASSO 1 — Criar o Banco de Dados

1. No painel DigitalOcean → clica em **"Databases"** no menu esquerdo
2. Clica **"Create Database"**
3. Escolhe:
   - Engine: **PostgreSQL**
   - Version: **16**
   - Plan: **Basic — $15/mês**
   - Datacenter: **New York** (ou São Paulo se disponível)
   - Nome: `sinergya-db`
4. Clica **"Create Database Cluster"** — aguarda ~2 minutos
5. Quando criar, vai em **"Connection Details"** e copia a **Connection String (URI)**:
   ```
   postgresql://doadmin:SENHA@sinergya-db-do-user-xxx.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```
   ⚠️ **Salva essa string — você vai precisar dela no passo 2**

---

## PASSO 2 — Deploy do Backend (FastAPI)

1. No painel → clica **"Apps"** → **"Create App"**
2. Seleciona **"GitHub"** → autoriza e escolhe o repositório
3. Em **"Source Directory"** coloca: `/sinergya-backend` (pasta do backend)
4. A DO vai detectar Python automaticamente
5. Em **"Run Command"** confirma:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8080
   ```
6. Clica em **"Environment Variables"** e adiciona:
   ```
   DATABASE_URL = postgresql://doadmin:SENHA@...  ← a do passo 1
   SECRET_KEY   = uma-chave-longa-e-aleatoria-aqui
   ALLOWED_ORIGINS = https://sinergya.app.br,https://www.sinergya.app.br
   ```
7. Plan: **Basic — $5/mês**
8. Clica **"Create Resources"**
9. Aguarda o deploy (~3 min) — ficará verde quando pronto
10. Copia a URL gerada, ex: `https://sinergya-backend-xxxxx.ondigitalocean.app`
    ⚠️ **Salva essa URL — você vai precisar dela no passo 3**

---

## PASSO 3 — Deploy do Frontend (Next.js)

1. No painel → **"Apps"** → **"Create App"**
2. Seleciona o mesmo repositório GitHub
3. Em **"Source Directory"** coloca: `/healthtech-mvp` (pasta do Next.js)
4. A DO detecta Next.js automaticamente
5. Em **"Environment Variables"** adiciona:
   ```
   NEXT_PUBLIC_API_URL = https://sinergya-backend-xxxxx.ondigitalocean.app
   ```
   ← a URL do backend do passo 2
6. Plan: **Static Site — Grátis**
7. Clica **"Create Resources"**
8. Aguarda deploy (~5 min)

---

## PASSO 4 — Configurar o Domínio

### 4.1 — Adicionar domínio na DigitalOcean
1. No app do **frontend** → aba **"Settings"** → **"Domains"**
2. Clica **"Add Domain"**
3. Digita: `sinergya.app.br`
4. A DO vai mostrar os registros DNS que você precisa configurar

### 4.2 — Configurar DNS no Registro.br
1. Acessa registro.br → faz login → clica em **sinergya.app.br**
2. Clica em **"Editar Zona DNS"**
3. Adiciona os registros que a DO mostrou, geralmente:
   ```
   CNAME   @     seu-app.ondigitalocean.app
   CNAME   www   seu-app.ondigitalocean.app
   ```
4. Salva — DNS propaga em até 24h (geralmente 30 min)

### 4.3 — Domínio do backend (opcional mas recomendado)
1. No app do **backend** → **"Settings"** → **"Domains"**
2. Adiciona: `api.sinergya.app.br`
3. Adiciona o CNAME no Registro.br igual ao passo anterior

---

## PASSO 5 — Rodar as Migrations do Banco

Após o backend estar no ar, você precisa criar as tabelas:

1. No app do backend → aba **"Console"**
2. Digita:
   ```bash
   python -m alembic upgrade head
   ```
   ou se não usa Alembic:
   ```bash
   python create_tables.py
   ```
3. Se der erro, me manda o print que resolvo

---

## ✅ Checklist Final

- [ ] Banco PostgreSQL criado e connection string salva
- [ ] Backend deployado e acessível
- [ ] Frontend deployado e acessível
- [ ] Variáveis de ambiente configuradas
- [ ] Migrations rodadas (tabelas criadas)
- [ ] Domínio sinergya.app.br apontando pro frontend
- [ ] Domínio api.sinergya.app.br apontando pro backend
- [ ] Teste de login funcionando em produção
- [ ] HTTPS ativo (DigitalOcean faz isso automático ✓)

---

## 🆘 Se Travar em Algum Passo

1. Tira print da tela ou do erro
2. Manda aqui — resolvemos juntos
3. Os erros mais comuns têm solução em menos de 5 minutos

---

## 💰 Resumo de Custos Mensais

| Serviço | Custo |
|---|---|
| App Platform — Backend | US$ 5/mês |
| App Platform — Frontend | Grátis |
| Managed PostgreSQL | US$ 15/mês |
| Domínio sinergya.app.br | R$ 40/ano |
| **TOTAL** | **~US$ 20/mês + R$ 3,50/mês** |

---

## 🔄 Atualizações Futuras (muito fácil)

Depois que estiver no ar, toda vez que você fizer push no GitHub o deploy acontece **automaticamente**. Você não precisa fazer nada — a DigitalOcean detecta o push e atualiza o site sozinha.
