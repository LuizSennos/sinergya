"use client";

import { useState } from "react";
import Image from "next/image";
import { apiLogin } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiLogin(email, password);

      // Redireciona por role com navegação completa
      if (data.role === "admin") {
        window.location.href = "/admin";
      } else if (data.role === "paciente" || data.role === "responsavel") {
        window.location.href = "/paciente";
      } else {
        window.location.href = "/patient/1";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sinergya-background flex items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-sinergya-green/8 blur-3xl" />
        <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] rounded-full bg-sinergya-blue/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="px-10 pt-10 pb-8 text-white" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1e293b 60%, #1a3a5c 100%)" }}>
            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="Sinergya" width={180} height={50} priority />
            </div>
            <h1 className="text-2xl font-bold">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-white/50">Plataforma multiprofissional de saúde</p>
          </div>

          <form onSubmit={handleLogin} className="px-10 py-8 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">E-mail</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sinergya-green/40 focus:border-sinergya-green transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Senha</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sinergya-green/40 focus:border-sinergya-green transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold tracking-wide transition-all disabled:opacity-60"
              style={{ background: loading ? "#64748b" : "linear-gradient(135deg, #4FBF9F 0%, #63D2C6 50%, #3A7BD5 100%)", boxShadow: loading ? "none" : "0 4px 20px rgba(79,191,159,0.35)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Entrando...
                </span>
              ) : "Entrar"}
            </button>
          </form>

          <div className="px-10 pb-8 text-center">
            <span className="text-xs text-slate-400">🔒 Dados protegidos conforme a LGPD</span>
          </div>
        </div>
        <p className="text-center mt-4 text-xs text-slate-400">Sinergya MVP v0.1</p>
      </div>
    </main>
  );
}