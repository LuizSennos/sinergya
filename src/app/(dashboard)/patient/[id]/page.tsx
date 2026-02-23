"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  apiGetPatient, apiGetMessages, apiSendMessage,
  apiGetDiary, apiGetTasks, apiMarkTaskDone, apiCreateTask
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

type Tab = "assistencial" | "tecnico" | "diario" | "tarefas";

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("assistencial");
  const [patient, setPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const isPaciente = user?.role === "paciente" || user?.role === "responsavel";
  const canCreateTask = ["profissional", "academico", "supervisor", "admin"].includes(user?.role ?? "");

  const loadTab = useCallback(async (tab: Tab) => {
    if (!id) return;
    try {
      if (tab === "assistencial") setMessages(await apiGetMessages(id, "assistencial"));
      else if (tab === "tecnico") setMessages(await apiGetMessages(id, "tecnico"));
      else if (tab === "diario") setDiary(await apiGetDiary(id));
      else if (tab === "tarefas") setTasks(await apiGetTasks(id));
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGetPatient(id).then(setPatient).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadTab(activeTab); }, [activeTab, loadTab]);

  async function handleSendMessage() {
    if (!newMessage.trim() || !id) return;
    setSending(true);
    try {
      const context = activeTab === "tecnico" ? "tecnico" : "assistencial";
      await apiSendMessage(id, context, newMessage);
      setNewMessage("");
      await loadTab(activeTab);
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); }
  }

  async function handleMarkDone(taskId: string, isDone: boolean) {
    try {
      await apiMarkTaskDone(taskId, isDone);
      await loadTab("tarefas");
    } catch (err: any) { alert(err.message); }
  }

  async function handleCreateTask() {
    if (!newTask.trim() || !id) return;
    try {
      await apiCreateTask(id, newTask, newTaskDesc || undefined);
      setNewTask("");
      setNewTaskDesc("");
      await loadTab("tarefas");
    } catch (err: any) { alert(err.message); }
  }

  if (loading) return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Carregando...</div>;
  if (!patient) return <div className="p-10 text-slate-500">Paciente não encontrado.</div>;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "assistencial", label: "Grupo Assistencial" },
    ...(isPaciente ? [] : [{ key: "tecnico" as Tab, label: "Grupo Técnico" }]),
    { key: "diario", label: "Diário" },
    { key: "tarefas", label: "Tarefas", count: tasks.filter(t => !t.is_done).length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sinergya-dark">{patient.name}</h1>
          <p className="text-sm text-sinergya-muted">{patient.specialties}</p>
        </div>
        <span className="inline-flex items-center gap-2 bg-sinergya-green/10 text-sinergya-green px-4 py-1.5 rounded-full text-xs font-medium">
          🔒 Dados protegidos (LGPD)
        </span>
      </div>

      {/* TABS */}
      <div className="px-8 flex gap-1 border-b border-slate-200 bg-white">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${
              activeTab === tab.key ? "border-sinergya-green text-sinergya-green" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-sinergya-green/10 text-sinergya-green" : "bg-slate-100 text-slate-500"
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* MENSAGENS */}
        {(activeTab === "assistencial" || activeTab === "tecnico") && (
          <div className="max-w-3xl space-y-4">
            {activeTab === "assistencial" && (
              <p className="text-xs text-slate-400 mb-4">Visível ao paciente • Comunicação contínua com a equipe</p>
            )}
            {activeTab === "tecnico" && (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <p className="text-xs text-slate-400">Invisível ao paciente • Discussão técnica da equipe</p>
              </div>
            )}
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">Nenhuma mensagem ainda.</p>
            )}
            {messages.map((msg: any) => (
              <div key={msg.id} className={`rounded-xl p-5 border-l-4 ${
                activeTab === "tecnico" ? "bg-amber-50/50 border-amber-400" : "bg-white border-sinergya-blue shadow-sm"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    activeTab === "tecnico" ? "bg-amber-100 text-amber-700" : "bg-sinergya-blue/10 text-sinergya-blue"
                  }`}>
                    {msg.author_name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  {msg.author_name && <span className="text-xs font-semibold text-slate-700">{msg.author_name}</span>}
                  <span className="ml-auto text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
              </div>
            ))}

            <div className={`mt-6 rounded-xl border p-4 ${activeTab === "tecnico" ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"}`}>
              <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                placeholder={activeTab === "tecnico" ? "Escrever no grupo técnico..." : "Escrever no grupo assistencial..."}
                rows={3}
                className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-400" />
              <div className="flex justify-end mt-2">
                <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50"
                  style={{ background: activeTab === "tecnico" ? "#f59e0b" : "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DIÁRIO */}
        {activeTab === "diario" && (
          <div className="max-w-3xl space-y-4">
            <p className="text-xs text-slate-400 mb-4">Registros do paciente • Somente leitura para a equipe</p>
            {diary.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum registro ainda.</p>}
            {diary.map((entry: any) => (
              <div key={entry.id} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                <span className="mt-3 block text-xs text-slate-400">{formatDate(entry.created_at)}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAREFAS */}
        {activeTab === "tarefas" && (
          <div className="max-w-3xl space-y-3">
            <p className="text-xs text-slate-400 mb-4">Orientações e tarefas criadas pela equipe</p>

            {canCreateTask && (
              <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Título da tarefa..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" />
                <input value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Descrição (opcional)..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30" />
                <div className="flex justify-end">
                  <button onClick={handleCreateTask} disabled={!newTask.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
                    Criar tarefa
                  </button>
                </div>
              </div>
            )}

            {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhuma tarefa ainda.</p>}
            {tasks.map((task: any) => (
              <div key={task.id} className={`rounded-xl p-5 border transition-all ${
                task.is_done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => handleMarkDone(task.id, !task.is_done)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                      task.is_done ? "border-sinergya-green bg-sinergya-green" : "border-slate-300 hover:border-sinergya-green"
                    }`}>
                    {task.is_done && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-400" : "text-sinergya-dark"}`}>
                      {task.title}
                    </p>
                    {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                    {task.is_done && task.done_at && (
                      <span className="text-xs text-sinergya-green mt-1 block">✓ Concluída em {formatDate(task.done_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}