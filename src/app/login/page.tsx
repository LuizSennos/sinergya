"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiLogin } from "@/lib/api";

// ── Ilustração SVG animada original ──────────────────────────────────────────
function SinergyaIllustration() {
  return (
    <svg
      viewBox="0 0 400 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm mx-auto"
      aria-hidden
    >
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4FBF9F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4FBF9F" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3A7BD5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3A7BD5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4FBF9F" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3A7BD5" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>

        {/* Pulse animation filter */}
        <filter id="blur1">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* ── Glows de fundo ── */}
      <ellipse cx="200" cy="210" rx="160" ry="160" fill="url(#glow1)" />
      <ellipse cx="280" cy="150" rx="100" ry="100" fill="url(#glow2)" />

      {/* ── Linhas de conexão entre os nós ── */}
      {/* Centro → Topo */}
      <line x1="200" y1="210" x2="200" y2="95" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2s" repeatCount="indefinite" />
      </line>
      {/* Centro → Esquerda */}
      <line x1="200" y1="210" x2="85" y2="270" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.4s" repeatCount="indefinite" />
      </line>
      {/* Centro → Direita */}
      <line x1="200" y1="210" x2="315" y2="270" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="1.8s" repeatCount="indefinite" />
      </line>
      {/* Centro → Baixo esq */}
      <line x1="200" y1="210" x2="120" y2="345" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="3s" repeatCount="indefinite" />
      </line>
      {/* Centro → Baixo dir */}
      <line x1="200" y1="210" x2="280" y2="345" stroke="url(#lineGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3">
        <animate attributeName="stroke-dashoffset" from="0" to="-20" dur="2.6s" repeatCount="indefinite" />
      </line>

      {/* ── Partículas viajando pelas linhas ── */}
      <circle r="3" fill="#4FBF9F" opacity="0.8">
        <animateMotion dur="2s" repeatCount="indefinite">
          <mpath href="#path-top" />
        </animateMotion>
      </circle>
      <circle r="3" fill="#3A7BD5" opacity="0.8">
        <animateMotion dur="2.4s" repeatCount="indefinite" begin="0.5s">
          <mpath href="#path-left" />
        </animateMotion>
      </circle>
      <circle r="3" fill="#63D2C6" opacity="0.8">
        <animateMotion dur="1.8s" repeatCount="indefinite" begin="1s">
          <mpath href="#path-right" />
        </animateMotion>
      </circle>

      {/* Paths ocultos para animateMotion */}
      <path id="path-top" d="M200,210 L200,95" stroke="none" fill="none" />
      <path id="path-left" d="M200,210 L85,270" stroke="none" fill="none" />
      <path id="path-right" d="M200,210 L315,270" stroke="none" fill="none" />

      {/* ── NÓ CENTRAL — Paciente ── */}
      <circle cx="200" cy="210" r="46" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx="200" cy="210" r="38" fill="rgba(79,191,159,0.15)" stroke="#4FBF9F" strokeWidth="1.5" />
      {/* Pulso */}
      <circle cx="200" cy="210" r="38" fill="none" stroke="#4FBF9F" strokeWidth="1" opacity="0.4">
        <animate attributeName="r" from="38" to="56" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Ícone pessoa — paciente */}
      <circle cx="200" cy="202" r="9" fill="#4FBF9F" opacity="0.9" />
      <path d="M184 224 Q184 214 200 214 Q216 214 216 224" fill="#4FBF9F" opacity="0.9" />
      {/* Label */}
      <rect x="174" y="230" width="52" height="16" rx="8" fill="rgba(79,191,159,0.2)" />
      <text x="200" y="242" textAnchor="middle" fill="#a7f3d0" fontSize="8" fontFamily="system-ui" fontWeight="600">Paciente</text>

      {/* ── NÓ TOPO — Psicólogo ── */}
      <circle cx="200" cy="78" r="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="200" cy="78" r="26" fill="rgba(58,123,213,0.15)" stroke="#3A7BD5" strokeWidth="1.5" />
      <circle cx="200" cy="71" r="7" fill="#3A7BD5" opacity="0.9" />
      <path d="M188 88 Q188 80 200 80 Q212 80 212 88" fill="#3A7BD5" opacity="0.9" />
      {/* Cruz médica */}
      <rect x="196" y="58" width="8" height="3" rx="1.5" fill="white" opacity="0.6" />
      <rect x="198" y="56" width="4" height="7" rx="2" fill="white" opacity="0.6" />
      <rect x="174" y="96" width="52" height="14" rx="7" fill="rgba(58,123,213,0.2)" />
      <text x="200" y="107" textAnchor="middle" fill="#93c5fd" fontSize="7.5" fontFamily="system-ui" fontWeight="600">Psicóloga</text>

      {/* ── NÓ ESQUERDA — Fisioterapeuta ── */}
      <circle cx="72" cy="268" r="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="72" cy="268" r="26" fill="rgba(99,210,198,0.15)" stroke="#63D2C6" strokeWidth="1.5" />
      <circle cx="72" cy="261" r="7" fill="#63D2C6" opacity="0.9" />
      <path d="M60 278 Q60 270 72 270 Q84 270 84 278" fill="#63D2C6" opacity="0.9" />
      <rect x="46" y="286" width="52" height="14" rx="7" fill="rgba(99,210,198,0.2)" />
      <text x="72" y="297" textAnchor="middle" fill="#a5f3e8" fontSize="7" fontFamily="system-ui" fontWeight="600">Fisioterapeuta</text>

      {/* ── NÓ DIREITA — Fonoaudióloga ── */}
      <circle cx="328" cy="268" r="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="328" cy="268" r="26" fill="rgba(160,133,32,0.15)" stroke="#c9a227" strokeWidth="1.5" />
      <circle cx="328" cy="261" r="7" fill="#c9a227" opacity="0.9" />
      <path d="M316 278 Q316 270 328 270 Q340 270 340 278" fill="#c9a227" opacity="0.9" />
      <rect x="302" y="286" width="52" height="14" rx="7" fill="rgba(201,162,39,0.2)" />
      <text x="328" y="297" textAnchor="middle" fill="#fde68a" fontSize="7" fontFamily="system-ui" fontWeight="600">Fonoaudióloga</text>

      {/* ── Mini cards flutuantes ── */}
      {/* Card mensagem — topo esq */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-6; 0,0" dur="3s" repeatCount="indefinite" />
        <rect x="22" y="110" width="100" height="44" rx="10" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="36" cy="128" r="6" fill="#4FBF9F" opacity="0.8" />
        <rect x="46" y="123" width="64" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="46" y="131" width="44" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
        <rect x="28" y="141" width="78" height="3" rx="1.5" fill="rgba(255,255,255,0.12)" />
      </g>

      {/* Card check — dir topo */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,5; 0,0" dur="2.5s" repeatCount="indefinite" begin="0.8s" />
        <rect x="276" y="50" width="100" height="40" rx="10" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <rect x="286" y="62" width="60" height="3.5" rx="1.5" fill="rgba(255,255,255,0.25)" />
        <rect x="286" y="69" width="44" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
        {/* Check verde */}
        <circle cx="360" cy="65" r="8" fill="rgba(79,191,159,0.3)" />
        <path d="M356 65 L359 68 L364 62" stroke="#4FBF9F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* Card LGPD — baixo */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="3.5s" repeatCount="indefinite" begin="1.2s" />
        <rect x="130" y="368" width="140" height="38" rx="10" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <rect x="142" y="377" width="3" height="20" rx="1.5" fill="#4FBF9F" opacity="0.7" />
        <rect x="150" y="380" width="68" height="3.5" rx="1.5" fill="rgba(255,255,255,0.25)" />
        <rect x="150" y="387" width="48" height="3" rx="1.5" fill="rgba(255,255,255,0.15)" />
        <circle cx="254" cy="387" r="8" fill="rgba(79,191,159,0.2)" />
        <path d="M250 387 L253 384 L258 389 L253 392 Z" fill="none" stroke="#4FBF9F" strokeWidth="1.2" />
      </g>

      {/* ── Círculos decorativos de fundo ── */}
      <circle cx="60" cy="80" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="340" cy="360" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <circle cx="350" cy="130" r="14" fill="rgba(255,255,255,0.04)" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
    <main className="min-h-screen flex">

      {/* ── LADO ESQUERDO — Visual ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #f7fbf9 0%, #eef7f4 50%, #e8f5f0 100%)" }}
      >
        {/* Glows decorativos */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(30,140,104,0.25), transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(42,127,196,0.2), transparent 70%)", transform: "translate(30%, 30%)" }} />

        {/* Logo no topo */}
         <div className="flex items-center gap-2">
                   <Image
                     src="/logo.png"
                     alt="Sinergya"
                     width={48}
                     height={48}
                     priority
                     style={{ filter: "drop-shadow(0 2px 8px rgba(30,140,104,0.18))" }}
                   />
                   <span className="text-lg font-bold tracking-tight" style={{ color: "#1a3d2b" }}>
                     Sinergya
                   </span>
                 </div>

        {/* Ilustração central */}
        <div className="flex-1 flex items-center justify-center relative z-10 py-4">
          <div className="w-full max-w-md">
            <SinergyaIllustration />
          </div>
        </div>

        {/* Texto e tagline */}
        <div className="relative z-10">
          <h2 className="text-2xl font-bold leading-snug mb-3" style={{ color: "#1a3d2b" }}>
            Comunicação em saúde<br />
            <span style={{ color: "#1e8c68" }}>organizada e segura.</span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(15,40,30,0.5)" }}>
            Conecte sua equipe multiprofissional e acompanhe<br />
            cada paciente em tempo real, com total sigilo.
          </p>

          {/* Badges de confiança */}
          <div className="flex gap-3 mt-6">
            {[
              { icon: "🔒", label: "LGPD" },
              { icon: "⚡", label: "PWA" },
              { icon: "👥", label: "Multiprofissional" },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(15,40,30,0.6)" }}>
                <span>{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LADO DIREITO — Formulário ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 md:px-16 bg-white relative min-h-screen">

        {/* Logo mobile (só aparece em telas pequenas) */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <Image src="/logo.png" alt="Sinergya" width={36} height={36} priority />
          <span className="text-lg font-bold text-slate-800">Sinergya</span>
        </div>

        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Bem-vindo de volta</h1>
            <p className="text-sm text-slate-500">Utilize seu e-mail e senha para entrar.</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* E-mail */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition text-slate-800 placeholder:text-slate-400"
                  style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1e8c68"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,140,104,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <Link href="/forgot-password" className="text-xs font-medium transition hover:underline" style={{ color: "#1e8c68" }}>
                  Esqueceu sua senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 pr-11 py-3 rounded-xl text-sm outline-none transition text-slate-800 placeholder:text-slate-400"
                  style={{ border: "1.5px solid #E2E8F0", background: "#F8FAFC" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1e8c68"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,140,104,0.08)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: loading ? "#94A3B8" : "linear-gradient(135deg, #1e8c68, #2a7fc4)",
                boxShadow: loading ? "none" : "0 4px 20px rgba(30,140,104,0.35)",
              }}
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Entrando...
                  </span>
                : "Acessar conta"
              }
            </button>

          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <p className="text-xs text-center text-slate-400">🔒 Dados protegidos conforme a LGPD</p>
            <div className="flex items-center justify-between">
              <Link href="/landing" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                ← Voltar ao início
              </Link>
              <p className="text-xs text-slate-300">MVP v0.1</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}