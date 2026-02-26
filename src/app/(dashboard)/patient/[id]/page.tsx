"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiGetPatient, apiGetMessages, apiSendMessage,
  apiGetDiary, apiGetTasks, apiMarkTaskDone, apiCreateTask
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const EMOJIS = ["😊","😄","👍","❤️","🙏","💪","✅","⚠️","📋","💬","🔒","📝","🎯","💡","⏰","📅"];

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });
}

function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

type Tab = "assistencial" | "tecnico" | "diario" | "tarefas";
const PACIENTE_ROLES = ["paciente", "responsavel"];
const ALLOWED_ROLES = ["admin", "profissional", "academico", "supervisor"];

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("assistencial");
  const [patient, setPatient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [diary, setDiary] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadTab = useCallback(async (tab: Tab) => {
    if (!id) return;
    try {
      if (tab === "assistencial") setMessages(await apiGetMessages(id, "assistencial"));
      else if (tab === "tecnico") setMessages(await apiGetMessages(id, "tecnico"));
      else if (tab === "diario") setDiary(await apiGetDiary(id));
      else if (tab === "tarefas") setTasks(await apiGetTasks(id));
    } catch (err) { console.error("Erro ao carregar aba:", err); }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (PACIENTE_ROLES.includes(user.role)) router.replace("/paciente");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!id || !user || PACIENTE_ROLES.includes(user.role)) return;
    setDataLoading(true);
    apiGetPatient(id).then(setPatient).catch(console.error).finally(() => setDataLoading(false));
  }, [id, user]);

  useEffect(() => {
    if (!user || PACIENTE_ROLES.includes(user.role)) return;
    loadTab(activeTab);
  }, [activeTab, loadTab, user]);

  useEffect(() => {
    if (activeTab === "assistencial" || activeTab === "tecnico") {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, activeTab]);

  if (loading || !user || PACIENTE_ROLES.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sinergya-green mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (dataLoading) return (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sinergya-green mr-3"></div>
      Carregando...
    </div>
  );
  if (!patient) return <div className="p-10 text-slate-500">Paciente não encontrado ou acesso negado.</div>;

  const canCreateTask = ALLOWED_ROLES.includes(user.role);
  const doneTasks = tasks.filter(t => t.is_done).length;
  const totalTasks = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const isOwnMessage = (msg: any) =>
    msg.author_name && user.name &&
    msg.author_name.toLowerCase().trim() === user.name.toLowerCase().trim();

  async function handleSendMessage() {
    if (!newMessage.trim() || !id) return;
    setSending(true);
    try {
      await apiSendMessage(id, activeTab === "tecnico" ? "tecnico" : "assistencial", newMessage);
      setNewMessage("");
      await loadTab(activeTab);
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); }
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
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

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "assistencial", label: "Grupo Assistencial" },
    { key: "tecnico", label: "Grupo Técnico" },
    { key: "diario", label: "Diário" },
    { key: "tarefas", label: "Tarefas", count: tasks.filter(t => !t.is_done).length },
  ];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header */}
      <div className="px-6 md:px-8 py-4 md:py-6 border-b border-slate-200 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="md:hidden w-9 h-9 rounded-full bg-sinergya-green/15 flex items-center justify-center text-sinergya-green font-bold text-sm flex-shrink-0">
            {patient.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-base md:text-xl font-semibold text-sinergya-dark">{patient.name}</h1>
            <p className="text-xs md:text-sm text-sinergya-muted">{patient.specialties}</p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 bg-sinergya-green/10 text-sinergya-green px-4 py-1.5 rounded-full text-xs font-medium">
          🔒 Dados protegidos (LGPD)
        </span>
      </div>

      {/* Abas */}
      <div className="px-4 md:px-8 flex gap-1 border-b border-slate-200 bg-white sticky top-0 z-10 overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? "border-sinergya-green text-sinergya-green"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? "bg-sinergya-green/10 text-sinergya-green" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto bg-slate-50/30">

        {/* ── CHAT ── */}
        {(activeTab === "assistencial" || activeTab === "tecnico") && (
          <div className="flex flex-col h-full min-h-0">

            {/* Banner + busca */}
            <div className={`px-4 md:px-8 py-2 text-xs flex items-center gap-2 flex-shrink-0 ${
              activeTab === "tecnico"
                ? "bg-amber-50 text-amber-700 border-b border-amber-100"
                : "bg-slate-50 text-slate-400 border-b border-slate-100"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeTab === "tecnico" ? "bg-amber-400" : "bg-sinergya-green"}`} />
              <span className="flex-1">
                {activeTab === "assistencial"
                  ? "Visível ao paciente • Comunicação contínua com a equipe"
                  : "Invisível ao paciente • Discussão técnica da equipe"}
              </span>
              <button
                onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
                className="p-1 rounded-lg hover:bg-black/5 transition flex-shrink-0"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>

            {/* Busca */}
            {showSearch && (
              <div className="px-4 md:px-8 py-2 border-b border-slate-100 bg-white flex-shrink-0">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar mensagens..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-sinergya-green bg-slate-50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">{filteredMessages.length} resultado(s)</p>
                )}
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-5 space-y-4"
              style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
              {filteredMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">{searchQuery ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem ainda"}</p>
                  {!searchQuery && <p className="text-xs text-slate-300 mt-1">Seja o primeiro a enviar uma mensagem</p>}
                </div>
              )}

              {filteredMessages.map((msg: any) => {
                const own = isOwnMessage(msg);
                return (
                  <div key={msg.id}>
                    {/* DESKTOP — card estilo chat com fundo branco e sombra */}
                    <div className={`hidden md:block rounded-2xl p-4 shadow-sm max-w-3xl border-l-4 ${
                      activeTab === "tecnico"
                        ? "bg-amber-50/80 border-amber-300"
                        : own
                          ? "bg-white border-sinergya-green"
                          : "bg-white border-sinergya-blue"
                    }`}
                    style={{ boxShadow: "0 1px 4px rgba(15,23,42,0.06)" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          activeTab === "tecnico"
                            ? "bg-amber-100 text-amber-700"
                            : own
                              ? "bg-sinergya-green/15 text-sinergya-green"
                              : "bg-sinergya-blue/10 text-sinergya-blue"
                        }`}>
                          {msg.author_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        {msg.author_name && (
                          <span className="text-xs font-semibold text-slate-700">{msg.author_name}</span>
                        )}
                        {own && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(79,191,159,0.12)", color: "#4FBF9F" }}>
                            você
                          </span>
                        )}
                        <span className="ml-auto text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pl-9">
                        {searchQuery ? (
                          <span dangerouslySetInnerHTML={{
                            __html: msg.content.replace(
                              new RegExp(`(${searchQuery})`, "gi"),
                              '<mark style="background:#fef08a;color:#1e293b;border-radius:2px">$1</mark>'
                            )
                          }} />
                        ) : msg.content}
                      </p>
                    </div>

                    {/* MOBILE — bubble WhatsApp */}
                    <div className={`flex md:hidden ${own ? "justify-end pr-2" : "justify-start"}`}>
                      <div className={`max-w-[75%] flex flex-col gap-1 ${own ? "items-end" : "items-start"}`}>
                        {!own && (
                          <div className="flex items-center gap-1.5 px-1">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              activeTab === "tecnico" ? "bg-amber-100 text-amber-700" : "bg-sinergya-blue/15 text-sinergya-blue"
                            }`}>
                              {msg.author_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <span className="text-xs font-semibold text-slate-600">{msg.author_name}</span>
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          own
                            ? activeTab === "tecnico"
                              ? "bg-amber-400 text-white rounded-tr-sm"
                              : "text-white rounded-tr-sm"
                            : activeTab === "tecnico"
                              ? "bg-amber-50 text-slate-700 border border-amber-100 rounded-tl-sm"
                              : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm"
                        }`}
                        style={own && activeTab !== "tecnico" ? { background: "linear-gradient(135deg, #6366f1, #3A7BD5)" } : {}}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1">{formatTime(msg.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div className="flex-shrink-0 px-4 md:px-8 pb-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-lg grid grid-cols-8 gap-1">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => insertEmoji(e)}
                      className="text-lg hover:bg-slate-100 rounded-lg p-1 transition active:scale-95">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`flex-shrink-0 px-4 md:px-8 py-3 border-t ${
              activeTab === "tecnico" ? "border-amber-100 bg-amber-50/30" : "border-slate-200 bg-white"
            }`}>
              <div className="flex items-end gap-2">
                <button onClick={() => setShowEmoji(!showEmoji)}
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-lg">
                  😊
                </button>
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeTab === "tecnico" ? "Escrever no grupo técnico..." : "Escrever no grupo assistencial..."}
                  rows={1}
                  className={`flex-1 px-4 py-2.5 rounded-2xl text-sm resize-none outline-none border transition max-h-32 ${
                    activeTab === "tecnico"
                      ? "border-amber-200 bg-white focus:border-amber-400 placeholder:text-amber-300"
                      : "border-slate-200 bg-slate-50 focus:border-sinergya-green focus:bg-white placeholder:text-slate-400"
                  }`}
                  style={{ overflowY: "auto" }}
                />
                <button
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-slate-400"
                  title="Anexar arquivo (em breve)"
                  onClick={() => alert("Anexo de arquivos chegando em breve!")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                  </svg>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
                  style={{ background: activeTab === "tecnico" ? "#f59e0b" : "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}
                >
                  {sending
                    ? <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  }
                </button>
              </div>
              <p className="text-[10px] text-slate-300 mt-1 pl-1">Enter para enviar · Shift+Enter para quebrar linha</p>
            </div>
          </div>
        )}

        {/* ── DIÁRIO ── */}
        {activeTab === "diario" && (
          <div className="px-4 md:px-8 py-6">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs text-slate-400 mb-4">Registros enviados pelo paciente • Somente leitura</p>
              {diary.length === 0 && (
                <p className="text-sm text-slate-400 py-8">Nenhum registro de diário encontrado.</p>
              )}
              {diary.map((entry: any) => (
                <div key={entry.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                  <span className="mt-3 block text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAREFAS ── */}
        {activeTab === "tarefas" && (
          <div className="px-4 md:px-8 py-6">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs text-slate-400 mb-4">Gestão de orientações e tarefas</p>

              {totalTasks > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Progresso das orientações</span>
                    <span className="text-xs font-bold text-sinergya-green">{doneTasks}/{totalTasks} concluídas</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #4FBF9F, #3A7BD5)" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{progressPct}% completo</p>
                </div>
              )}

              {canCreateTask && (
                <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Nova orientação</p>
                  <input value={newTask} onChange={e => setNewTask(e.target.value)}
                    placeholder="Título da tarefa ou orientação..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30 focus:border-sinergya-green transition" />
                  <input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)}
                    placeholder="Descrição detalhada (opcional)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sinergya-green/30 focus:border-sinergya-green transition" />
                  <div className="flex justify-end">
                    <button onClick={handleCreateTask} disabled={!newTask.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition active:scale-95"
                      style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}>
                      + Criar orientação
                    </button>
                  </div>
                </div>
              )}

              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">Nenhuma orientação ainda</p>
                </div>
              )}

              {[...tasks.filter(t => !t.is_done), ...tasks.filter(t => t.is_done)].map((task: any) => (
                <div key={task.id} className={`rounded-xl p-5 border transition-all ${
                  task.is_done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleMarkDone(task.id, !task.is_done)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                        task.is_done ? "border-sinergya-green bg-sinergya-green" : "border-slate-300 hover:border-sinergya-green"
                      }`}>
                      {task.is_done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-400" : "text-sinergya-dark"}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                      {task.is_done && task.done_at && (
                        <span className="text-xs text-sinergya-green mt-1 block font-medium">
                          ✓ Concluída em {formatDate(task.done_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}