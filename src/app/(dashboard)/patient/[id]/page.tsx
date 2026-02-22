"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { mockPatients, mockMessages, mockDiary, mockTasks } from "@/data/mock";
import { Message, DiaryEntry, Task } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

type Tab = "assistencial" | "tecnico" | "diario" | "tarefas";

export default function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("assistencial");
  const [newMessage, setNewMessage] = useState("");

  const patient = mockPatients.find((p) => p.id === id);
  const messages = mockMessages[id] ?? [];
  const diary = mockDiary[id] ?? [];
  const tasks = mockTasks[id] ?? [];

  if (!patient) return <div className="p-10 text-slate-500">Paciente não encontrado.</div>;

  const assistencialMsgs = messages.filter((m) => m.context === "assistencial");
  const tecnicoMsgs = messages.filter((m) => m.context === "tecnico");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "assistencial", label: "Grupo Assistencial", count: assistencialMsgs.length },
    { key: "tecnico", label: "Grupo Técnico", count: tecnicoMsgs.length },
    { key: "diario", label: "Diário", count: diary.length },
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
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 flex items-center gap-2 ${
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

      {/* CONTEÚDO */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {/* GRUPO ASSISTENCIAL */}
        {activeTab === "assistencial" && (
          <div className="max-w-3xl space-y-4">
            <p className="text-xs text-slate-400 mb-4">Visível ao paciente • Comunicação contínua com a equipe</p>
            {assistencialMsgs.map((msg) => (
              <MessageCard key={msg.id} msg={msg} />
            ))}
            <MessageInput value={newMessage} onChange={setNewMessage} placeholder="Escrever no grupo assistencial..." />
          </div>
        )}

        {/* GRUPO TÉCNICO */}
        {activeTab === "tecnico" && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <p className="text-xs text-slate-400">Invisível ao paciente • Discussão técnica da equipe</p>
            </div>
            {tecnicoMsgs.map((msg) => (
              <MessageCard key={msg.id} msg={msg} technical />
            ))}
            <MessageInput value={newMessage} onChange={setNewMessage} placeholder="Escrever no grupo técnico..." technical />
          </div>
        )}

        {/* DIÁRIO */}
        {activeTab === "diario" && (
          <div className="max-w-3xl space-y-4">
            <p className="text-xs text-slate-400 mb-4">Registros do paciente • Somente leitura para a equipe</p>
            {diary.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-sm">Nenhum registro no diário ainda.</p>
              </div>
            )}
            {diary.map((entry) => (
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
            {tasks.map((task) => (
              <div key={task.id} className={`rounded-xl p-5 border transition-all ${
                task.is_done ? "bg-slate-50 border-slate-100 opacity-60" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    task.is_done ? "border-sinergya-green bg-sinergya-green" : "border-slate-300"
                  }`}>
                    {task.is_done && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${task.is_done ? "line-through text-slate-400" : "text-sinergya-dark"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                    )}
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

function MessageCard({ msg, technical = false }: { msg: Message; technical?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border-l-4 ${
      technical
        ? "bg-amber-50/50 border-amber-400"
        : "bg-white border-sinergya-blue shadow-sm"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
          technical ? "bg-amber-100 text-amber-700" : "bg-sinergya-blue/10 text-sinergya-blue"
        }`}>
          {msg.author_name?.[0] ?? "?"}
        </div>
        <span className="text-xs font-semibold text-slate-700">{msg.author_name}</span>
        <span className="text-xs text-slate-400">• {msg.author_role}</span>
        <span className="ml-auto text-xs text-slate-400">{new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
    </div>
  );
}

function MessageInput({ value, onChange, placeholder, technical = false }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  technical?: boolean;
}) {
  return (
    <div className={`mt-6 rounded-xl border p-4 ${technical ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder:text-slate-400"
      />
      <div className="flex justify-end mt-2">
        <button
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition"
          style={{ background: technical ? "#f59e0b" : "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}