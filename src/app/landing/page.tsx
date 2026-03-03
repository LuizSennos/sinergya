"use client";

import Link from "next/link";
import Image from "next/image";
import InstallPWA from "@/components/InstallPWA";
import { useState, useEffect } from "react";

const TABS = [
  {
    key: "grupo-assist",
    label: "Grupo Assist.",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    messages: [
      { name: "Dra. Ana Paula", msg: "Paciente apresentou boa evolução na sessão.", own: false, time: "09:30" },
      { name: "Dr. Carlos Melo", msg: "Confirmo. Vamos manter o protocolo atual.", own: false, time: "09:45" },
      { name: "Você", msg: "Anotado! Próxima sessão na quinta.", own: true, time: "10:02" },
    ],
  },
  {
    key: "grupo-tec",
    label: "Grupo Téc.",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    messages: [
      { name: "Dr. Carlos Melo", msg: "Lembrete: revisar prontuário antes de quinta.", own: false, time: "08:10" },
      { name: "Dra. Ana Paula", msg: "Feito. Também atualizei o plano terapêutico.", own: false, time: "08:22" },
      { name: "Você", msg: "Perfeito, obrigado a todos 👍", own: true, time: "08:35" },
    ],
  },
  {
    key: "diario",
    label: "Diário",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    messages: [
      { name: "Maria Costa", msg: "Hoje me senti mais tranquila após os exercícios.", own: false, time: "07:00" },
      { name: "Maria Costa", msg: "Dormi bem pela primeira vez em semanas.", own: false, time: "07:02" },
      { name: "Dra. Ana Paula", msg: "Que ótima notícia! Continue assim 🌱", own: true, time: "09:15" },
    ],
  },
  {
    key: "tarefas",
    label: "Tarefas",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    messages: [
      { name: "Sistema", msg: "✅ Sessão registrada — Dra. Ana Paula", own: false, time: "09:32" },
      { name: "Sistema", msg: "⏳ Relatório mensal pendente — Dr. Carlos", own: false, time: "10:00" },
      { name: "Você", msg: "Relatório enviado agora.", own: true, time: "10:18" },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "O Sinergya é seguro para dados de pacientes?",
    a: "Sim. A plataforma é totalmente compatível com a LGPD. Todos os dados são criptografados e armazenados com segurança. Cada acesso é registrado com autor, data e hora.",
  },
  {
    q: "Qual a diferença entre a versão universitária e a profissional?",
    a: "A versão universitária foi pensada para clínicas escola, com fluxo de supervisão integrado e controle pedagógico. A versão profissional é para clínicas e consultórios com equipes multidisciplinares.",
  },
  {
    q: "O paciente também acessa a plataforma?",
    a: "Sim. O paciente tem acesso ao Grupo Assistencial (comunicação com a equipe) e ao seu próprio Diário. O canal técnico é exclusivo para profissionais.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim! O Sinergya é um Progressive Web App (PWA) — funciona no navegador do celular com experiência próxima a um app nativo, sem precisar instalar nada.",
  },
  {
    q: "Como faço para começar?",
    a: "O produto está em validação. Entre em contato pelo botão abaixo para solicitar acesso antecipado e nossa equipe vai te atender.",
  },
];

function FAQList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl border transition-all overflow-hidden"
          style={{
            borderColor: open === i ? "rgba(30,140,104,0.3)" : "#e2e8f0",
            background: open === i ? "rgba(30,140,104,0.03)" : "white",
          }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
          >
            <span className="text-sm font-semibold text-slate-800">{item.q}</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="flex-shrink-0 transition-transform duration-300 text-slate-400"
              style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveTab((prev) => (prev + 1) % TABS.length);
        setAnimating(false);
      }, 250);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const handleTabClick = (i: number) => {
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(i);
      setAnimating(false);
    }, 200);
  };

  const current = TABS[activeTab];

  return (
    <main style={{ minHeight: "100vh", background: "transparent", overflow: "hidden" }}>

      {/* ── HERO + NAV INTEGRADA ── */}
      <section className="relative px-6 md:px-12 pb-0 overflow-hidden">

        {/* Fundo radial — mais profundo com spotlight central */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(30,140,104,0.13) 0%, transparent 55%), radial-gradient(circle at 15% 15%, rgba(30,140,104,0.20), transparent 40%), radial-gradient(circle at 82% 25%, rgba(42,127,196,0.18), transparent 38%), radial-gradient(circle at 50% 80%, rgba(79,168,232,0.07), transparent 45%), #f7fbf9",
          }}
        />

        {/* ── NAV dentro do hero ── */}
        <div className="max-w-6xl mx-auto flex items-center justify-between pt-7 pb-2">
          {/* Logo + nome */}
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

          <div className="hidden md:flex items-center gap-7">
            {[
              { label: "Funcionalidades", href: "#funcionalidades" },
              { label: "Para quem", href: "#para-quem" },
              { label: "Depoimentos", href: "#depoimentos" },
              { label: "Blog", href: "#blog" },
              { label: "FAQ", href: "#faq" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
              >
                {label}
                <span
                  className="absolute -bottom-0.5 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 rounded-full"
                  style={{ background: "linear-gradient(90deg, #1e8c68, #2a7fc4)" }}
                />
              </Link>
            ))}

            <Link
              href="/login"
              className="relative px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden group transition-transform hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, #1e8c68, #2a7fc4)",
                boxShadow: "0 4px 16px rgba(30,140,104,0.28)",
              }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
              <span className="relative">Acessar</span>
            </Link>
          </div>

          {/* Mobile */}
          <button className="md:hidden text-slate-600">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        {/* ── Conteúdo do hero ── */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-4 pt-12">

          {/* Texto */}
          <div className="flex-1 text-center lg:text-left pb-16">
            <span
              className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "rgba(30,140,104,0.12)", color: "#186050", border: "1px solid rgba(30,140,104,0.15)" }}
            >
              Plataforma Multiprofissional de Saúde
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-xl">
  Sua equipe e seu paciente,{" "}
  <span 
    className="font-black bg-clip-text text-transparent"
    style={{
      backgroundImage: "linear-gradient(135deg, #1e8c68, #2a7fc4)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent"
    }}
  >
    unidos no cuidado
  </span>
</h1>

            <p className="mt-5 text-base md:text-lg max-w-lg text-slate-600 mx-auto lg:mx-0">
              Comunicação organizada entre profissionais de saúde e pacientes.
              Grupos assistenciais, canal técnico privado e diário do paciente.
            </p>
<div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
  {/* Botão Principal com o gradiente do título */}
 <Link
  href="/login"
  className="px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
  style={{
    background: "linear-gradient(135deg, #1e8c68, #2a7fc4)",
    boxShadow: "0 8px 20px rgba(30,140,104,0.25)",
  }}
>
  Começar agora
</Link>

  {/* Botão Secundário - Estilo Outline Sutil */}
  <Link
    href="#funcionalidades"
    className="w-full sm:w-auto text-center px-10 py-4 rounded-xl text-base font-semibold text-emerald-800 bg-white border-2 transition-all hover:border-emerald-200 hover:bg-emerald-50 active:scale-98 shadow-sm"
    style={{
      border: "1px solid rgba(30,140,104,0.2)",
color: "#1e8c68" // O verde inicial do seu gradiente
    }}
  >
    Ver funcionalidades
  </Link>
</div>

            <div className="mt-5 text-xs text-slate-500">
              🔒 Dados protegidos conforme a LGPD
            </div>
          </div>

          {/* Mockup */}
          <div className="flex-1 flex justify-center lg:justify-end items-end self-end">
            <div
              className="relative w-full max-w-sm lg:max-w-md rounded-t-3xl overflow-hidden"
              style={{
                boxShadow: "0 -8px 60px rgba(46,158,120,0.2), 0 0 40px rgba(58,130,210,0.15)",
              }}
            >
              <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ background: "#f7fbf9", borderColor: "#E6EEF8" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <div className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-400 text-center border border-[#E6EEF8]">
                  sinergya.app.br
                </div>
              </div>

              <div className="bg-white" style={{ minHeight: 380, border: "1px solid #E6EEF8" }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6EEF8]" style={{ background: "#f7fbf9" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(30,140,104,0.15)", color: "#1e8c68" }}>M</div>
                    <div>
                      <p className="text-slate-800 text-xs font-semibold leading-none">Maria Costa</p>
                      <p className="text-slate-400 text-[10px]">Psicologia</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(30,140,104,0.10)", color: "#186050" }}>🔒 LGPD</span>
                </div>

                <div className="flex border-b border-slate-100 px-2">
                  {TABS.map((tab, i) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabClick(i)}
                      className="flex items-center gap-1 px-2 py-2.5 text-[10px] font-medium border-b-2 transition-all duration-200 cursor-pointer select-none"
                      style={{
                        borderColor: i === activeTab ? "#2a7fc4" : "transparent",
                        color: i === activeTab ? "#1e8c68" : "#94a3b8",
                      }}
                    >
                      <span style={{ color: i === activeTab ? "#1e8c68" : "#94a3b8" }}>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                  <div className="ml-auto flex items-center pr-1">
                    <div className="flex gap-1">
                      {TABS.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => handleTabClick(i)}
                          className="cursor-pointer rounded-full transition-all duration-300"
                          style={{
                            width: i === activeTab ? 14 : 5,
                            height: 5,
                            background: i === activeTab ? "linear-gradient(90deg, #1e8c68, #2a7fc4)" : "#e2e8f0",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="px-3 py-3 space-y-2.5 transition-opacity duration-200"
                  style={{
                    background: "linear-gradient(180deg, #f8fafc, #f1f5f9)",
                    opacity: animating ? 0 : 1,
                    minHeight: 240,
                  }}
                >
                  {current.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.own ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[78%] px-3 py-2 rounded-2xl text-[11px] leading-snug ${
                          m.own ? "text-white rounded-tr-sm" : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm"
                        }`}
                        style={m.own ? { background: "linear-gradient(135deg, #1e8c68, #2a7fc4)" } : {}}
                      >
                        {!m.own && (
                          <p className="font-semibold text-[10px] mb-0.5" style={{ color: "#2a7fc4" }}>{m.name}</p>
                        )}
                        {m.msg}
                        <span className="block text-[9px] mt-0.5 opacity-60 text-right">{m.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2.5 border-t border-slate-100 bg-white flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full px-3 py-1.5 text-[11px] text-slate-400">
                    Escrever mensagem...
                  </div>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── WAVE TRANSITION ── */}
      <div className="relative -mb-1 overflow-hidden" style={{ background: "#f7fbf9" }}>
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="white"/>
        </svg>
      </div>

      {/* ── SOCIAL PROOF STRIP ── */}
      <div className="bg-white pt-2 pb-10">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs font-semibold tracking-widest text-slate-400 mb-6 uppercase">
            Confiado por equipes de saúde em todo o Brasil
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {[
              { name: "Clínica Bem Estar", icon: "🏥" },
              { name: "UniSaúde Escola", icon: "🎓" },
              { name: "Reabilita Center", icon: "💪" },
              { name: "Instituto Mente Viva", icon: "🧠" },
              { name: "Fisio & Vida", icon: "🌱" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="text-lg opacity-70">{p.icon}</span>
                <span className="text-sm font-semibold whitespace-nowrap">{p.name}</span>
              </div>
            ))}
          </div>
          {/* Linha divisória suave */}
          <div className="mt-10 h-px mx-auto max-w-xs" style={{ background: "linear-gradient(90deg, transparent, rgba(30,140,104,0.2), transparent)" }} />
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="funcionalidades" className="px-6 md:px-12 pb-24 pt-16 bg-white relative overflow-hidden">

        {/* Fundo decorativo */}
        <div className="absolute inset-0 -z-10" style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(30,140,104,0.06) 0%, transparent 60%)",
        }} />

        <div className="max-w-6xl mx-auto">

          {/* Header chamativo */}
         <div className="text-center mb-16">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(30,140,104,0.10)", color: "#186050", border: "1px solid rgba(30,140,104,0.15)" }}>
              ⚡ Funcionalidades
            </span>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Tudo que sua equipe{" "}
              <span
                className="font-black bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(135deg, #1e8c68, #2a7fc4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                realmente precisa.
              </span>
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Sem planilha. Sem WhatsApp. Sem e-mail perdido. <strong className="text-slate-700">Tudo num só lugar.</strong>
            </p>
          </div>

          {/* Grid de features — maior, mais bold */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "💬",
                title: "Grupo Assistencial",
                desc: "Toda a equipe e o paciente numa conversa só. Sem ruído, sem informação perdida.",
                color: "#1e8c68",
                bg: "rgba(30,140,104,0.07)",
                border: "rgba(30,140,104,0.15)",
              },
              {
                icon: "🔒",
                title: "Grupo Técnico",
                desc: "Canal exclusivo dos profissionais. Discuta casos com sigilo total — o paciente não vê.",
                color: "#2a7fc4",
                bg: "rgba(42,127,196,0.07)",
                border: "rgba(42,127,196,0.15)",
              },
              {
                icon: "📓",
                title: "Diário do Paciente",
                desc: "O paciente registra sua evolução diariamente. Você acompanha em tempo real.",
                color: "#c9a227",
                bg: "rgba(201,162,39,0.07)",
                border: "rgba(201,162,39,0.18)",
              },
              {
                icon: "✅",
                title: "Tarefas",
                desc: "Delegue, acompanhe e conclua. Cada profissional sabe exatamente o que fazer.",
                color: "#1e8c68",
                bg: "rgba(30,140,104,0.07)",
                border: "rgba(30,140,104,0.15)",
              },
              {
                icon: "👥",
                title: "Multiprofissional",
                desc: "Psicólogo, fisio, fono — todos juntos em torno do mesmo paciente. Sem silo.",
                color: "#2a7fc4",
                bg: "rgba(42,127,196,0.07)",
                border: "rgba(42,127,196,0.15)",
              },
              {
                icon: "📊",
                title: "Auditoria",
                desc: "Quem acessou, o quê, quando. Rastreabilidade total. Sua clínica blindada.",
                color: "#c9a227",
                bg: "rgba(201,162,39,0.07)",
                border: "rgba(201,162,39,0.18)",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2 cursor-default relative overflow-hidden"
                style={{
                  background: f.bg,
                  border: `1.5px solid ${f.border}`,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Ícone grande */}
                <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110 inline-block">
                  {f.icon}
                </div>

                <h3 className="font-black text-lg mb-2 text-slate-800">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>

                {/* Linha de cor no rodapé */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }}
                />
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* ── PARA QUEM ── */}
      <section id="para-quem" className="px-6 md:px-12 py-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #e8f5f0 0%, #f0f8ff 100%)" }}>

        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full -z-0 opacity-30" style={{ background: "radial-gradient(circle, rgba(42,127,196,0.25), transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full -z-0 opacity-20" style={{ background: "radial-gradient(circle, rgba(30,140,104,0.3), transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(30,140,104,0.12)", color: "#186050", border: "1px solid rgba(30,140,104,0.15)" }}>
              Feito pra você
            </span>
            <h2 className="text-3xl font-bold mb-3">Para quem é o Sinergya?</h2>
            <p className="text-slate-500">Duas versões para contextos diferentes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Versão Universitária */}
            <div
              className="group rounded-3xl p-8 bg-white relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ border: "1.5px solid rgba(30,140,104,0.15)", boxShadow: "0 4px 24px rgba(30,140,104,0.08)" }}
            >
              {/* Faixa de cor no topo */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #1e8c68, #6ecfb3)" }} />

              {/* Ícone */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110" style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.12), rgba(30,140,104,0.06))" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>

              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "rgba(30,140,104,0.10)", color: "#1e8c68" }}>
                Clínicas Escola
              </div>

              <h3 className="text-xl font-bold mb-3 text-slate-800">Versão Universitária</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Clínicas escola com supervisão integrada e fluxo educacional estruturado. Supervisores acompanham estagiários em tempo real.
              </p>

              {/* Features list */}
              <ul className="space-y-2.5">
                {["Supervisão em tempo real", "Fluxo de aprovação pedagógica", "Relatórios por turma", "Controle de estágio"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(30,140,104,0.12)" }}>
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.03), transparent)" }} />
            </div>

            {/* Versão Profissional */}
    {/* Versão Profissional */}
<div
  className="group rounded-3xl p-8 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
  style={{
    background: "linear-gradient(145deg, #e9f5f1 0%, #d7ece6 100%)",
    border: "1.5px solid rgba(30,140,104,0.15)",
    boxShadow: "0 4px 24px rgba(30,140,104,0.08)"
  }}
>
  {/* Faixa de cor no topo */}
  <div
    className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
    style={{ background: "linear-gradient(90deg, #c9a227, #f0d878)" }}
  />

  {/* Ícone */}
  <div
    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
    style={{
      background: "linear-gradient(135deg, rgba(30,140,104,0.12), rgba(30,140,104,0.06))"
    }}
  >
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1e8c68"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </div>

  <div
    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
    style={{
      background: "rgba(30,140,104,0.10)",
      color: "#1e8c68"
    }}
  >
    Clínicas & Consultórios
  </div>

  <h3 className="text-xl font-bold mb-3 text-slate-800">
    Versão Profissional
  </h3>

  <p className="text-sm text-slate-500 leading-relaxed mb-6">
    Clínicas e consultórios com equipes organizadas em torno do paciente.
    Comunicação estruturada, segura e eficiente.
  </p>

  {/* Features list */}
  <ul className="space-y-2.5">
    {[
      "Grupos por paciente",
      "Canal técnico privado",
      "Diário do paciente",
      "Auditoria completa"
    ].map(f => (
      <li
        key={f}
        className="flex items-center gap-2.5 text-sm text-slate-600"
      >
        <div
          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(30,140,104,0.12)" }}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1e8c68"
            strokeWidth="3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {f}
      </li>
    ))}
  </ul>

  {/* Hover glow */}
  <div
    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    style={{
      background: "linear-gradient(135deg, rgba(30,140,104,0.03), transparent)"
    }}
  />
</div>
</div>
</div>
      </section>

      {/* ── MÉTRICAS ── */}
      <section className="px-6 md:px-12 py-16 bg-white border-t border-[#E6EEF8]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "500+", label: "Pacientes acompanhados", icon: "🧑‍⚕️" },
            { num: "120+", label: "Profissionais ativos", icon: "👩‍💼" },
            { num: "98%", label: "Satisfação dos usuários", icon: "⭐" },
            { num: "3x", label: "Mais rápido que e-mail", icon: "⚡" },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{m.icon}</span>
              <p className="text-4xl font-bold" style={{
                backgroundImage: "linear-gradient(130deg, #1a7a5e, #2a6fab)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{m.num}</p>
              <p className="text-sm text-slate-500">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DEPOIMENTOS ── */}
      <section id="depoimentos" className="px-6 md:px-12 py-20" style={{ background: "linear-gradient(160deg, #f0faf6 0%, #eef6ff 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Quem usa, recomenda</h2>
            <p className="text-slate-500">Profissionais que transformaram sua rotina com o Sinergya</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Dra. Ana Paula",
                role: "Psicóloga Clínica",
                text: "Finalmente consigo me comunicar com toda a equipe sem perder o fio. O diário do paciente mudou completamente como acompanho a evolução entre as sessões.",
                avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=80&h=80&fit=crop&crop=face",
                stars: 5,
                color: "#1e8c68",
              },
              {
                name: "Dr. Carlos Melo",
                role: "Fisioterapeuta",
                text: "O canal técnico privado é essencial. Conseguimos discutir casos sem que o paciente veja, mantendo sigilo e qualidade no cuidado multiprofissional.",
                avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face",
                stars: 5,
                color: "#2a7fc4",
              },
              {
                name: "Profa. Mariana Souza",
                role: "Supervisora — Clínica Escola",
                text: "A versão universitária é perfeita para supervisão. Consigo acompanhar o trabalho dos alunos em tempo real e intervir quando necessário.",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face",
                stars: 5,
                color: "#c9a227",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl p-7 bg-white border border-slate-100 flex flex-col gap-4"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
              >
                {/* Estrelas */}
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f0c040" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  ))}
                </div>

                {/* Texto */}
                <p className="text-sm text-slate-600 leading-relaxed flex-1">"{t.text}"</p>

                {/* Autor */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs" style={{ color: t.color }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 1. SEGURANÇA (Autoridade e Confiança) ── */}
<section id="seguranca" className="relative px-6 md:px-12 py-24 bg-white overflow-hidden border-t border-slate-50">
  {/* Fundo sutil para separar do que veio antes */}
  <div 
    className="absolute inset-0 -z-10 opacity-30" 
    style={{ 
      background: "radial-gradient(circle at 10% 20%, rgba(30,140,104,0.05) 0%, transparent 40%)" 
    }} 
  />

  <div className="max-w-5xl mx-auto text-center relative">
    <span 
      className="inline-block mb-6 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase" 
      style={{ 
        background: "rgba(30,140,104,0.08)", 
        color: "#186050", 
        border: "1px solid rgba(30,140,104,0.1)" 
      }}
    >
      🔒 Segurança Nível Bancário
    </span>
    
    <h2 className="text-3xl md:text-5xl font-black leading-tight max-w-2xl mx-auto mb-6 text-slate-900">
      Sua clínica blindada,{" "}
      <span 
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}
      >
        seus dados protegidos
      </span>
    </h2>
    
    <p className="text-slate-500 mb-16 max-w-2xl mx-auto text-lg">
      O Sinergya segue o padrão <strong>Privacy by Design</strong>. 
      Segurança não é um acessório, é o coração da nossa tecnologia.
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
          title: "LGPD Nativa",
          desc: "Gestão de consentimento e rastreabilidade total de dados sensíveis.",
        },
        {
          icon: "M7 11V7a5 5 0 0 1 10 0v4", // Simplificado para o exemplo
          title: "Criptografia",
          desc: "Protocolos TLS 1.3 e AES-256 para máxima proteção no tráfego.",
        },
        {
          icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
          title: "Logs de Auditoria",
          desc: "Histórico imutável de todos os acessos com carimbo de tempo real.",
        },
      ].map((item) => (
        <div 
          key={item.title} 
          className="group rounded-2xl p-8 text-left transition-all duration-300 border border-slate-100 bg-white hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-1"
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-sm" 
            style={{ background: "linear-gradient(135deg, rgba(30,140,104,0.1), rgba(42,127,196,0.1))" }}
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e8c68" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <path d={item.icon} />
             </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
          <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ── 2. BLOG (Conteúdo e Autoridade) ── */}
<section id="blog" className="px-6 md:px-12 py-24 bg-slate-50/50 border-t border-b border-slate-100">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-black text-slate-900 mb-4">Do nosso blog</h2>
      <p className="text-slate-500">Conhecimento para evoluir sua prática clínica</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600",
          tag: "Comunicação", color: "#1e8c68",
          title: "Como a comunicação multiprofissional reduz erros clínicos",
          date: "18 fev 2025"
        },
        {
          img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600",
          tag: "LGPD", color: "#2a7fc4",
          title: "LGPD na saúde: o que sua clínica precisa saber em 2025",
          date: "05 fev 2025"
        },
        {
          img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600",
          tag: "Gestão", color: "#c9a227",
          title: "Supervisão clínica na era digital: novos modelos",
          date: "28 jan 2025"
        }
      ].map((post) => (
        <div key={post.title} className="bg-white rounded-2xl overflow-hidden border border-slate-100 group cursor-pointer hover:shadow-xl transition-all">
          <div className="h-48 overflow-hidden">
            <img src={post.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="p-6">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-4 inline-block" style={{ background: `${post.color}15`, color: post.color }}>{post.tag}</span>
            <h3 className="font-bold text-slate-800 leading-snug mb-4 group-hover:text-emerald-700 transition-colors">{post.title}</h3>
            <span className="text-xs text-slate-400">{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* ── 3. FAQ (Dúvidas Finais) ── */}
<section id="faq" className="px-6 md:px-12 py-24 bg-white">
  <div className="max-w-3xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-black text-slate-900 mb-4">Perguntas frequentes</h2>
      <p className="text-slate-500">Tudo o que você precisa saber para começar</p>
    </div>
    <FAQList />
  </div>
</section>

{/* ── 4. CTA FINAL (VIBRANTE MAS CONDIZENTE) ── */}
<section className="py-24 px-6 bg-white">
  <div 
    className="max-w-5xl mx-auto rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden border border-emerald-100/60 shadow-xl shadow-emerald-50/50"
    style={{ 
      background: "linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(30,140,104,0.04) 100%)" 
    }}
  >
    {/* Brilhos sutis de cor nas pontas para dar vibração */}
    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl" />
    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-100/40 rounded-full blur-3xl" />

    <div className="relative z-10">
      <span className="inline-block mb-4 text-emerald-600 font-bold text-xs uppercase tracking-[0.2em]">
        🚀 Comece hoje mesmo
      </span>
      
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
        Pronto para transformar<br/>
        <span 
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}
        >
          sua clínica?
        </span>
      </h2>
      
      <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
        Junte-se a centenas de profissionais que já otimizaram sua gestão com o Sinergya.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button 
          className="px-10 py-5 rounded-full font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-200"
          style={{ background: "linear-gradient(135deg, #1e8c68, #2a7fc4)" }}
        >
          Começar Agora — É Grátis
        </button>
        <button className="px-10 py-5 rounded-full font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
          Falar com Especialista
        </button>
      </div>
    </div>
  </div>
</section>

{/* ── 5. FOOTER (CLARO, MODERNO E INTEGRADO) ── */}
<footer className="py-16 px-6 border-t border-slate-100 bg-white">
  <div className="max-w-6xl mx-auto">
    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
      
      {/* LADO ESQUERDO: LOGO PNG */}
      <div className="flex flex-col items-center md:items-start">
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
        <p className="text-sm text-slate-400 max-w-xs text-center md:text-left">
          Tecnologia inteligente para gestão de clínicas e cuidado multiprofissional.
        </p>
      </div>

      {/* CENTRO: LINKS RÁPIDOS */}
      <nav className="flex gap-x-8 gap-y-4 text-sm font-bold text-slate-500">
        <a href="#seguranca" className="hover:text-emerald-600 transition-colors">Segurança</a>
        <a href="#blog" className="hover:text-emerald-600 transition-colors">Blog</a>
        <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
      </nav>

      {/* DIREITA: CONTATO / REDES */}
      <div className="flex flex-col items-center md:items-end">
        <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-widest">© 2026 Sinergya Tecnologia</p>
        <div className="flex gap-3">
           {/* Botões de redes sociais sutis */}
           <div className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
           </div>
           <div className="w-8 h-8 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
           </div>
        </div>
      </div>
    </div>
    
    {/* ASSINATURA FINAL */}
    <div className="mt-16 pt-8 border-t border-slate-50 text-center">
       <span className="text-[10px] text-slate-300 uppercase tracking-[0.4em] font-medium">Privacy by Design • LGPD Compliant • SSL Secured</span>
    </div>
  </div>
</footer>

     

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

    
    </main>
  );
}