"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Patient {
  id: string;
  name: string;
  specialties: string;
  is_minor: boolean;
}

interface SidebarProps {
  onNavigate?: () => void;
  patients: Patient[];
  patientsLoading: boolean;
}

const SIDEBAR_BG =
  "radial-gradient(circle at 20% 20%, rgba(30,140,104,0.10), transparent 40%), radial-gradient(circle at 80% 10%, rgba(42,127,196,0.10), transparent 40%), #f7fbf9";

type ModalSection = "menu" | "conta" | "configuracoes" | "notificacoes" | "ajuda";

export default function Sidebar({ onNavigate, patients, patientsLoading }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [section, setSection] = useState<ModalSection>("menu");

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifMensagens, setNotifMensagens] = useState(true);
  const [notifTarefas, setNotifTarefas] = useState(false);
  const [tema, setTema] = useState<"claro" | "sistema">("claro");
  const [idioma, setIdioma] = useState("pt-BR");

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.specialties?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  // Só mostra loading se não tiver nada ainda (primeiro carregamento)
  // Se já tem pacientes, mantém a lista visível enquanto recarrega — sem flash
  const showSkeleton = patientsLoading && patients.length === 0;

  function navigate(path: string) {
    router.push(path);
    setModalOpen(false);
    setSection("menu");
    onNavigate?.();
  }

  function openModal() {
    setSection("menu");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setTimeout(() => setSection("menu"), 300);
  }

  function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
      <button
        onClick={onChange}
        className="relative rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: on ? "linear-gradient(135deg, #1e8c68, #2a7fc4)" : "#e2e8f0", width: 40, height: 22 }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-300"
          style={{ width: 18, height: 18, left: on ? 20 : 2 }}
        />
      </button>
    );
  }

  function BackButton({ label }: { label: string }) {
    return (
      <button onClick={() => setSection("menu")} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        <span className="text-xs font-medium">{label}</span>
      </button>
    );
  }

  return (
    <>
      <aside
        className="w-72 h-full md:rounded-3xl md:shadow-xl md:m-4 flex flex-col flex-shrink-0 border border-[#E6EEF8]"
        style={{ background: SIDEBAR_BG, backdropFilter: "blur(10px)" }}
      >
        {/* Logo */}
        <div className="px-5 py-4 flex items-center justify-center gap-2.5 border-b border-[#E6EEF8]">
          <Image
            src="/logo.png"
            alt="Sinergya"
            width={36}
            height={36}
            priority
            style={{ filter: "drop-shadow(0 2px 8px rgba(30,140,104,0.18))" }}
          />
          <span className="text-lg font-bold tracking-tight" style={{ color: "#1a3d2b" }}>
            Sinergya
          </span>
        </div>

        {/* Busca */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="w-full bg-white text-slate-700 text-sm placeholder:text-slate-500 pl-9 pr-3 py-2.5 rounded-xl outline-none transition border border-[#E6EEF8] focus:ring-2 focus:ring-[#1e8c68]/30"
            />
          </div>
        </div>

        {/* Label */}
        <div className="px-6 py-3 text-xs font-semibold tracking-wider text-slate-400 flex items-center justify-between">
          <span>PACIENTES</span>
          <div className="flex items-center gap-2">
            {/* Indicador sutil de refresh — sem sumir a lista */}
            {patientsLoading && patients.length > 0 && (
              <svg className="animate-spin text-slate-300" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            )}
            {patients.length > 0 && (
              <span className="text-slate-700">{filtered.length}/{patients.length}</span>
            )}
          </div>
        </div>

        {/* Lista */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {/* Skeleton só no primeiro carregamento (lista vazia) */}
          {showSkeleton && (
            <div className="space-y-1.5 px-1 pt-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "rgba(0,0,0,0.05)", opacity: 1 - i * 0.15 }} />
              ))}
            </div>
          )}

          {!showSkeleton && filtered.length === 0 && (
            <div className="px-4 py-3 text-sm text-slate-400">
              {search ? "Nenhum resultado." : "Nenhum paciente vinculado."}
            </div>
          )}

          {filtered.map(p => {
            const active = pathname === `/patient/${p.id}`;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                  active ? "text-white" : "text-slate-900 hover:bg-white"
                }`}
                style={active ? {
                  background: "linear-gradient(135deg, #1e8c67de, #2a7fc4)",
                  boxShadow: "0 6px 18px rgba(30,140,104,0.25)"
                } : {}}
              >
                <div className="font-medium">{p.name}</div>
                {p.specialties && (
                  <div className={`text-xs mt-0.5 ${active ? "text-white/70" : "text-slate-500"}`}>
                    {p.specialties}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[#E6EEF8]">
          <button onClick={openModal} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/70 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: "rgba(30,140,104,0.15)", color: "#1e8c68" }}>
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-800 truncate">{user?.name ?? "Usuário"}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role ?? ""}</p>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 flex-shrink-0">
              <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}
          onClick={closeModal}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.98)", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
            onClick={e => e.stopPropagation()}>

            {/* Cabeçalho */}
            <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-50"
              style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.05), rgba(42,127,196,0.04))" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white" }}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">{user?.name ?? "Usuário"}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role ?? ""}</p>
              </div>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Menu principal */}
            {section === "menu" && (
              <div className="py-2">
                {[
                  { key: "conta" as ModalSection, label: "Minha conta", sub: "Dados pessoais e preferências", color: "#1e8c68", bg: "rgba(30,140,104,0.09)",
                    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                  { key: "configuracoes" as ModalSection, label: "Configurações", sub: "Tema, idioma e plataforma", color: "#2a7fc4", bg: "rgba(42,127,196,0.09)",
                    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { key: "notificacoes" as ModalSection, label: "Notificações", sub: "Alertas e avisos da plataforma", color: "#c9a227", bg: "rgba(201,162,39,0.09)",
                    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
                  { key: "ajuda" as ModalSection, label: "Ajuda & Suporte", sub: "Documentação e contato", color: "#7c3aed", bg: "rgba(124,58,237,0.09)",
                    icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                ].map(item => (
                  <button key={item.key} onClick={() => setSection(item.key)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
                <div className="px-6 pb-4 pt-2">
                  <button onClick={logout} className="w-full py-3 rounded-2xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sair da conta
                  </button>
                </div>
              </div>
            )}

            {/* Minha conta */}
            {section === "conta" && (
              <div className="px-6 py-5">
                <BackButton label="Voltar" />
                <h3 className="text-base font-black text-slate-800 mb-4">Minha conta</h3>
                <div className="flex items-center gap-4 p-4 rounded-2xl mb-4"
                  style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.06), rgba(42,127,196,0.04))", border: "1px solid rgba(30,140,104,0.1)" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
                    style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white" }}>
                    {user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-black text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ background: "rgba(30,140,104,0.1)", color: "#1e8c68" }}>✓ LGPD aceito</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Perfil completo", sub: "Nome, foto e dados pessoais", href: "/perfil", icon: "👤" },
                    { label: "Segurança", sub: "Alterar senha e autenticação", href: "/perfil/seguranca", icon: "🔐" },
                    { label: "Privacidade & LGPD", sub: "Consentimento e dados", href: "/perfil/privacidade", icon: "🛡️" },
                  ].map(item => (
                    <button key={item.href} onClick={() => navigate(item.href)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.sub}</p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 flex-shrink-0">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Configurações */}
            {section === "configuracoes" && (
              <div className="px-6 py-5">
                <BackButton label="Voltar" />
                <h3 className="text-base font-black text-slate-800 mb-4">Configurações</h3>
                <div className="space-y-1">
                  <div className="p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aparência</p>
                    <div className="flex gap-2">
                      {(["claro", "sistema"] as const).map(t => (
                        <button key={t} onClick={() => setTema(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={tema === t
                            ? { background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white", boxShadow: "0 2px 8px rgba(30,140,104,0.3)" }
                            : { background: "white", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                          {t === "claro" ? "☀️ Claro" : "💻 Sistema"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Idioma</p>
                      <p className="text-xs text-slate-400">Idioma da interface</p>
                    </div>
                    <select value={idioma} onChange={e => setIdioma(e.target.value)}
                      className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border-none outline-none font-medium">
                      <option value="pt-BR">🇧🇷 Português</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Español</option>
                    </select>
                  </div>
                  {[
                    { label: "Acessibilidade", sub: "Tamanho de fonte e contraste", href: "/configuracoes/acessibilidade" },
                    { label: "Integrações", sub: "Conectar com outros sistemas", href: "/configuracoes/integracoes" },
                  ].map(item => (
                    <button key={item.href} onClick={() => navigate(item.href)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.sub}</p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notificações */}
            {section === "notificacoes" && (
              <div className="px-6 py-5">
                <BackButton label="Voltar" />
                <h3 className="text-base font-black text-slate-800 mb-4">Notificações</h3>
                <div className="space-y-1">
                  <div className="p-3 rounded-xl mb-2" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Canais</p>
                    <div className="space-y-3">
                      {[
                        { label: "E-mail", sub: "Resumo diário por e-mail", val: notifEmail, set: () => setNotifEmail(v => !v) },
                        { label: "Push", sub: "Notificações no navegador", val: notifPush, set: () => setNotifPush(v => !v) },
                      ].map(n => (
                        <div key={n.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{n.label}</p>
                            <p className="text-xs text-slate-400">{n.sub}</p>
                          </div>
                          <Toggle on={n.val} onChange={n.set} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Alertar sobre</p>
                    <div className="space-y-3">
                      {[
                        { label: "Novas mensagens", sub: "Grupos assistencial e técnico", val: notifMensagens, set: () => setNotifMensagens(v => !v) },
                        { label: "Tarefas pendentes", sub: "Lembretes de atividades", val: notifTarefas, set: () => setNotifTarefas(v => !v) },
                      ].map(n => (
                        <div key={n.label} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{n.label}</p>
                            <p className="text-xs text-slate-400">{n.sub}</p>
                          </div>
                          <Toggle on={n.val} onChange={n.set} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ajuda */}
            {section === "ajuda" && (
              <div className="px-6 py-5">
                <BackButton label="Voltar" />
                <h3 className="text-base font-black text-slate-800 mb-4">Ajuda & Suporte</h3>
                <div className="space-y-1">
                  {[
                    { icon: "📖", label: "Documentação", sub: "Guias e tutoriais de uso", href: "https://docs.sinergya.app.br" },
                    { icon: "💬", label: "Fale conosco", sub: "Abrir chamado de suporte", href: "/suporte" },
                    { icon: "🐛", label: "Reportar problema", sub: "Encontrou um bug?", href: "/suporte/bug" },
                    { icon: "📋", label: "Changelog", sub: "Novidades da plataforma", href: "/changelog" },
                  ].map(item => (
                    <button key={item.href} onClick={() => navigate(item.href)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.sub}</p>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 flex-shrink-0">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "#f8fafc" }}>
                  <p className="text-xs text-slate-400">Sinergya MVP <span className="font-semibold text-slate-600">v0.1</span></p>
                  <p className="text-[10px] text-slate-300 mt-0.5">© 2025 Sinergya · LGPD</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}