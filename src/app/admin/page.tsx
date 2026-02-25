"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiAdminStats, apiAdminUsers, apiAdminLogs, apiCreatePatient, apiGetPatients, apiBindPatientToUser, apiToggleUserStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import NewUserModal from "@/components/NewUserModal";

type AdminTab = "stats" | "users" | "patients" | "logs";

const roleLabel: Record<string, string> = {
  admin: "Admin", profissional: "Profissional", academico: "Acadêmico",
  supervisor: "Supervisor", paciente: "Paciente", responsavel: "Responsável"
};
const roleColor: Record<string, string> = {
  admin: "bg-red-100 text-red-700", profissional: "bg-blue-100 text-blue-700",
  academico: "bg-purple-100 text-purple-700", supervisor: "bg-amber-100 text-amber-700",
  paciente: "bg-green-100 text-green-700", responsavel: "bg-slate-100 text-slate-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", specialties: "", is_minor: false });
  const [savingPatient, setSavingPatient] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showBindUser, setShowBindUser] = useState(false);
  const [bindPatientId, setBindPatientId] = useState("");
  const [bindUserId, setBindUserId] = useState("");
  const [savingBind, setSavingBind] = useState(false);
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
      const [s, u, p] = await Promise.all([
        apiAdminStats().catch(() => null),
        apiAdminUsers().catch(() => []),
        apiGetPatients().catch(() => []),
      ]);
      if (s) setStats(s);
      setUsers(u ?? []);
      setPatients(p ?? []);
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

  async function handleCreatePatient() {
    if (!newPatient.name.trim()) return;
    setSavingPatient(true);
    try {
      await apiCreatePatient(newPatient);
      await reload();
      setShowNewPatient(false);
      setNewPatient({ name: "", specialties: "", is_minor: false });
    } catch (err: any) { alert(err.message); }
    finally { setSavingPatient(false); }
  }

  async function handleBindUser() {
    if (!bindPatientId || !bindUserId) return;
    setSavingBind(true);
    try {
      await apiBindPatientToUser(bindPatientId, bindUserId);
      await reload();
      setShowBindUser(false);
      setBindPatientId(""); setBindUserId("");
    } catch (err: any) { alert(err.message); }
    finally { setSavingBind(false); }
  }

  if (loading || !user || user.role !== "admin") return (
    <div className="min-h-screen bg-sinergya-background flex items-center justify-center">
      <p className="text-slate-400 text-sm">Verificando acesso...</p>
    </div>
  );

  const pacientes = users.filter(u => ["paciente", "responsavel"].includes(u.role));

  return (
    <main className="min-h-screen bg-sinergya-background">
      {/* Header */}
      <header className="bg-sinergya-dark text-white px-4 md:px-8 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="Sinergya" width={140} height={40} />
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-white/50">Administrador</p>
          </div>
          <button onClick={logout} className="text-white/40 hover:text-white transition" title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-4 md:py-6 max-w-6xl mx-auto">
        {/* Título + botões */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-sinergya-dark">Painel Administrativo</h1>
            {/* Mobile: botão + */}
            <button onClick={() => setShowActions(!showActions)} className="md:hidden w-9 h-9 rounded-xl bg-sinergya-green text-white flex items-center justify-center text-xl font-light shadow">
              {showActions ? "×" : "+"}
            </button>
          </div>
          {/* Desktop: botões inline */}
          <div className="hidden md:flex gap-2 flex-wrap mt-2">
            <button onClick={() => setShowNewUser(true)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-sinergya-blue text-sinergya-blue hover:bg-sinergya-blue/5 transition">+ Novo usuário</button>
            <button onClick={() => setShowNewPatient(true)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>+ Novo paciente</button>
            <button onClick={() => setShowBindUser(true)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-sinergya-green text-sinergya-green hover:bg-sinergya-green/5 transition">Vincular usuário ↔ paciente</button>
          </div>
          {/* Mobile: botões expandíveis */}
          {showActions && (
            <div className="md:hidden flex flex-col gap-2 mt-2">
              <button onClick={() => { setShowNewUser(true); setShowActions(false); }} className="w-full px-4 py-3 rounded-xl text-sm font-semibold border border-sinergya-blue text-sinergya-blue bg-white">+ Novo usuário</button>
              <button onClick={() => { setShowNewPatient(true); setShowActions(false); }} className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>+ Novo paciente</button>
              <button onClick={() => { setShowBindUser(true); setShowActions(false); }} className="w-full px-4 py-3 rounded-xl text-sm font-semibold border border-sinergya-green text-sinergya-green bg-white">Vincular usuário ↔ paciente</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 mb-4 md:mb-6 bg-white rounded-t-xl px-2 md:px-4 overflow-x-auto">
          {([["stats","Indicadores"],["users","Usuários"],["patients","Pacientes"],["logs","Auditoria"]] as [AdminTab,string][]).map(([key,label]) => (
            <button key={key} onClick={() => setActiveTab(key as AdminTab)}
              className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab===key?"border-sinergya-green text-sinergya-green":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {dataLoading && <p className="text-slate-400 text-sm py-8 text-center">Carregando...</p>}

        {/* Stats */}
        {!dataLoading && activeTab === "stats" && stats && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Usuários ativos", value: stats.active_users, color: "text-sinergya-green" },
                { label: "Total usuários", value: stats.total_users, color: "text-sinergya-blue" },
                { label: "Pacientes", value: stats.total_patients, color: "text-amber-500" },
                { label: "Mensagens", value: stats.total_messages, color: "text-purple-500" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Usuários por perfil</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(stats.users_by_role ?? {}).map(([role, count]: any) => (
                  <div key={role} className="text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${roleColor[role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[role]??role}</span>
                    <p className="text-lg font-bold text-sinergya-dark">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users — tabela no desktop, cards no mobile */}
        {!dataLoading && activeTab === "users" && (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{["Nome","Email","Perfil","LGPD","Cadastro","Ações"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">Nenhum usuário.</td></tr>}
                  {users.map((u:any) => (
                    <tr key={u.id} className={`transition ${u.is_active ? "hover:bg-slate-50" : "bg-slate-50 opacity-60"}`}>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.is_active ? "bg-sinergya-green" : "bg-slate-300"}`}/><span className="font-medium text-sinergya-dark">{u.name}</span></div></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[u.role]??u.role}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs ${u.lgpd_consent?"text-sinergya-green":"text-red-500"}`}>{u.lgpd_consent?"✓ Sim":"✗ Não"}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleUser(u.id, u.is_active)} disabled={togglingId === u.id || u.id === user.user_id}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-40 ${u.is_active ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                          {togglingId === u.id ? "..." : u.is_active ? "Desativar" : "Ativar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {users.map((u:any) => (
                <div key={u.id} className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm ${!u.is_active ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${u.is_active ? "bg-sinergya-green" : "bg-slate-300"}`}/>
                      <div className="min-w-0">
                        <p className="font-medium text-sinergya-dark text-sm truncate">{u.name}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleToggleUser(u.id, u.is_active)} disabled={togglingId === u.id || u.id === user.user_id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0 disabled:opacity-40 ${u.is_active ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                      {togglingId === u.id ? "..." : u.is_active ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[u.role]??u.role}</span>
                    <span className={`text-xs ${u.lgpd_consent?"text-sinergya-green":"text-red-500"}`}>{u.lgpd_consent?"✓ LGPD":"✗ LGPD"}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(u.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Patients — tabela no desktop, cards no mobile */}
        {!dataLoading && activeTab === "patients" && (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{["Nome","Especialidades","Menor","Usuário vinculado","Status","Cadastro"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">Nenhum paciente.</td></tr>}
                  {patients.map((p:any) => {
                    const linkedUser = users.find(u => u.id === p.user_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-medium text-sinergya-dark">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{p.specialties||"—"}</td>
                        <td className="px-4 py-3">{p.is_minor?<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Sim</span>:<span className="text-xs text-slate-400">Não</span>}</td>
                        <td className="px-4 py-3">{linkedUser?<span className="text-xs text-sinergya-green font-medium">✓ {linkedUser.name}</span>:<button onClick={() => { setBindPatientId(p.id); setShowBindUser(true); }} className="text-xs text-amber-500 hover:text-amber-700 underline">Vincular usuário</button>}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{p.is_active?"Ativo":"Inativo"}</span></td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(p.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {patients.map((p:any) => {
                const linkedUser = users.find(u => u.id === p.user_id);
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sinergya-dark text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.specialties||"—"}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${p.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{p.is_active?"Ativo":"Inativo"}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {p.is_minor && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Menor</span>}
                      {linkedUser?<span className="text-xs text-sinergya-green font-medium">✓ {linkedUser.name}</span>:<button onClick={() => { setBindPatientId(p.id); setShowBindUser(true); }} className="text-xs text-amber-500 underline">Vincular usuário</button>}
                      <span className="text-xs text-slate-400 ml-auto">{formatDate(p.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Logs — tabela no desktop, cards no mobile */}
        {activeTab === "logs" && (
          <>
            {/* Desktop */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{["Ação","Perfil","Entidade","Detalhe","Data"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">Nenhum log ainda.</td></tr>}
                  {logs.map((l:any) => (
                    <tr key={l.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-sinergya-dark">{l.action}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[l.user_role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[l.user_role]??l.user_role}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{l.entity}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs truncate max-w-xs">{l.detail}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="md:hidden space-y-3">
              {logs.map((l:any) => (
                <div key={l.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-sinergya-dark">{l.action}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[l.user_role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[l.user_role]??l.user_role}</span>
                    <span className="text-xs text-slate-400 ml-auto">{formatDate(l.created_at)}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{l.detail}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal novo paciente */}
      {showNewPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md p-6">
            <h2 className="text-lg font-bold text-sinergya-dark mb-4">Novo Paciente</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Nome completo *</label>
                <input value={newPatient.name} onChange={e=>setNewPatient(p=>({...p,name:e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" placeholder="Ex: João da Silva"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Especialidades</label>
                <input value={newPatient.specialties} onChange={e=>setNewPatient(p=>({...p,specialties:e.target.value}))} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" placeholder="Ex: Psicologia • Fonoaudiologia"/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newPatient.is_minor} onChange={e=>setNewPatient(p=>({...p,is_minor:e.target.checked}))} className="w-4 h-4 rounded accent-sinergya-green"/>
                <span className="text-sm text-slate-700">Paciente menor de idade</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowNewPatient(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600">Cancelar</button>
              <button onClick={handleCreatePatient} disabled={savingPatient||!newPatient.name.trim()} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:"linear-gradient(135deg, #4FBF9F, #3A7BD5)"}}>
                {savingPatient?"Salvando...":"Criar paciente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal vincular */}
      {showBindUser && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-md p-6">
            <h2 className="text-lg font-bold text-sinergya-dark mb-1">Vincular Usuário ao Paciente</h2>
            <p className="text-xs text-slate-400 mb-4">Permite que o paciente acesse o próprio registro clínico ao fazer login.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Registro de paciente</label>
                <select value={bindPatientId} onChange={e=>setBindPatientId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white">
                  <option value="">Selecionar paciente...</option>
                  {patients.map((p:any)=><option key={p.id} value={p.id}>{p.name}{p.user_id?" ✓ já vinculado":""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Usuário (paciente ou responsável)</label>
                <select value={bindUserId} onChange={e=>setBindUserId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none bg-white">
                  <option value="">Selecionar usuário...</option>
                  {pacientes.map((u:any)=><option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>{setShowBindUser(false);setBindPatientId("");setBindUserId("");}} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600">Cancelar</button>
              <button onClick={handleBindUser} disabled={savingBind||!bindPatientId||!bindUserId} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{background:"linear-gradient(135deg, #4FBF9F, #3A7BD5)"}}>
                {savingBind?"Vinculando...":"Vincular"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewUser && <NewUserModal onClose={() => setShowNewUser(false)} onCreated={async () => { setShowNewUser(false); await reload(); setActiveTab("users"); }} />}
    </main>
  );
}