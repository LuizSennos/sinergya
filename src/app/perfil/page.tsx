"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiMe, apiUpdateProfile, apiUpdatePassword } from "@/lib/api";

const BRAND = "linear-gradient(135deg, #1e8c68 0%, #2a7fc4 100%)";

const ROLE_LABELS: Record<string, string> = {
  profissional: "Profissional",
  supervisor: "Supervisor",
  academico: "Acadêmico",
  admin: "Administrador",
  paciente: "Paciente",
  responsavel: "Responsável",
};

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  profissional: { bg: "rgba(30,140,104,0.1)", color: "#1e8c68" },
  supervisor:   { bg: "rgba(124,58,237,0.1)", color: "#7c3aed" },
  academico:    { bg: "rgba(42,127,196,0.1)", color: "#2a7fc4" },
  admin:        { bg: "rgba(239,68,68,0.1)",  color: "#ef4444" },
  paciente:     { bg: "rgba(30,140,104,0.1)", color: "#1e8c68" },
  responsavel:  { bg: "rgba(201,162,39,0.1)", color: "#c9a227" },
};

type Section = "perfil" | "senha" | "lgpd";

export default function PerfilPage() {
  const { user, logout, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [section, setSection] = useState<Section>("perfil");

  // ── Editar nome ──
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // ── Trocar senha ──
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { logout(); return; }
    apiMe()
      .then(data => { setProfile(data); setNewName(data.name); })
      .catch(() => logout())
      .finally(() => setDataLoading(false));
  }, [loading]);

  async function handleSaveName() {
    if (!newName.trim()) return;
    setSavingName(true);
    setNameError("");
    try {
      await apiUpdateProfile(newName.trim());
      setProfile((p: any) => ({ ...p, name: newName.trim() }));
      refreshUser();
      setEditName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (e: any) {
      setNameError(e.message || "Erro ao salvar.");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePassword() {
    setPwdError("");
    if (!currentPwd || !newPwd || !confirmPwd) { setPwdError("Preencha todos os campos."); return; }
    if (newPwd.length < 6) { setPwdError("Nova senha deve ter ao menos 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem."); return; }
    setSavingPwd(true);
    try {
      await apiUpdatePassword(currentPwd, newPwd);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setPwdSuccess(true);
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (e: any) {
      setPwdError(e.message || "Erro ao trocar senha.");
    } finally {
      setSavingPwd(false);
    }
  }

  if (loading || dataLoading) return (
    <div className="flex h-full items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1e8c68", borderTopColor: "transparent" }} />
    </div>
  );

  if (!profile) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-slate-400 text-sm">Erro ao carregar perfil.</p>
    </div>
  );

  const roleColor = ROLE_COLORS[profile.role] ?? ROLE_COLORS.profissional;

  const navItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    {
      key: "perfil",
      label: "Dados pessoais",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    },
    {
      key: "senha",
      label: "Segurança",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    },
    {
      key: "lgpd",
      label: "Privacidade & LGPD",
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#f7fbf9" }}>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => window.history.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors border border-slate-200 text-slate-400 hover:text-slate-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">Meu Perfil</h1>
            <p className="text-xs text-slate-400 mt-0.5">Gerencie suas informações pessoais</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar nav */}
          <aside className="md:w-56 flex-shrink-0">
            {/* Avatar card */}
            <div className="rounded-3xl p-5 mb-4 text-center"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-3"
                style={{ background: BRAND }}>
                {profile.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="text-sm font-black text-slate-800 leading-tight truncate">{profile.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{profile.email}</p>
              <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: roleColor.bg, color: roleColor.color }}>
                {ROLE_LABELS[profile.role] ?? profile.role}
              </span>
            </div>

            {/* Nav */}
            <nav className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.08)" }}>
              {navItems.map((item, i) => (
                <button key={item.key} onClick={() => setSection(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${i < navItems.length - 1 ? "border-b border-slate-50" : ""}`}
                  style={section === item.key
                    ? { background: "rgba(30,140,104,0.06)", color: "#1e8c68" }
                    : { color: "#64748b" }}>
                  <span style={{ color: section === item.key ? "#1e8c68" : "#94a3b8" }}>{item.icon}</span>
                  <span className="text-xs font-semibold">{item.label}</span>
                  {section === item.key && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#1e8c68" }} />
                  )}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <button onClick={logout}
              className="w-full mt-4 py-3 rounded-2xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sair da conta
            </button>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* ── DADOS PESSOAIS ── */}
            {section === "perfil" && (
              <div className="rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2"
                  style={{ background: "rgba(30,140,104,0.03)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span className="text-sm font-bold text-slate-700">Dados pessoais</span>
                </div>
                <div className="p-6 space-y-5">

                  {/* Nome */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nome completo</label>
                    {editName ? (
                      <div className="flex gap-2">
                        <input value={newName} onChange={e => setNewName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setEditName(false); setNewName(profile.name); } }}
                          autoFocus
                          className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition"
                          style={{ borderColor: "#1e8c68", boxShadow: "0 0 0 3px rgba(30,140,104,0.08)", background: "#fff" }} />
                        <button onClick={handleSaveName} disabled={savingName || !newName.trim()}
                          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition disabled:opacity-50"
                          style={{ background: BRAND }}>
                          {savingName ? "..." : "Salvar"}
                        </button>
                        <button onClick={() => { setEditName(false); setNewName(profile.name); }}
                          className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-2xl"
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <span className="text-sm font-semibold text-slate-800">{profile.name}</span>
                        <button onClick={() => setEditName(true)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:bg-white"
                          style={{ color: "#1e8c68" }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                      </div>
                    )}
                    {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    {nameSuccess && <p className="text-xs mt-1" style={{ color: "#1e8c68" }}>✓ Nome atualizado com sucesso!</p>}
                  </div>

                  {/* Email (só leitura) */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">E-mail</label>
                    <div className="flex items-center justify-between p-4 rounded-2xl"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span className="text-sm text-slate-600">{profile.email}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">Não editável</span>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Função</label>
                    <div className="p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold"
                        style={{ color: roleColor.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ background: roleColor.color }} />
                        {ROLE_LABELS[profile.role] ?? profile.role}
                      </span>
                    </div>
                  </div>

                  {/* Especialidade (se tiver) */}
                  {profile.specialty && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Especialidade</label>
                      <div className="p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <span className="text-sm text-slate-700">{profile.specialty}</span>
                      </div>
                    </div>
                  )}

                  {/* Nº do conselho (se tiver) */}
                  {profile.council_number && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nº do Conselho</label>
                      <div className="p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <span className="text-sm text-slate-700">{profile.council_number}</span>
                      </div>
                    </div>
                  )}

                  {/* Membro desde */}
                  {profile.created_at && (
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Membro desde</label>
                      <div className="p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <span className="text-sm text-slate-600">
                          {new Date(profile.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SEGURANÇA ── */}
            {section === "senha" && (
              <div className="rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2"
                  style={{ background: "rgba(30,140,104,0.03)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span className="text-sm font-bold text-slate-700">Trocar senha</span>
                </div>
                <div className="p-6 space-y-4">
                  {pwdSuccess && (
                    <div className="px-4 py-3 rounded-2xl text-sm font-semibold"
                      style={{ background: "rgba(30,140,104,0.08)", color: "#1e8c68", border: "1px solid rgba(30,140,104,0.15)" }}>
                      ✓ Senha alterada com sucesso!
                    </div>
                  )}
                  {pwdError && (
                    <div className="px-4 py-3 rounded-2xl text-sm"
                      style={{ background: "rgba(239,68,68,0.06)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
                      {pwdError}
                    </div>
                  )}

                  {[
                    { label: "Senha atual", value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                    { label: "Nova senha", value: newPwd, set: setNewPwd, show: showNew, toggle: () => setShowNew(v => !v) },
                    { label: "Confirmar nova senha", value: confirmPwd, set: setConfirmPwd, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">{field.label}</label>
                      <div className="relative">
                        <input type={field.show ? "text" : "password"} value={field.value}
                          onChange={e => field.set(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition pr-10"
                          style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                          onFocus={e => { e.currentTarget.style.borderColor = "#1e8c68"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,140,104,0.08)"; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }} />
                        <button type="button" onClick={field.toggle}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                          {field.show
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          }
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button onClick={handleSavePassword} disabled={savingPwd}
                      className="w-full py-3 rounded-2xl text-sm font-bold text-white transition disabled:opacity-50 hover:opacity-90 active:scale-[0.99]"
                      style={{ background: BRAND, boxShadow: "0 4px 12px rgba(30,140,104,0.3)" }}>
                      {savingPwd ? "Salvando..." : "Trocar senha"}
                    </button>
                  </div>

                  <div className="pt-2 p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                    <p className="text-xs font-bold text-slate-500 mb-2">Requisitos da senha</p>
                    <ul className="space-y-1">
                      {["Mínimo 6 caracteres", "Use letras e números para maior segurança"].map(r => (
                        <li key={r} className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── LGPD ── */}
            {section === "lgpd" && (
              <div className="rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2"
                  style={{ background: "rgba(30,140,104,0.03)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span className="text-sm font-bold text-slate-700">Privacidade & LGPD</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-4 rounded-2xl flex items-start gap-3"
                    style={{ background: "rgba(30,140,104,0.06)", border: "1px solid rgba(30,140,104,0.12)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2" className="flex-shrink-0 mt-0.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Consentimento LGPD</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Você aceitou os termos de uso e política de privacidade da Sinergya, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                      </p>
                      {profile.lgpd_consent_at && (
                        <p className="text-xs mt-2" style={{ color: "#1e8c68" }}>
                          ✓ Aceito em {new Date(profile.lgpd_consent_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>

                  {[
                    { title: "Dados coletados", desc: "Nome, e-mail, dados clínicos de comunicação e registros de acesso para fins de prestação do serviço de saúde." },
                    { title: "Finalidade", desc: "Os dados são utilizados exclusivamente para comunicação entre pacientes e equipes de saúde na plataforma Sinergya." },
                    { title: "Seus direitos", desc: "Você pode solicitar acesso, correção ou exclusão dos seus dados entrando em contato com nosso suporte." },
                    { title: "Segurança", desc: "Seus dados são protegidos com criptografia em trânsito e em repouso, com acesso restrito à equipe autorizada." },
                  ].map(item => (
                    <div key={item.title} className="p-4 rounded-2xl" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <p className="text-xs font-bold text-slate-700 mb-1">{item.title}</p>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}

                  <a href="mailto:privacidade@sinergya.app.br"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition hover:opacity-80"
                    style={{ background: "rgba(30,140,104,0.06)", color: "#1e8c68", border: "1px solid rgba(30,140,104,0.12)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    Contatar privacidade@sinergya.app.br
                  </a>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}