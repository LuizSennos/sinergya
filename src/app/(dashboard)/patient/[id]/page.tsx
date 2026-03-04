"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  apiGetPatient, apiGetMessages, apiSendMessage,
  apiGetDiary, apiGetTasks, apiMarkTaskDone, apiCreateTask,
  apiUploadFile, apiSendMessageWithAttachment
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BRAND_GRADIENT   = "linear-gradient(135deg, #1e8c68 0%, #2a7fc4 100%)";
const TECNICO_GRADIENT = "linear-gradient(135deg, #d97706 0%, #b45309 100%)";
const EMOJIS = ["😊","😄","👍","❤️","🙏","💪","✅","⚠️","📋","💬","🔒","📝","🎯","💡","⏰","📅"];

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageAttachment({ msg, isTecnico, own = false }: { msg: any; isTecnico: boolean; own?: boolean }) {
  if (!msg.attachment_url) return null;
  const { attachment_type: type, attachment_name: name, attachment_size: size } = msg;
  const accent   = own ? "white" : isTecnico ? "#d97706" : "#1e8c68";
  const bubbleBg = own ? "rgba(255,255,255,0.15)" : isTecnico ? "rgba(217,119,6,0.07)" : "rgba(30,140,104,0.07)";
  const border   = own ? "rgba(255,255,255,0.2)"  : isTecnico ? "rgba(217,119,6,0.15)" : "rgba(30,140,104,0.15)";

  if (type === "image") {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden mt-2 max-w-[220px] hover:opacity-90 transition-opacity shadow-sm">
        <img src={msg.attachment_url} alt={name || "imagem"} className="w-full object-cover" style={{ maxHeight: 180 }} />
      </a>
    );
  }
  if (type === "audio") {
    return (
      <div className="mt-2 rounded-xl px-3 py-2.5 max-w-[260px]"
        style={{ background: bubbleBg, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: own ? "rgba(255,255,255,0.2)" : `${accent}22` }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill={accent}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium" style={{ color: own ? "rgba(255,255,255,0.8)" : "#64748b" }}>Mensagem de voz</span>
        </div>
        <audio controls src={msg.attachment_url} className="w-full h-8" />
      </div>
    );
  }
  return (
    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 mt-2 px-3 py-2.5 rounded-xl max-w-[260px] hover:opacity-80 transition-opacity"
      style={{ background: bubbleBg, border: `1px solid ${border}` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: own ? "rgba(255,255,255,0.2)" : `${accent}22` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: own ? "white" : "#334155" }}>{name || "arquivo"}</p>
        {size && <p className="text-[10px]" style={{ color: own ? "rgba(255,255,255,0.6)" : "#94a3b8" }}>{formatFileSize(size)}</p>}
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </a>
  );
}

function AttachmentPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2 border"
      style={{ borderColor: "rgba(30,140,104,0.25)", background: "rgba(30,140,104,0.04)" }}>
      {isImage && preview
        ? <img src={preview} alt={file.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        : <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(30,140,104,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
      </div>
      <button onClick={onRemove} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 transition text-slate-400 hover:text-red-500">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

type Tab = "assistencial" | "tecnico" | "diario" | "tarefas";
const PACIENTE_ROLES = ["paciente", "responsavel"];
const ALLOWED_ROLES  = ["profissional", "academico", "supervisor"];

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]     = useState<Tab>("assistencial");
  const [patient, setPatient]         = useState<any>(null);
  const [messages, setMessages]       = useState<any[]>([]);
  const [diary, setDiary]             = useState<any[]>([]);
  const [tasks, setTasks]             = useState<any[]>([]);
  const [newMessage, setNewMessage]   = useState("");
  const [newTask, setNewTask]         = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [dataLoading, setDataLoading] = useState(true);
  const [sending, setSending]         = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [showEmoji, setShowEmoji]     = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch]   = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [recording, setRecording]               = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const loadTab = useCallback(async (tab: Tab) => {
    if (!id) return;
    try {
      if (tab === "assistencial") setMessages(await apiGetMessages(id, "assistencial"));
      else if (tab === "tecnico") setMessages(await apiGetMessages(id, "tecnico"));
      else if (tab === "diario")  setDiary(await apiGetDiary(id));
      else if (tab === "tarefas") setTasks(await apiGetTasks(id));
    } catch (err) { console.error(err); }
  }, [id]);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (user.role === "admin") router.replace("/admin");
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
    if (activeTab === "assistencial" || activeTab === "tecnico") setTimeout(scrollToBottom, 100);
  }, [messages, activeTab]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  async function handleSendMessage() {
    if (!newMessage.trim() && !pendingFile) return;
    if (!id) return;
    const context = activeTab === "tecnico" ? "tecnico" : "assistencial";
    setSending(true);
    try {
      if (pendingFile) {
        setUploading(true);
        const uploaded = await apiUploadFile(pendingFile, id, context);
        setUploading(false);
        await apiSendMessageWithAttachment(id, context, newMessage, uploaded);
        setPendingFile(null);
      } else {
        await apiSendMessage(id, context, newMessage);
      }
      setNewMessage("");
      await loadTab(activeTab);
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); setUploading(false); }
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); await handleSendMessage(); }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setPendingFile(new File([blob], `voz_${Date.now()}.webm`, { type: "audio/webm" }));
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch { alert("Permissão de microfone negada."); }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }

  function cancelRecording() {
    mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
    audioChunksRef.current = [];
    setRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }

  async function handleMarkDone(taskId: string, isDone: boolean) {
    try { await apiMarkTaskDone(taskId, isDone); await loadTab("tarefas"); }
    catch (err: any) { alert(err.message); }
  }

  async function handleCreateTask() {
    if (!newTask.trim() || !id) return;
    try {
      await apiCreateTask(id, newTask, newTaskDesc || undefined);
      setNewTask(""); setNewTaskDesc(""); await loadTab("tarefas");
    } catch (err: any) { alert(err.message); }
  }

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || PACIENTE_ROLES.includes(user.role) || user.role === "admin") {
    return null;
  }

  if (dataLoading) return (
    <div className="flex items-center justify-center h-full text-slate-400 text-sm gap-3">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: BRAND_GRADIENT }}>
        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
      Carregando...
    </div>
  );
  if (!patient) return <div className="p-10 text-slate-500">Paciente não encontrado ou acesso negado.</div>;

  const canCreateTask = ALLOWED_ROLES.includes(user.role);
  const doneTasks   = tasks.filter(t => t.is_done).length;
  const totalTasks  = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const isTecnico   = activeTab === "tecnico";
  const canSend     = (newMessage.trim() || !!pendingFile) && !sending;

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const isOwnMessage = (msg: any) =>
    msg.author_id === user.user_id;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "assistencial", label: "Grupo Assistencial" },
    { key: "tecnico",      label: "Grupo Técnico" },
    { key: "diario",       label: "Diário" },
    { key: "tarefas",      label: "Tarefas", count: tasks.filter(t => !t.is_done).length },
  ];

  return (
    <div className="flex flex-col h-full bg-white" style={{ minHeight: 0 }}>

     {/* Mobile header + Tabs Premium */}
<div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-100">

  {/* Header */}
  <div
    className="px-4 py-3 flex items-center gap-3"
    style={{
      background: "rgba(247,251,249,0.98)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)"
    }}
  >
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("open-sidebar"))}
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition active:scale-95"
      style={{ background: "rgba(30,140,104,0.08)" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2.5">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    </button>

    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0"
        style={{ background: BRAND_GRADIENT }}
      >
        {patient.name?.[0]?.toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate leading-tight">
          {patient.name}
        </p>
        {patient.specialties && (
          <p className="text-[10px] text-slate-400 truncate">
            {patient.specialties}
          </p>
        )}
      </div>
    </div>

    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: "rgba(30,140,104,0.12)", color: "#1e8c68" }}
    >
      {user.name?.[0]?.toUpperCase()}
    </div>
  </div>

  {/* Tabs estilo premium */}
  <div className="px-3 pb-2 bg-white">
    <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 overflow-x-auto">

      {tabs.map(tab => {
        const active = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="relative flex-1 whitespace-nowrap px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 active:scale-95"
            style={{
              background: active ? "white" : "transparent",
              color: active ? "#1e8c68" : "#64748b",
              boxShadow: active ? "0 2px 6px rgba(0,0,0,0.06)" : "none"
            }}
          >
            {tab.label.replace("Grupo ", "")}

            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full"
                style={{
                  background: active ? "#1e8c68" : "#e2e8f0",
                  color: active ? "white" : "#64748b"
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}

    </div>
  </div>
</div>

        {/* Desktop header */}
        <div className="hidden md:flex px-8 py-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
              style={{ background: BRAND_GRADIENT }}>
              {patient.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">Ativo</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{patient.specialties}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(30,140,104,0.08)", color: "#1e8c68" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Dados protegidos (LGPD)
          </span>
        </div>

        {/* Abas desktop */}
        <div className="hidden md:flex px-6 gap-0.5 border-t border-slate-100">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key ? "border-sinergya-green text-sinergya-green" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: activeTab === tab.key ? "#1e8c68" : "#e2e8f0", color: activeTab === tab.key ? "white" : "#64748b" }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-hidden bg-slate-50/40">

        {/* CHAT */}
        {(activeTab === "assistencial" || activeTab === "tecnico") && (
          <div className="flex flex-col h-full">

            {/* Banner */}
            <div className={`px-5 py-1.5 text-[11px] flex items-center gap-2 flex-shrink-0 ${
              isTecnico ? "bg-amber-50 text-amber-600 border-b border-amber-100" : "bg-emerald-50/60 text-emerald-700 border-b border-emerald-100/60"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isTecnico ? "bg-amber-400" : "bg-emerald-500"}`} />
              <span className="flex-1 font-medium">
                {isTecnico ? "Invisível ao paciente · Discussão técnica da equipe" : "Visível ao paciente · Comunicação com a equipe"}
              </span>
              <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }} className="p-1 rounded-md hover:bg-black/5 transition">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </div>

            {/* Busca */}
            {showSearch && (
              <div className="px-5 py-2 border-b border-slate-100 bg-white flex-shrink-0">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar mensagens..."
                    className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sinergya-green bg-slate-50" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && <p className="text-[10px] text-slate-400 mt-1">{filteredMessages.length} resultado(s)</p>}
              </div>
            )}

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-3"
              style={{ background: isTecnico ? "linear-gradient(180deg, #fffbf0 0%, #fef9ec 100%)" : "linear-gradient(180deg, #f0faf7 0%, #f1f5f9 100%)" }}>

              {filteredMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
                    style={{ background: isTecnico ? TECNICO_GRADIENT : BRAND_GRADIENT }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Nenhuma mensagem ainda</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isTecnico ? "Inicie a discussão técnica da equipe" : "Comece a comunicação com a equipe"}
                  </p>
                </div>
              )}

              {filteredMessages.map((msg: any) => {
                const own = isOwnMessage(msg);
                if (!msg.content?.trim() && !msg.attachment_url) return null;
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}>

                    {!own && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background: isTecnico ? TECNICO_GRADIENT : BRAND_GRADIENT }}>
                        {msg.author_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}

                    <div className={`flex flex-col gap-1 ${own ? "items-end max-w-[55%]" : "items-start max-w-[55%]"}`}>
                      <div className={`flex items-center gap-1.5 ${own ? "flex-row-reverse" : ""}`}>
                        <span className="text-[11px] font-semibold text-slate-500">{own ? "Você" : msg.author_name}</span>
                        <span className="text-[10px] text-slate-400">{formatTime(msg.created_at)}</span>
                      </div>

                      <div className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm max-w-full min-w-[2rem] ${
                        own ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                      }`} style={
                        own
                          ? { background: "#e8f7f2", border: "1px solid #b2dfd1", color: "#1e293b" }
                          : isTecnico
                            ? { background: "#fffbeb", border: "1px solid #fde68a", color: "#1e293b" }
                            : { background: "white", border: "1px solid #e2e8f0", color: "#1e293b" }
                      }>
                        {msg.content && <p className="break-words">{msg.content}</p>}
                        <MessageAttachment msg={msg} isTecnico={isTecnico} own={own} />
                      </div>
                    </div>

                    {own && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ background: isTecnico ? TECNICO_GRADIENT : BRAND_GRADIENT }}>
                        {msg.author_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <div className="flex-shrink-0 px-4 md:px-6 pb-2">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-lg grid grid-cols-8 gap-1">
                  {EMOJIS.map(e => <button key={e} onClick={() => insertEmoji(e)} className="text-lg hover:bg-slate-50 rounded-lg p-1 transition active:scale-95">{e}</button>)}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`flex-shrink-0 px-4 md:px-6 py-3 border-t ${isTecnico ? "border-amber-100 bg-amber-50/20" : "border-slate-100 bg-white"}`}>
              {pendingFile && <AttachmentPreview file={pendingFile} onRemove={() => setPendingFile(null)} />}

              {recording ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                  style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <span className="text-sm font-semibold text-red-500 flex-1">
                    Gravando... {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                  </span>
                  <button onClick={cancelRecording} className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">Cancelar</button>
                  <button onClick={stopRecording} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
                    style={{ background: isTecnico ? TECNICO_GRADIENT : BRAND_GRADIENT }}>Concluir</button>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <button onClick={() => setShowEmoji(!showEmoji)} className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-lg">😊</button>

                  <button onClick={() => fileInputRef.current?.click()} title="Anexar arquivo"
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileSelect} />

                  <textarea ref={textareaRef} value={newMessage}
                    onChange={e => {
                      setNewMessage(e.target.value);
                      // Auto-resize
                      e.target.style.height = "auto";
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                    }} onKeyDown={handleKeyDown}
                    placeholder={pendingFile ? "Adicionar legenda..." : isTecnico ? "Grupo técnico..." : "Grupo assistencial..."}
                    rows={1} className={`flex-1 px-4 rounded-2xl text-sm resize-none outline-none border transition ${
                      isTecnico ? "border-amber-200 bg-white focus:border-amber-400 placeholder:text-amber-300" : "border-slate-200 bg-slate-50 focus:border-sinergya-green focus:bg-white placeholder:text-slate-400"
                    }`} style={{ overflowY: "auto", minHeight: "42px", maxHeight: "120px", paddingTop: "10px", paddingBottom: "10px" }} />

                  <button onClick={startRecording} title="Gravar voz"
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-slate-400">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  </button>

                  <button onClick={handleSendMessage} disabled={!canSend}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-35 active:scale-95 shadow-sm"
                    style={{ background: isTecnico ? TECNICO_GRADIENT : BRAND_GRADIENT }}>
                    {sending || uploading
                      ? <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    }
                  </button>
                </div>
              )}
              <p className="text-[10px] text-slate-300 mt-1.5 pl-1">Enter para enviar · Shift+Enter para quebrar linha</p>
            </div>
          </div>
        )}

        {/* DIÁRIO */}
        {activeTab === "diario" && (
          <div className="px-4 md:px-8 py-6 overflow-y-auto h-full">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs text-slate-400 mb-4">Registros enviados pelo paciente · Somente leitura</p>
              {diary.length === 0 && <p className="text-sm text-slate-400 py-8">Nenhum registro de diário encontrado.</p>}
              {diary.map((entry: any) => (
                <div key={entry.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                  <span className="mt-3 block text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAREFAS */}
        {activeTab === "tarefas" && (
          <div className="px-4 md:px-8 py-6 overflow-y-auto h-full">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs text-slate-400 mb-4">Gestão de orientações e tarefas</p>
              {totalTasks > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">Progresso das orientações</span>
                    <span className="text-xs font-bold" style={{ color: "#1e8c68" }}>{doneTasks}/{totalTasks} concluídas</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: BRAND_GRADIENT }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">{progressPct}% completo</p>
                </div>
              )}
              {canCreateTask && (
                <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500 mb-1">Nova orientação</p>
                  <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Título da tarefa ou orientação..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-sinergya-green transition" />
                  <input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} placeholder="Descrição detalhada (opcional)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-sinergya-green transition" />
                  <div className="flex justify-end">
                    <button onClick={handleCreateTask} disabled={!newTask.trim()}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition active:scale-95 shadow-sm"
                      style={{ background: BRAND_GRADIENT }}>
                      + Criar orientação
                    </button>
                  </div>
                </div>
              )}
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: BRAND_GRADIENT }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                      <path d="M9 11l3 3L22 4"/>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  </div>
                  <p className="text-sm text-slate-400">Nenhuma orientação ainda</p>
                </div>
              )}
              {[...tasks.filter(t => !t.is_done), ...tasks.filter(t => t.is_done)].map((task: any) => (
                <div key={task.id} className={`rounded-xl p-4 border transition-all ${task.is_done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => handleMarkDone(task.id, !task.is_done)}
                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${task.is_done ? "border-sinergya-green bg-sinergya-green" : "border-slate-300 hover:border-sinergya-green"}`}>
                      {task.is_done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</p>
                      {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                      {task.is_done && task.done_at && (
                        <span className="text-xs mt-1 block font-medium" style={{ color: "#1e8c68" }}>✓ Concluída em {formatDate(task.done_at)}</span>
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