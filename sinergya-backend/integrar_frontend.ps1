# Script de integracao frontend — Sinergya
# Rode dentro da pasta healthtech-mvp
# .\integrar_frontend.ps1

Write-Host "Criando arquivos de integracao..." -ForegroundColor Cyan

# Cria pastas necessarias
New-Item -ItemType Directory -Force -Path src\lib | Out-Null
New-Item -ItemType Directory -Force -Path src\context | Out-Null

# ===== .env.local =====
@"
NEXT_PUBLIC_API_URL=http://localhost:8000
"@ | Set-Content .env.local

# ===== src/lib/api.ts =====
@"
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`\${API_URL}\${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer \${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Erro inesperado.' }));
    throw new Error(error.detail || 'Erro na requisicao.');
  }
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const data = await request<{ access_token: string; role: string; name: string; user_id: string; lgpd_consent: boolean }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('role', data.role);
  localStorage.setItem('name', data.name);
  localStorage.setItem('user_id', data.user_id);
  return data;
}

export function apiLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('name');
  localStorage.removeItem('user_id');
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    role: localStorage.getItem('role') || '',
    name: localStorage.getItem('name') || '',
    user_id: localStorage.getItem('user_id') || '',
  };
}

export async function apiGetPatients() { return request<any[]>('/patients/'); }
export async function apiGetPatient(id: string) { return request<any>(`/patients/\${id}`); }
export async function apiCreatePatient(data: any) { return request('/patients/', { method: 'POST', body: JSON.stringify(data) }); }

export async function apiGetMessages(patientId: string, context: 'assistencial' | 'tecnico') {
  return request<any[]>(`/messages/\${patientId}?context=\${context}`);
}
export async function apiSendMessage(patientId: string, context: 'assistencial' | 'tecnico', content: string) {
  return request('/messages/', { method: 'POST', body: JSON.stringify({ patient_id: patientId, context, content }) });
}

export async function apiGetDiary(patientId: string) { return request<any[]>(`/diary/\${patientId}`); }
export async function apiGetTasks(patientId: string) { return request<any[]>(`/tasks/\${patientId}`); }
export async function apiCreateTask(patientId: string, title: string, description?: string) {
  return request('/tasks/', { method: 'POST', body: JSON.stringify({ patient_id: patientId, title, description }) });
}
export async function apiMarkTaskDone(taskId: string, isDone: boolean) {
  return request(`/tasks/\${taskId}/done`, { method: 'PATCH', body: JSON.stringify({ is_done: isDone }) });
}
export async function apiAdminStats() { return request('/admin/stats'); }
export async function apiAdminUsers() { return request<any[]>('/admin/users'); }
"@ | Set-Content src\lib\api.ts

# ===== src/context/AuthContext.tsx =====
@"
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiLogin, apiLogout, getStoredUser } from '@/lib/api';

interface AuthUser {
  token: string;
  role: string;
  name: string;
  user_id: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password);
    setUser(getStoredUser());
    if (data.role === 'admin') router.push('/admin');
    else if (data.role === 'paciente' || data.role === 'responsavel') router.push('/paciente');
    else router.push('/patient/1');
  }

  function logout() {
    apiLogout();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
"@ | Set-Content src\context\AuthContext.tsx

# ===== src/app/layout.tsx =====
@"
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = { title: 'Sinergya' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR'>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
"@ | Set-Content src\app\layout.tsx

# ===== src/app/(dashboard)/layout.tsx =====
@"
import Sidebar from '@/components/SidePanel';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='flex h-screen bg-sinergya-background overflow-hidden'>
      <Sidebar />
      <section className='flex-1 m-4 ml-0 rounded-2xl bg-white shadow-soft overflow-hidden flex flex-col'>
        {children}
      </section>
    </main>
  );
}
"@ | Set-Content "src\app\(dashboard)\layout.tsx"

# ===== src/app/login/page.tsx =====
@"
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='min-h-screen bg-sinergya-background flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
          <div className='px-10 pt-10 pb-8 text-white' style={{ background: 'linear-gradient(135deg, #0F172A, #1e293b, #1a3a5c)' }}>
            <div className='flex justify-center mb-8'>
              <Image src='/logo.png' alt='Sinergya' width={180} height={50} priority />
            </div>
            <h1 className='text-2xl font-bold'>Bem-vindo de volta</h1>
            <p className='mt-1 text-sm text-white/50'>Plataforma multiprofissional de saude</p>
          </div>
          <form onSubmit={handleLogin} className='px-10 py-8 space-y-5'>
            <div className='space-y-1.5'>
              <label className='block text-xs font-semibold uppercase tracking-wider text-slate-500'>E-mail</label>
              <input type='email' required value={email} onChange={e => setEmail(e.target.value)} placeholder='seu@email.com'
                className='w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sinergya-green/40 focus:border-sinergya-green transition' />
            </div>
            <div className='space-y-1.5'>
              <label className='block text-xs font-semibold uppercase tracking-wider text-slate-500'>Senha</label>
              <input type='password' required value={password} onChange={e => setPassword(e.target.value)} placeholder='••••••••'
                className='w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sinergya-green/40 focus:border-sinergya-green transition' />
            </div>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl'>{error}</div>
            )}
            <button type='submit' disabled={loading}
              className='w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60'
              style={{ background: 'linear-gradient(135deg, #4FBF9F, #63D2C6, #3A7BD5)' }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <div className='px-10 pb-8 text-center'>
            <span className='text-xs text-slate-400'>Dados protegidos conforme a LGPD</span>
          </div>
        </div>
      </div>
    </main>
  );
}
"@ | Set-Content src\app\login\page.tsx

# ===== src/components/SidePanel.tsx =====
@"
'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGetPatients } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetPatients().then(setPatients).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <aside className='w-72 bg-sinergya-dark text-white rounded-2xl shadow-soft m-4 flex flex-col flex-shrink-0'>
      <div className='px-4 py-5 flex justify-center border-b border-white/10'>
        <Image src='/logo.png' alt='Sinergya' width={180} height={50} priority />
      </div>
      <div className='px-6 py-4 text-xs font-semibold tracking-widest text-white/60'>PACIENTES</div>
      <nav className='flex-1 px-3 space-y-1 overflow-y-auto'>
        {loading && <div className='px-4 py-3 text-xs text-white/40'>Carregando...</div>}
        {!loading && patients.length === 0 && <div className='px-4 py-3 text-xs text-white/40'>Nenhum paciente vinculado.</div>}
        {patients.map((p: any) => {
          const isActive = pathname === `/patient/\${p.id}`;
          return (
            <button key={p.id} onClick={() => router.push(`/patient/\${p.id}`)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all border-l-4 \${isActive ? 'bg-white/10 border-sinergya-green' : 'hover:bg-white/5 border-transparent'}`}>
              <p className='font-medium text-sm'>{p.name}</p>
              <span className='text-xs text-white/60'>{p.specialties}</span>
              {p.is_minor && <span className='ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full'>Menor</span>}
            </button>
          );
        })}
      </nav>
      <div className='px-4 py-4 border-t border-white/10'>
        <div className='flex items-center gap-3 px-2'>
          <div className='w-8 h-8 rounded-full bg-sinergya-green/30 flex items-center justify-center text-sinergya-green text-xs font-bold'>
            {user?.name?.[0] ?? '?'}
          </div>
          <div>
            <p className='text-xs font-medium'>{user?.name ?? 'Usuario'}</p>
            <p className='text-xs text-white/50 capitalize'>{user?.role ?? ''}</p>
          </div>
          <button onClick={logout} className='ml-auto text-white/30 hover:text-white/70 transition' title='Sair'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/>
              <polyline points='16 17 21 12 16 7'/><line x1='21' y1='12' x2='9' y2='12'/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
"@ | Set-Content src\components\SidePanel.tsx

Write-Host ""
Write-Host "Integracao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Arquivos criados/atualizados:" -ForegroundColor Yellow
Write-Host "  .env.local"
Write-Host "  src/lib/api.ts"
Write-Host "  src/context/AuthContext.tsx"
Write-Host "  src/app/layout.tsx"
Write-Host "  src/app/(dashboard)/layout.tsx"
Write-Host "  src/app/login/page.tsx"
Write-Host "  src/components/SidePanel.tsx"
Write-Host ""
Write-Host "Teste em: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "Login: admin@sinergya.com / admin123" -ForegroundColor Cyan
