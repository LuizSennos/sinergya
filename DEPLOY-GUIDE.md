# 🚀 Guia de Deploy — Sinergya para Produção

## Domínio
- sinergya.app.br (Registro.br — Denilson de Oliveira)

## Stack
- Frontend: Vercel (grátis)
- Backend: Railway (~R$ 25/mês)
- Banco: Supabase (grátis)

## Passo 1 — Supabase
1. supabase.com → New Project → nome: sinergya
2. Settings → Database → Connection string → URI
3. Salvar: postgresql://postgres:[SENHA]@db.xxxx.supabase.co:5432/postgres

## Passo 2 — Railway
1. railway.app → Deploy from GitHub
2. Root: sinergya-backend
3. Variáveis:
   DATABASE_URL=postgresql://... (Supabase)
   SECRET_KEY=chave-longa-aleatoria
   ALLOWED_ORIGINS=https://sinergya.app.br,https://www.sinergya.app.br

## Passo 3 — Vercel
1. vercel.com → Import Project → repo GitHub
2. Root directory: healthtech-mvp
3. Variável:
   NEXT_PUBLIC_API_URL=https://[railway-url].up.railway.app

## Passo 4 — DNS Registro.br
Editar zona DNS do sinergya.app.br:
  CNAME  www  cname.vercel-dns.com
  A      @    76.76.21.21

## Migração B → C (quando tiver receita)
- Railway: upgrade de plano (1 clique)
- Supabase: upgrade de plano (dados preservados)
- Vercel: upgrade de plano
- Tempo estimado: ~30 minutos, zero mudança de código
