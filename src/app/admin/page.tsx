"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiAdminStats, apiAdminUsers, apiAdminLogs, apiCreatePatient, apiBindUserToPatient, apiGetPatients } from "@/lib/api";
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("stats");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: "", specialties: "", is_minor: false });
  const [savingPatient, setSavingPatient] = useState(false);

  const [showBind, setShowBind] = useState(false);
  const [bindPatientId, setBindPatientId] = useState("");
  const [bindUserId, setBindUserId] = useState("");
  const [savingBind, setSavingBind] = useState(false);

  const [showNewUser, setShowNewUser] = useState(false);

  async function reload() {
    const [s, u, p] = await Promise.all([
      apiAdminStats().catch(() => null),
      apiAdminUsers().catch(() => []),
      apiGetPatients().catch(() => []),
    ]);
    if (s) setStats(s);
    setUsers(u ?? []);
    setPatients(p ?? []);
  }

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "logs" && logs.length === 0) {
      apiAdminLogs().then(setLogs).catch(console.error);
    }
  }, [activeTab]);

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

  async function handleBind() {
    if (!bindPatientId || !bindUserId) return;
    setSavingBind(true);
    try {
      await apiBindUserToPatient(bindPatientId, bindUserId);
      setShowBind(false);
      setBindPatientId(""); setBindUserId("");
      alert("Vínculo criado! O profissional já tem acesso ao paciente.");
    } catch (err: any) { alert(err.message); }
    finally { setSavingBind(false); }
  }

  const profissionais = users.filter(u => ["profissional", "academico", "supervisor"].includes(u.role));

  return (
    <main className="min-h-screen bg-sinergya-background">
      <header className="bg-sinergya-dark text-white px-8 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="Sinergya" width={140} height={40} />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name}</p>
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

      <div className="px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-sinergya-dark">Painel Administrativo</h1>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowNewUser(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-sinergya-blue text-sinergya-blue hover:bg-sinergya-blue/5 transition">
              + Novo usuário
            </button>
            <button onClick={() => setShowNewPatient(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
              + Novo paciente
            </button>
            <button onClick={() => setShowBind(true)}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-sinergya-green text-sinergya-green hover:bg-sinergya-green/5 transition">
              Vincular profissional
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4">
          {([["stats","Indicadores"],["users","Usuários"],["patients","Pacientes"],["logs","Auditoria"]] as [AdminTab,string][]).map(([key,label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab===key?"border-sinergya-green text-sinergya-green":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-slate-400 text-sm">Carregando...</p>}

        {activeTab === "stats" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Usuários ativos", value: stats.active_users, color: "text-sinergya-green" },
                { label: "Total usuários", value: stats.total_users, color: "text-sinergya-blue" },
                { label: "Pacientes", value: stats.total_patients, color: "text-amber-500" },
                { label: "Mensagens", value: stats.total_messages, color: "text-purple-500" },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
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

        {activeTab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Nome","Email","Perfil","Status","LGPD","Cadastro"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u:any) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-sinergya-dark">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[u.role]??"bg-slate-100 text-slate-600"}`}>{roleLabel[u.role]??u.role}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{u.is_active?"Ativo":"Inativo"}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${u.lgpd_consent?"text-sinergya-green":"text-red-500"}`}>{u.lgpd_consent?"✓ Sim":"✗ Não"}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "patients" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>{["Nome","Especialidades","Menor","Status","Cadastro"].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">Nenhum paciente cadastrado.</td></tr>}
                {patients.map((p:any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-sinergya-dark">{p.name}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{p.specialties||"—"}</td>
                    <td className="px-4 py-3">{p.is_minor?<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Sim</span>:<span className="text-xs text-slate-400">Não</span>}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active?"bg-green-100 text-green-700":"bg-red-100 text-red-600"}`}>{p.is_active?"Ativo":"Inativo"}</span></td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
        )}
      </div>

      {/* MODAL NOVO PACIENTE */}
      {showNewPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-sinergya-dark mb-4">Novo Paciente</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Nome completo *</label>
                <input value={newPatient.name} onChange={e=>setNewPatient(p=>({...p,name:e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" placeholder="Ex: João da Silva"/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Especialidades</label>
                <input value={newPatient.specialties} onChange={e=>setNewPatient(p=>({...p,specialties:e.target.value}))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" placeholder="Ex: Psicologia • Fonoaudiologia"/>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newPatient.is_minor} onChange={e=>setNewPatient(p=>({...p,is_minor:e.target.checked}))} className="w-4 h-4 rounded accent-sinergya-green"/>
                <span className="text-sm text-slate-700">Paciente menor de idade</span>
              </label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowNewPatient(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={handleCreatePatient} disabled={savingPatient||!newPatient.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(135deg, #4FBF9F, #3A7BD5)"}}>
                {savingPatient?"Salvando...":"Criar paciente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR */}
      {showBind && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-sinergya-dark mb-4">Vincular Profissional ao Paciente</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Paciente</label>
                <select value={bindPatientId} onChange={e=>setBindPatientId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30 bg-white">
                  <option value="">Selecionar paciente...</option>
                  {patients.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Profissional</label>
                <select value={bindUserId} onChange={e=>setBindUserId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30 bg-white">
                  <option value="">Selecionar profissional...</option>
                  {profissionais.map((u:any)=><option key={u.id} value={u.id}>{u.name} ({roleLabel[u.role]})</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowBind(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button onClick={handleBind} disabled={savingBind||!bindPatientId||!bindUserId}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{background:"linear-gradient(135deg, #4FBF9F, #3A7BD5)"}}>
                {savingBind?"Vinculando...":"Vincular"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO USUÁRIO */}
      {showNewUser && (
        <NewUserModal
          onClose={() => setShowNewUser(false)}
          onCreated={async () => { setShowNewUser(false); await reload(); setActiveTab("users"); }}
        />
      )}
    </main>
  );
}