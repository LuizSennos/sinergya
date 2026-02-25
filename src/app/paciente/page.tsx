"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { apiGetMyPatient, apiGetMessages, apiSendMessage, apiGetDiary, apiCreateDiaryEntry, apiGetTasks, apiMarkTaskDone } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

type Tab = "assistencial" | "diario" | "tarefas";

export default function PacientePage() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("assistencial");
  const [patient, setPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newDiary, setNewDiary] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Proteção
  useEffect(() => {
    if (!loading && !user) { window.location.href = "/login"; return; }
    if (!loading && user && !["paciente", "responsavel"].includes(user.role)) {
      window.location.href = "/admin";
    }
  }, [user, loading]);

  // Carrega o registro do paciente (ps[0] por enquanto, até /patients/me estar no backend)
  useEffect(() => {
    if (!user || !["paciente", "responsavel"].includes(user.role)) return;
    setDataLoading(true);
    apiGetMyPatient()
  .then(setPatient)
  .catch(() => setError("Nenhum registro clínico vinculado à sua conta. Entre em contato com o administrador."))
  .finally(() => setDataLoading(false));
  }, [user]);

  useEffect(() => {
    if (!patient) return;
    if (activeTab === "assistencial") apiGetMessages(patient.id, "assistencial").then(setMessages).catch(console.error);
    if (activeTab === "diario") apiGetDiary(patient.id).then(setDiary).catch(console.error);
    if (activeTab === "tarefas") apiGetTasks(patient.id).then(setTasks).catch(console.error);
  }, [activeTab, patient]);

  async function handleSendMessage() {
    if (!newMessage.trim() || !patient) return;
    setSending(true);
    try {
      await apiSendMessage(patient.id, "assistencial", newMessage);
      setNewMessage("");
      setMessages(await apiGetMessages(patient.id, "assistencial"));
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); }
  }

  async function handleSendDiary() {
    if (!newDiary.trim() || !patient) return;
    setSending(true);
    try {
      await apiCreateDiaryEntry(patient.id, newDiary);
      setNewDiary("");
      setDiary(await apiGetDiary(patient.id));
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); }
  }

  async function handleMarkDone(taskId: string, isDone: boolean) {
    try {
      await apiMarkTaskDone(taskId, isDone);
      setTasks(await apiGetTasks(patient.id));
    } catch (err: any) { alert(err.message); }
  }

  if (loading || !user) return null;

  if (dataLoading) return (
    <div className="min-h-screen bg-sinergya-background flex items-center justify-center">
      <p className="text-slate-400 text-sm">Carregando...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-sinergya-background flex flex-col items-center justify-center p-8">
      <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-sm border border-slate-100">
        <p className="text-2xl mb-3">⚠️</p>
        <h2 className="text-lg font-semibold text-sinergya-dark mb-2">Conta não vinculada</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={logout} className="mt-6 text-sm text-sinergya-green hover:underline">Sair</button>
      </div>
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "assistencial", label: "Mensagens" },
    { key: "diario", label: "Meu Diário" },
    { key: "tarefas", label: "Minhas Tarefas" },
  ];

  return (
    <main className="min-h-screen bg-sinergya-background flex flex-col">
      <header className="bg-sinergya-dark text-white px-8 py-4 flex items-center justify-between">
        <Image src="/logo.png" alt="Sinergya" width={140} height={40} />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-white/50 capitalize">{user.role}</p>
          </div>
          <button onClick={logout} className="flex items-center gap-1.5 text-white/40 hover:text-white transition text-xs" title="Sair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </header>

      {patient && (
        <div className="px-8 py-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-sinergya-dark">{patient.name}</h1>
            <p className="text-sm text-sinergya-muted">{patient.specialties}</p>
          </div>
          <span className="inline-flex items-center gap-2 bg-sinergya-green/10 text-sinergya-green px-4 py-1.5 rounded-full text-xs font-medium">
            🔒 Dados protegidos (LGPD)
          </span>
        </div>
      )}

      <div className="bg-white border-b border-slate-200 px-8 flex gap-1">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === tab.key ? "border-sinergya-green text-sinergya-green" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 px-8 py-6 max-w-3xl mx-auto w-full">

        {activeTab === "assistencial" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 mb-4">Comunicação com sua equipe de saúde</p>
            {messages.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhuma mensagem ainda.</p>}
            {messages.map((msg: any) => (
              <div key={msg.id} className="bg-white rounded-xl p-5 border-l-4 border-sinergya-blue shadow-sm">
                {msg.author_name && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-sinergya-blue/10 flex items-center justify-center text-xs font-bold text-sinergya-blue">
                      {msg.author_name[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{msg.author_name}</span>
                    <span className="ml-auto text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                  </div>
                )}
                <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
              </div>
            ))}
            <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
              <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder="Escrever mensagem para a equipe..." rows={3}
                className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-400" />
              <div className="flex justify-end mt-2">
                <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "diario" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 mb-4">Seus registros pessoais — visíveis pela equipe de saúde</p>
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
              <textarea value={newDiary} onChange={e => setNewDiary(e.target.value)}
                placeholder="Como você está se sentindo hoje?" rows={4}
                className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-400" />
              <div className="flex justify-end mt-2">
                <button onClick={handleSendDiary} disabled={sending || !newDiary.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
                  {sending ? "Salvando..." : "Salvar no diário"}
                </button>
              </div>
            </div>
            {diary.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Nenhum registro ainda.</p>}
            {diary.map((entry: any) => (
              <div key={entry.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                <span className="mt-3 block text-xs text-slate-400">{formatDate(entry.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tarefas" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 mb-4">Orientações da sua equipe de saúde</p>
            {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhuma tarefa ainda.</p>}
            {tasks.map((task: any) => (
              <div key={task.id} className={`rounded-xl p-5 border transition-all ${task.is_done ? "bg-slate-50 border-slate-100 opacity-70" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => handleMarkDone(task.id, !task.is_done)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${task.is_done ? "border-sinergya-green bg-sinergya-green" : "border-slate-300 hover:border-sinergya-green"}`}>
                    {task.is_done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-400" : "text-sinergya-dark"}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                    {task.is_done && task.done_at && <span className="text-xs text-sinergya-green mt-1 block">✓ Concluída em {formatDate(task.done_at)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}