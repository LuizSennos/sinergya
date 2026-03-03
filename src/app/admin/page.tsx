"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiAdminStats, apiAdminUsers, apiAdminLogs, apiCreatePatient, apiBindPatientToUser, apiToggleUserStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NewUserModal from "@/components/NewUserModal";

// Removido: apiGetPatients — admin não acessa dados clínicos (LGPD)
// Removida: aba "Pacientes" com dados clínicos

type AdminTab = "stats" | "users" | "logs";

const roleLabel: Record<string, string> = {
  admin: "Admin", profissional: "Profissional", academico: "Acadêmico",
  supervisor: "Supervisor", paciente: "Paciente", responsavel: "Responsável"
};
const roleColor: Record<string, string> = {
  admin: "bg-red-50 text-red-600",
  profissional: "bg-blue-50 text-blue-600",
  academico: "bg-purple-50 text-purple-600",
  supervisor: "bg-amber-50 text-amber-600",
  paciente: "bg-emerald-50 text-emerald-600",
  responsavel: "bg-slate-100 text-slate-500",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) window.location.href = "/login";
  }, [user, loading]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    reload();
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (activeTab === "logs" && logs.length === 0) apiAdminLogs().then(setLogs).catch(console.error);
  }, [activeTab, user]);

  async function reload() {
    setDataLoading(true);
    try {
      const [s, u] = await Promise.all([
        apiAdminStats().catch(() => null),
        apiAdminUsers().catch(() => []),
      ]);
      if (s) setStats(s);
      setUsers(u ?? []);
    } finally { setDataLoading(false); }
  }

  async function handleToggleUser(userId: string, currentStatus: boolean) {
    if (userId === user?.user_id) { alert("Você não pode desativar sua própria conta."); return; }
    setTogglingId(userId);
    try {
      await apiToggleUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
    } catch (err: any) { alert(err.message); }
    finally { setTogglingId(null); }
  }

  if (loading || !user || user.role !== "admin") return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7fbf9" }}>
      <p className="text-slate-400 text-sm">Verificando acesso...</p>
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "radial-gradient(ellipse at 60% 0%, rgba(30,140,104,0.07) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(42,127,196,0.06) 0%, transparent 40%), #f7fbf9" }}>

      {/* HEADER */}
      <header className="px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ background: "rgba(247,251,249,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(30,140,104,0.1)" }}>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sinergya" width={32} height={32} priority
            style={{ filter: "drop-shadow(0 2px 6px rgba(30,140,104,0.2))" }} />
          <span className="text-base font-bold" style={{ color: "#1a3d2b" }}>Sinergya</span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "rgba(30,140,104,0.1)", color: "#1e8c68" }}>Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(30,140,104,0.15)", color: "#1e8c68" }}>
              {user.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Administrador</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">

        {/* TÍTULO + AÇÕES */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800">Painel Administrativo</h1>
              <p className="text-xs text-slate-400 mt-0.5">Gerencie usuários e visualize métricas do sistema</p>
            </div>
            <button onClick={() => setShowActions(!showActions)}
              className="md:hidden w-9 h-9 rounded-xl text-white flex items-center justify-center text-xl font-light shadow-lg"
              style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}>
              {showActions ? "×" : "+"}
            </button>
          </div>

          <div className="hidden md:flex gap-2 flex-wrap mt-4">
            <button onClick={() => setShowNewUser(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:shadow-md"
              style={{ background: "white", border: "1.5px solid rgba(42,127,196,0.3)", color: "#2a7fc4" }}>
              + Novo usuário
            </button>
          </div>

          {showActions && (
            <div className="md:hidden flex flex-col gap-2 mt-3">
              <button onClick={() => { setShowNewUser(true); setShowActions(false); }}
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-white"
                style={{ border: "1.5px solid rgba(42,127,196,0.3)", color: "#2a7fc4" }}>
                + Novo usuário
              </button>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-0.5 mb-6 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(30,140,104,0.1)" }}>
          {([
            ["stats", "📊 Indicadores"],
            ["users", "👥 Usuários"],
            ["logs", "📋 Auditoria"],
          ] as [AdminTab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-1 px-3 py-2 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap"
              style={activeTab === key ? { background: "white", color: "#1e8c68", boxShadow: "0 2px 8px rgba(30,140,104,0.12)" } : { color: "#94a3b8" }}>
              {label}
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#1e8c68", borderTopColor: "transparent" }} />
          </div>
        )}

        {/* STATS */}
        {!dataLoading && activeTab === "stats" && stats && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Usuários ativos", value: stats.active_users, color: "#1e8c68", bg: "rgba(30,140,104,0.08)", icon: "✅" },
                { label: "Total usuários", value: stats.total_users, color: "#2a7fc4", bg: "rgba(42,127,196,0.08)", icon: "👥" },
                { label: "Tarefas criadas", value: stats.total_tasks, color: "#c9a227", bg: "rgba(201,162,39,0.08)", icon: "✅" },
                { label: "Logs de auditoria", value: stats.total_audit_logs, color: "#7c3aed", bg: "rgba(124,58,237,0.08)", icon: "📋" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 bg-white border border-slate-100"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <span className="text-base">{s.icon}</span>
                  </div>
                  <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 className="text-sm font-bold text-slate-700 mb-4">Usuários por perfil</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(stats.users_by_role ?? {}).map(([role, count]: any) => (
                  <div key={role} className="text-center p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${roleColor[role] ?? "bg-slate-100 text-slate-600"}`}>
                      {roleLabel[role] ?? role}
                    </span>
                    <p className="text-xl font-black text-slate-800">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {!dataLoading && activeTab === "users" && (
          <>
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm">
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    {["Nome", "Email", "Perfil", "LGPD", "Cadastro", "Ações"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-300 text-xs">Nenhum usuário cadastrado.</td></tr>
                  )}
                  {users.map((u: any) => (
                    <tr key={u.id} className={`transition-colors ${u.is_active ? "hover:bg-slate-50/50" : "opacity-50"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: u.is_active ? "rgba(30,140,104,0.1)" : "#f1f5f9", color: u.is_active ? "#1e8c68" : "#94a3b8" }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor[u.role] ?? "bg-slate-100 text-slate-500"}`}>
                          {roleLabel[u.role] ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${u.lgpd_consent ? "text-emerald-500" : "text-red-400"}`}>
                          {u.lgpd_consent ? "✓ Sim" : "✗ Não"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleUser(u.id, u.is_active)}
                          disabled={togglingId === u.id || u.id === user.user_id}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 ${u.is_active ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                          {togglingId === u.id ? "..." : u.is_active ? "Desativar" : "Ativar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {users.map((u: any) => (
                <div key={u.id} className={`bg-white rounded-2xl p-4 border border-slate-100 ${!u.is_active ? "opacity-50" : ""}`}
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: "rgba(30,140,104,0.1)", color: "#1e8c68" }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleToggleUser(u.id, u.is_active)}
                      disabled={togglingId === u.id || u.id === user.user_id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 disabled:opacity-30 ${u.is_active ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}>
                      {togglingId === u.id ? "..." : u.is_active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor[u.role] ?? "bg-slate-100 text-slate-500"}`}>
                      {roleLabel[u.role] ?? u.role}
                    </span>
                    <span className={`text-xs font-medium ${u.lgpd_consent ? "text-emerald-500" : "text-red-400"}`}>
                      {u.lgpd_consent ? "✓ LGPD" : "✗ LGPD"}
                    </span>
                    <span className="text-xs text-slate-300 ml-auto">{formatDate(u.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* LOGS */}
        {activeTab === "logs" && (
          <>
            <div className="hidden md:block bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-sm">
                <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <tr>
                    {["Ação", "Perfil", "Entidade", "Detalhe", "Data"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-300 text-xs">Nenhum log registrado.</td></tr>
                  )}
                  {logs.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 font-semibold">{l.action}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor[l.user_role] ?? "bg-slate-100 text-slate-500"}`}>
                          {roleLabel[l.user_role] ?? l.user_role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{l.entity}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-xs">{l.detail}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{formatDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {logs.map((l: any) => (
                <div key={l.id} className="bg-white rounded-2xl p-4 border border-slate-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-700">{l.action}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor[l.user_role] ?? "bg-slate-100 text-slate-500"}`}>
                      {roleLabel[l.user_role] ?? l.user_role}
                    </span>
                    <span className="text-xs text-slate-300 ml-auto">{formatDate(l.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{l.detail}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showNewUser && (
        <NewUserModal
          onClose={() => setShowNewUser(false)}
          onCreated={async () => { setShowNewUser(false); await reload(); setActiveTab("users"); }}
        />
      )}
    </main>
  );
}