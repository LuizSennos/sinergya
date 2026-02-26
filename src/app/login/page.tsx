"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
      if (data.role === "admin") { window.location.href = "/admin"; }
      else if (data.role === "paciente" || data.role === "responsavel") { window.location.href = "/paciente"; }
      else {
        const { apiGetPatients } = await import("@/lib/api");
        const ps = await apiGetPatients();
        window.location.href = ps && ps.length > 0 ? `/patient/${ps[0].id}` : "/sem-pacientes";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #EEF7F4 0%, #F0F6FF 50%, #EBF4FF 100%)" }}>

      {/* Blobs de identidade Sinergya */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-35"
          style={{ background: "radial-gradient(circle, #4FBF9F, transparent 70%)" }} />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: "radial-gradient(circle, #3A7BD5, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{ background: "radial-gradient(circle, #63D2C6, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-sm">

        {/* Card glassmorphism */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 20px 60px rgba(15,23,42,0.1), 0 0 0 1px rgba(255,255,255,0.8)"
          }}>

          {/* Header dark — azul da landing */}
          <div className="px-8 pt-8 pb-7 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0F172A 0%, #1e293b 60%, #1a3a5c 100%)" }}>
            {/* Glow sutil */}
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, #4FBF9F, transparent)" }} />
            <Image src="/logo.png" alt="Sinergya" width={150} height={42} priority className="mx-auto mb-4 relative" />
            <h1 className="text-xl font-bold relative" style={{ color: "#ffffff" }}>Bem-vindo de volta</h1>
            <p className="text-sm mt-1 relative" style={{ color: "rgba(255,255,255,0.5)" }}>Plataforma multiprofissional de saúde</p>
          </div>

          {/* Linha decorativa gradiente */}
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #4FBF9F, #63D2C6, #3A7BD5)" }} />

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#94A3B8" }}>
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition"
                  style={{ background: "rgba(248,250,252,0.8)", border: "1.5px solid #E2E8F0", color: "#0F172A" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#4FBF9F"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "rgba(248,250,252,0.8)"; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#94A3B8" }}>
                Senha
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94A3B8" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm outline-none transition"
                  style={{ background: "rgba(248,250,252,0.8)", border: "1.5px solid #E2E8F0", color: "#0F172A" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#4FBF9F"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "rgba(248,250,252,0.8)"; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-70"
                  style={{ color: "#94A3B8" }}>
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: loading ? "#94A3B8" : "linear-gradient(135deg, #4FBF9F 0%, #63D2C6 40%, #3A7BD5 100%)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(79,191,159,0.45)"
              }}>
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Entrando...
                  </span>
                : "Entrar na plataforma"
              }
            </button>
          </form>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs" style={{ color: "#94A3B8" }}>🔒 Dados protegidos conforme a LGPD</p>
          </div>
        </div>

        {/* Links fora do card */}
        <div className="mt-5 flex items-center justify-between px-1">
          <Link href="/landing" className="text-xs transition hover:opacity-80" style={{ color: "#64748B" }}>
            ← Voltar para o início
          </Link>
          <p className="text-xs" style={{ color: "#94A3B8" }}>Sinergya MVP v0.1</p>
        </div>
      </div>
    </main>
  );
}