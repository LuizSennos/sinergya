"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { apiGetMyPatient, apiGetMessages, apiSendMessage, apiGetDiary, apiCreateDiaryEntry, apiGetTasks, apiMarkTaskDone, apiUploadFile, apiSendMessageWithAttachment, apiGetSignedUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BRAND_GRADIENT = "linear-gradient(135deg, #1e8c68 0%, #2a7fc4 100%)";
const OWN_BUBBLE     = { background: "#e8f7f2", border: "1px solid #b2dfd1" };
const OTHER_BUBBLE   = { background: "white", border: "1px solid #e2e8f0" };

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

// ── Renderiza anexo dentro de uma mensagem ───────────────────────────────────
function MessageAttachment({ msg, own }: { msg: any; own: boolean }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!msg.attachment_url) return;
    if (msg.storage_path) {
      apiGetSignedUrl(msg.storage_path)
        .then(r => setUrl(r.url))
        .catch(() => setUrl(msg.attachment_url));
    } else {
      setUrl(msg.attachment_url);
    }
  }, [msg.attachment_url, msg.storage_path]);

  if (!msg.attachment_url) return null;
  if (!url) return (
    <div className="mt-1 w-8 h-8 flex items-center justify-center">
      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>
  );

  const { attachment_type: type, attachment_name: name, attachment_size: size } = msg;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden mt-1 max-w-[220px]"
        style={{ border: own ? "none" : "1px solid rgba(30,140,104,0.1)" }}>
        <img src={url} alt={name || "imagem"}
          className="w-full object-cover hover:opacity-90 transition-opacity" style={{ maxHeight: 180 }} />
      </a>
    );
  }

  if (type === "audio") {
    return (
      <div className="mt-1 rounded-xl px-3 py-2.5 max-w-[260px]"
        style={{ background: own ? "#e8f7f2" : "rgba(30,140,104,0.06)", border: "1px solid #b2dfd1" }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: own ? "rgba(30,140,104,0.15)" : "rgba(30,140,104,0.1)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1e8c68" stroke="none">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            </svg>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Mensagem de voz</span>
        </div>
        <audio controls src={url} className="w-full h-8" />
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 mt-1 px-3 py-2.5 rounded-xl max-w-[260px] hover:opacity-80 transition-opacity"
      style={{ background: own ? "#e8f7f2" : "rgba(30,140,104,0.06)", border: "1px solid #b2dfd1" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(30,140,104,0.1)" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate text-slate-700">{name || "arquivo"}</p>
        {size && <p className="text-[10px] text-slate-400">{formatFileSize(size)}</p>}
      </div>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    </a>
  );
}

// ── Preview do arquivo antes de enviar ───────────────────────────────────────
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
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
      style={{ background: "rgba(30,140,104,0.06)", border: "1px solid rgba(30,140,104,0.12)" }}>
      {isImage && preview
        ? <img src={preview} alt={file.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        : <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(30,140,104,0.1)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{file.name}</p>
        <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
      </div>
      <button onClick={onRemove}
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-100 transition text-slate-400 hover:text-red-500">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

type Tab = "assistencial" | "diario" | "tarefas";
type ModalSection = "menu" | "conta" | "configuracoes" | "notificacoes" | "ajuda";

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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Anexo ──
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // ── Gravação de voz ──
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Modal configurações ──
  const [modalOpen, setModalOpen] = useState(false);
  const [section, setSection] = useState<ModalSection>("menu");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifMensagens, setNotifMensagens] = useState(true);
  const [notifTarefas, setNotifTarefas] = useState(false);
  const [tema, setTema] = useState<"claro" | "sistema">("claro");
  const [idioma, setIdioma] = useState("pt-BR");

  function openModal() { setSection("menu"); setModalOpen(true); }
  function closeModal() { setModalOpen(false); setTimeout(() => setSection("menu"), 300); }

  function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
      <button onClick={onChange} className="relative rounded-full transition-all duration-300 flex-shrink-0"
        style={{ background: on ? "linear-gradient(135deg, #1e8c68, #2a7fc4)" : "#e2e8f0", width: 40, height: 22 }}>
        <span className="absolute top-0.5 rounded-full bg-white shadow transition-all duration-300"
          style={{ width: 18, height: 18, left: on ? 20 : 2 }} />
      </button>
    );
  }

  function BackButton() {
    return (
      <button onClick={() => setSection("menu")}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors mb-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        <span className="text-xs font-medium">Voltar</span>
      </button>
    );
  }

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!loading && !user) { window.location.href = "/login"; return; }
    if (!loading && user && !["paciente", "responsavel"].includes(user.role)) window.location.href = "/admin";
  }, [user, loading]);

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

  useEffect(() => {
    if (activeTab === "assistencial") setTimeout(scrollToBottom, 100);
  }, [messages, activeTab]);

  // ── File ──────────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  async function handleSendMessage() {
    if (!newMessage.trim() && !pendingFile) return;
    if (!patient) return;
    setSending(true);
    try {
      if (pendingFile) {
        setUploading(true);
        const uploaded = await apiUploadFile(pendingFile, patient.id, "assistencial");
        setUploading(false);
        await apiSendMessageWithAttachment(patient.id, "assistencial", newMessage, uploaded);
        setPendingFile(null);
      } else {
        await apiSendMessage(patient.id, "assistencial", newMessage);
      }
      setNewMessage("");
      setMessages(await apiGetMessages(patient.id, "assistencial"));
    } catch (err: any) { alert(err.message); }
    finally { setSending(false); setUploading(false); }
  }

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); await handleSendMessage(); }
  }

  // ── Voice ─────────────────────────────────────────────────────────────────

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

  // ── Diary & Tasks ─────────────────────────────────────────────────────────

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

  const insertEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  if (loading || !user) return null;

  if (dataLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7fbf9" }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4" style={{ borderColor: "#1e8c68", borderTopColor: "transparent" }} />
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: "#f7fbf9" }}>
      <div className="bg-white rounded-3xl p-10 max-w-md text-center shadow-sm border border-slate-100">
        <p className="text-3xl mb-4">⚠️</p>
        <h2 className="text-lg font-black text-slate-800 mb-2">Conta não vinculada</h2>
        <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
        <button onClick={logout} className="mt-6 text-sm font-semibold hover:underline" style={{ color: "#1e8c68" }}>Sair</button>
      </div>
    </div>
  );

  const doneTasks = tasks.filter(t => t.is_done).length;
  const totalTasks = tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const isOwnMessage = (msg: any) => msg.author_name && user.name && msg.author_name.toLowerCase().trim() === user.name.toLowerCase().trim();
  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()) || m.author_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;
  const canSend = (newMessage.trim() || !!pendingFile) && !sending;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "assistencial", label: "Mensagens", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { key: "diario", label: "Meu Diário", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { key: "tarefas", label: "Orientações", count: tasks.filter(t => !t.is_done).length, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  ];

  return (
    <main className="min-h-screen flex flex-col"
      style={{ background: "radial-gradient(circle at 80% 10%, rgba(30,140,104,0.12), transparent 40%), radial-gradient(circle at 0% 100%, rgba(42,127,196,0.08), transparent 40%), #f7fbf9" }}>

      {/* HEADER */}
      <header className="px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 flex-shrink-0"
        style={{ background: "rgba(247,251,249,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(30,140,104,0.1)" }}>
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
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: "rgba(30,140,104,0.08)", color: "#1e8c68", border: "1px solid rgba(30,140,104,0.12)" }}>🔒 LGPD</span>
          <button onClick={openModal} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/80 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(30,140,104,0.15)", color: "#1e8c68" }}>
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-700 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 capitalize">{user?.role}</p>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 hidden sm:block">
              <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="flex-shrink-0 px-4 md:px-8 pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(30,140,104,0.1)" }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all duration-200"
                style={activeTab === tab.key ? { background: "white", color: "#1e8c68", boxShadow: "0 2px 8px rgba(30,140,104,0.12)" } : { color: "#94a3b8" }}>
                <span style={{ color: activeTab === tab.key ? "#1e8c68" : "#94a3b8" }}>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={activeTab === tab.key ? { background: "rgba(30,140,104,0.12)", color: "#1e8c68" } : { background: "#e2e8f0", color: "#94a3b8" }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STATUS DO DIA */}
      <div className="flex-shrink-0 px-4 md:px-8 pt-3">
       <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl px-5 py-3 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.08), rgba(42,127,196,0.05))", border: "1px solid rgba(30,140,104,0.12)" }}>
            <div>
              <p className="text-xs text-slate-400">Como você está hoje?</p>
              <p className="text-sm font-semibold text-slate-700">Você ainda não registrou seu humor hoje</p>
            </div>
            <div className="text-2xl">😊</div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 flex overflow-hidden px-4 md:px-8 py-4">
      <div className="max-w-6xl w-full mx-auto flex gap-5">

          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* MENSAGENS */}
            {activeTab === "assistencial" && (
              <div className="flex flex-col flex-1 overflow-hidden rounded-3xl"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 24px rgba(0,0,0,0.04)" }}>

                <div className="px-5 py-3 flex items-center gap-2 border-b border-slate-50 flex-shrink-0" style={{ background: "rgba(30,140,104,0.03)" }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1e8c68" }} />
                  <span className="text-xs text-slate-400 flex-1">Comunicação com sua equipe de saúde</span>
                  <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(""); }}
                    className="p-1.5 rounded-lg hover:bg-black/5 transition text-slate-400 hover:text-slate-600">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </button>
                </div>

                {showSearch && (
                  <div className="px-4 py-2 border-b border-slate-50 flex-shrink-0">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar mensagens..."
                        className="w-full pl-8 pr-8 py-2 rounded-xl border text-xs outline-none transition" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#1e8c68"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,140,104,0.08)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }} />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                    {searchQuery && <p className="text-[10px] text-slate-400 mt-1 pl-1">{filteredMessages.length} resultado(s)</p>}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                  {filteredMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(30,140,104,0.08)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </div>
                      <p className="text-sm font-semibold text-slate-600">{searchQuery ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem ainda"}</p>
                      {!searchQuery && <p className="text-xs text-slate-400 mt-1">Sua equipe vai se comunicar por aqui</p>}
                    </div>
                  )}
                  {filteredMessages.map((msg: any) => {
  const own = isOwnMessage(msg);
  if (!msg.content?.trim() && !msg.attachment_url) return null;
  return (
    <div key={msg.id} className={`flex items-end gap-2 ${own ? "justify-end" : "justify-start"}`}>

      {!own && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: BRAND_GRADIENT }}>
          {msg.author_name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[55%] ${own ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-1.5 ${own ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] font-semibold text-slate-500">{own ? "Você" : msg.author_name}</span>
          <span className="text-[10px] text-slate-400">{formatTime(msg.created_at)}</span>
        </div>

        <div className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm max-w-full min-w-[2rem] ${
          own ? "rounded-2xl rounded-br-sm text-slate-900" : "rounded-2xl rounded-bl-sm text-slate-800"
        }`} style={own ? OWN_BUBBLE : OTHER_BUBBLE}>
          {msg.content && (
            <p className="break-words">
              {searchQuery
                ? <span dangerouslySetInnerHTML={{ __html: msg.content.replace(
                    new RegExp(`(${searchQuery})`, "gi"),
                    '<mark style="background:#fef08a;color:#1e293b;border-radius:2px">$1</mark>'
                  ) }} />
                : msg.content}
            </p>
          )}
          <MessageAttachment msg={msg} own={own} />
        </div>
      </div>

      {own && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
          style={{ background: BRAND_GRADIENT }}>
          {msg.author_name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}

    </div>
  );
})}
                  <div ref={messagesEndRef} />
                </div>

                {showEmoji && (
                  <div className="flex-shrink-0 px-4 pb-2 bg-white">
                    <div className="border border-slate-100 rounded-2xl p-3 shadow-md grid grid-cols-8 gap-1">
                      {EMOJIS.map(e => <button key={e} onClick={() => insertEmoji(e)} className="text-lg hover:bg-slate-100 rounded-lg p-1 transition active:scale-90">{e}</button>)}
                    </div>
                  </div>
                )}

                {/* INPUT */}
                <div className="flex-shrink-0 px-4 py-3 border-t border-slate-50 bg-white rounded-b-3xl">
                  {pendingFile && <AttachmentPreview file={pendingFile} onRemove={() => setPendingFile(null)} />}

                  {recording ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                      <span className="text-sm font-semibold text-red-500 flex-1">
                        Gravando... {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                      </span>
                      <button onClick={cancelRecording} className="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">Cancelar</button>
                      <button onClick={stopRecording} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white transition active:scale-95"
                        style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}>Concluir</button>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <button onClick={() => setShowEmoji(!showEmoji)} className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition text-lg" title="Emojis">😊</button>

                      <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition" title="Anexar arquivo">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                        </svg>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileSelect} />

                      <textarea ref={textareaRef} value={newMessage}
                        onChange={e => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder={pendingFile ? "Adicionar legenda (opcional)..." : "Escrever mensagem para a equipe..."}
                        rows={1} className="flex-1 px-4 py-2.5 rounded-2xl text-sm resize-none outline-none border transition max-h-32 placeholder:text-slate-400"
                        style={{ borderColor: "#e2e8f0", background: "#f8fafc", overflowY: "auto" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#1e8c68"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,140,104,0.08)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.boxShadow = "none"; }} />

                      <button onClick={startRecording} className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition" title="Gravar voz">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                          <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                      </button>

                      <button onClick={handleSendMessage} disabled={!canSend}
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", boxShadow: "0 4px 12px rgba(30,140,104,0.35)" }}>
                        {sending || uploading
                          ? <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
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
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                <p className="text-xs text-slate-400 px-1">Seus registros pessoais — visíveis pela equipe de saúde</p>
                <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(30,140,104,0.1)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                  <div className="px-5 py-3 border-b border-slate-50 flex items-center gap-2" style={{ background: "rgba(30,140,104,0.03)" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span className="text-xs font-semibold text-slate-500">Novo registro</span>
                  </div>
                  <div className="p-5">
                    <textarea value={newDiary} onChange={e => setNewDiary(e.target.value)} placeholder="Como você está se sentindo hoje?" rows={3}
                      className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-400" />
                    <div className="flex justify-end mt-3">
                      <button onClick={handleSendDiary} disabled={sending || !newDiary.trim()}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                        style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", boxShadow: "0 4px 12px rgba(30,140,104,0.3)" }}>
                        {sending ? "Salvando..." : "Salvar no diário"}
                      </button>
                    </div>
                  </div>
                </div>
                {diary.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(30,140,104,0.08)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">Nenhum registro ainda</p>
                    <p className="text-xs text-slate-400 mt-1">Comece registrando como você está se sentindo</p>
                  </div>
                )}
                {diary.map((entry: any, i: number) => (
                  <div key={entry.id} className="rounded-2xl overflow-hidden bg-white border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-50" style={{ background: "rgba(30,140,104,0.02)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "rgba(30,140,104,0.1)", color: "#1e8c68" }}>{diary.length - i}</div>
                      <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
                    </div>
                    <p className="px-5 py-4 text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAREFAS */}
            {activeTab === "tarefas" && (
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                <p className="text-xs text-slate-400 px-1">Orientações da sua equipe de saúde</p>
                {totalTasks > 0 && (
                  <div className="rounded-2xl p-5 bg-white border border-slate-100" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">Seu progresso</span>
                      <span className="text-xs font-bold" style={{ color: "#1e8c68" }}>{doneTasks}/{totalTasks} concluídas</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #1e8c68, #2a7fc4)" }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{progressPct}% completo {progressPct === 100 ? "🎉" : ""}</p>
                  </div>
                )}
                {tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(30,140,104,0.08)" }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">Nenhuma orientação ainda</p>
                    <p className="text-xs text-slate-400 mt-1">Sua equipe vai enviar orientações por aqui</p>
                  </div>
                )}
                {[...tasks.filter(t => !t.is_done), ...tasks.filter(t => t.is_done)].map((task: any) => (
                  <div key={task.id} className={`rounded-2xl border transition-all ${task.is_done ? "opacity-60" : ""}`}
                    style={task.is_done ? { background: "#f8fafc", borderColor: "#e2e8f0" } : { background: "white", borderColor: "rgba(30,140,104,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div className="flex items-start gap-3 p-4">
                      <button onClick={() => handleMarkDone(task.id, !task.is_done)}
                        className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={task.is_done ? { background: "#1e8c68", borderColor: "#1e8c68" } : { borderColor: "#e2e8f0" }}
                        onMouseEnter={e => { if (!task.is_done) (e.currentTarget as HTMLButtonElement).style.borderColor = "#1e8c68"; }}
                        onMouseLeave={e => { if (!task.is_done) (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; }}>
                        {task.is_done && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${task.is_done ? "line-through text-slate-400" : "text-slate-800"}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{task.description}</p>}
                        {task.is_done && task.done_at && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1.5" style={{ color: "#1e8c68" }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                            Concluída em {formatDate(task.done_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-64 xl:w-72 gap-4 flex-shrink-0">
            <div className="rounded-3xl p-5" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0" style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white" }}>{patient?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-tight">{patient?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{patient?.specialties}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: "rgba(30,140,104,0.07)", color: "#1e8c68" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Dados protegidos (LGPD)
              </div>
            </div>
            <div className="rounded-3xl p-5 bg-white border border-slate-100 hover:shadow-md transition-all duration-300" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Atividade recente</p>
              <div className="space-y-2">
                <p className="text-xs text-slate-600">📝 Último diário: há 2 dias</p>
                <p className="text-xs text-slate-600">💬 Nova mensagem da equipe</p>
              </div>
            </div>
            <div className="rounded-3xl p-5 hover:scale-[1.02] transition-transform duration-300" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(30,140,104,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Orientações</p>
              {totalTasks === 0 ? <p className="text-xs text-slate-400">Nenhuma orientação recebida.</p> : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Progresso</span>
                    <span className="text-xs font-bold" style={{ color: "#1e8c68" }}>{doneTasks}/{totalTasks}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #1e8c68, #2a7fc4)" }} />
                  </div>
                  <p className="text-xs text-slate-400">{progressPct}% completo {progressPct === 100 ? "🎉" : ""}</p>
                  {tasks.filter(t => !t.is_done).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-50 space-y-2">
                      {tasks.filter(t => !t.is_done).slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#1e8c68" }} />
                          <p className="text-xs text-slate-600 leading-snug">{task.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="rounded-3xl p-5" style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.06), rgba(42,127,196,0.04))", border: "1px solid rgba(30,140,104,0.1)" }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dica do dia</p>
              <p className="text-2xl mb-2">💡</p>
              <p className="text-xs text-slate-600 leading-relaxed">Registrar como você se sente no diário ajuda sua equipe a acompanhar melhor seu progresso. Tente escrever um pouquinho por dia!</p>
            </div>
          </aside>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÕES */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} onClick={closeModal}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.98)", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 flex items-center gap-4 border-b border-slate-50"
              style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.05), rgba(42,127,196,0.04))" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0" style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white" }}>
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm truncate">{user?.name ?? "Usuário"}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role ?? ""}</p>
              </div>
              <button onClick={closeModal} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {section === "menu" && (
              <div className="py-2">
                {([
                  { key: "conta", label: "Minha conta", sub: "Dados pessoais e preferências", color: "#1e8c68", bg: "rgba(30,140,104,0.09)", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                  { key: "configuracoes", label: "Configurações", sub: "Tema, idioma e plataforma", color: "#2a7fc4", bg: "rgba(42,127,196,0.09)", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { key: "notificacoes", label: "Notificações", sub: "Alertas e avisos da plataforma", color: "#c9a227", bg: "rgba(201,162,39,0.09)", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
                  { key: "ajuda", label: "Ajuda & Suporte", sub: "Documentação e contato", color: "#7c3aed", bg: "rgba(124,58,237,0.09)", icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
                ] as { key: ModalSection; label: string; sub: string; color: string; bg: string; icon: React.ReactNode }[]).map(item => (
                  <button key={item.key} onClick={() => setSection(item.key)}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.sub}</p>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                ))}
                <div className="px-6 pb-4 pt-2">
                  <button onClick={logout} className="w-full py-3 rounded-2xl text-sm font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
            {section === "conta" && (
              <div className="px-6 py-5">
                <BackButton />
                <h3 className="text-base font-black text-slate-800 mb-4">Minha conta</h3>
                <div className="flex items-center gap-4 p-4 rounded-2xl mb-4" style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.06), rgba(42,127,196,0.04))", border: "1px solid rgba(30,140,104,0.1)" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white" }}>{user?.name?.[0]?.toUpperCase() ?? "?"}</div>
                  <div>
                    <p className="font-black text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: "rgba(30,140,104,0.1)", color: "#1e8c68" }}>✓ LGPD aceito</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Perfil completo", sub: "Nome, foto e dados pessoais", href: "/perfil", icon: "👤" },
                    { label: "Segurança", sub: "Alterar senha e autenticação", href: "/perfil/seguranca", icon: "🔐" },
                    { label: "Privacidade & LGPD", sub: "Consentimento e dados", href: "/perfil/privacidade", icon: "🛡️" },
                  ].map(item => (
                    <button key={item.href} onClick={() => { closeModal(); window.location.href = item.href; }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {section === "configuracoes" && (
              <div className="px-6 py-5">
                <BackButton />
                <h3 className="text-base font-black text-slate-800 mb-4">Configurações</h3>
                <div className="space-y-1">
                  <div className="p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aparência</p>
                    <div className="flex gap-2">
                      {(["claro", "sistema"] as const).map(t => (
                        <button key={t} onClick={() => setTema(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={tema === t ? { background: "linear-gradient(135deg, #1e8c68, #2a7fc4)", color: "white", boxShadow: "0 2px 8px rgba(30,140,104,0.3)" } : { background: "white", color: "#94a3b8", border: "1px solid #e2e8f0" }}>
                          {t === "claro" ? "☀️ Claro" : "💻 Sistema"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div><p className="text-sm font-semibold text-slate-800">Idioma</p><p className="text-xs text-slate-400">Idioma da interface</p></div>
                    <select value={idioma} onChange={e => setIdioma(e.target.value)} className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border-none outline-none font-medium">
                      <option value="pt-BR">🇧🇷 Português</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Español</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {section === "notificacoes" && (
              <div className="px-6 py-5">
                <BackButton />
                <h3 className="text-base font-black text-slate-800 mb-4">Notificações</h3>
                <div className="space-y-1">
                  <div className="p-3 rounded-xl mb-2" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Canais</p>
                    <div className="space-y-3">
                      {[{ label: "E-mail", sub: "Resumo diário por e-mail", val: notifEmail, set: () => setNotifEmail(v => !v) }, { label: "Push", sub: "Notificações no navegador", val: notifPush, set: () => setNotifPush(v => !v) }].map(n => (
                        <div key={n.label} className="flex items-center justify-between">
                          <div><p className="text-sm font-semibold text-slate-800">{n.label}</p><p className="text-xs text-slate-400">{n.sub}</p></div>
                          <Toggle on={n.val} onChange={n.set} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Alertar sobre</p>
                    <div className="space-y-3">
                      {[{ label: "Novas mensagens", sub: "Da equipe de saúde", val: notifMensagens, set: () => setNotifMensagens(v => !v) }, { label: "Orientações", sub: "Lembretes de tarefas", val: notifTarefas, set: () => setNotifTarefas(v => !v) }].map(n => (
                        <div key={n.label} className="flex items-center justify-between">
                          <div><p className="text-sm font-semibold text-slate-800">{n.label}</p><p className="text-xs text-slate-400">{n.sub}</p></div>
                          <Toggle on={n.val} onChange={n.set} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {section === "ajuda" && (
              <div className="px-6 py-5">
                <BackButton />
                <h3 className="text-base font-black text-slate-800 mb-4">Ajuda & Suporte</h3>
                <div className="space-y-1">
                  {[
                    { icon: "📖", label: "Documentação", sub: "Guias e tutoriais de uso", href: "https://docs.sinergya.app.br" },
                    { icon: "💬", label: "Fale conosco", sub: "Abrir chamado de suporte", href: "/suporte" },
                    { icon: "🐛", label: "Reportar problema", sub: "Encontrou um bug?", href: "/suporte/bug" },
                    { icon: "📋", label: "Changelog", sub: "Novidades da plataforma", href: "/changelog" },
                  ].map(item => (
                    <button key={item.href} onClick={() => { closeModal(); window.location.href = item.href; }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
                      <span className="text-lg flex-shrink-0">{item.icon}</span>
                      <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{item.label}</p><p className="text-xs text-slate-400">{item.sub}</p></div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-300 group-hover:text-slate-400 flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl text-center" style={{ background: "#f8fafc" }}>
                  <p className="text-xs text-slate-400">Sinergya <span className="font-semibold text-slate-600">v0.1</span></p>
                  <p className="text-[10px] text-slate-300 mt-0.5">© 2025 Sinergya · LGPD</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}