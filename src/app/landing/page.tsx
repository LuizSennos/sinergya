import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="dark-page" style={{ minHeight: "100vh", background: "#0F172A", color: "#ffffff", overflow: "hidden" }}>

      <nav className="flex items-center justify-between px-10 py-6 border-b border-white/10">
        <Image src="/logo.png" alt="Sinergya" width={160} height={44} priority />
        <div className="flex items-center gap-6">
          <Link href="#funcionalidades" className="text-sm text-white/60 hover:text-white transition">Funcionalidades</Link>
          <Link href="#para-quem" className="text-sm text-white/60 hover:text-white transition">Para quem</Link>
          <Link href="/login" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-sinergya-dark transition"
            style={{ background: "linear-gradient(135deg, #4FBF9F, #63D2C6)" }}>
            Acessar plataforma
          </Link>
        </div>
      </nav>

      {/* Hero — mantido igual ao original */}
      <section className="relative px-10 pt-24 pb-32 text-center overflow-hidden">
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(ellipse, #4FBF9F, #3A7BD5)" }} />

        <div className="relative">
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-semibold border border-sinergya-green/30 text-sinergya-green bg-sinergya-green/10 tracking-wider uppercase">
            Plataforma Multiprofissional de Saúde
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            Sua equipe e seu paciente,{" "}
            <span style={{
              backgroundImage: "linear-gradient(135deg, #F5C518 0%, #4FBF9F 50%, #3A7BD5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              sempre conectados
            </span>
          </h1>

          {/* inline para manter o tom misterioso do hero */}
          <p className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Comunicação organizada entre profissionais de saúde e pacientes. Grupos assistenciais, canal técnico privado, diário do paciente e muito mais.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login" className="px-8 py-4 rounded-xl text-sm font-semibold text-sinergya-dark transition-all"
              style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)", boxShadow: "0 8px 30px rgba(79,191,159,0.3)" }}>
              Começar agora
            </Link>
            <Link href="#funcionalidades" className="px-8 py-4 rounded-xl text-sm font-semibold text-white border border-white/20 hover:border-white/40 transition">
              Ver funcionalidades
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span>🔒</span>
            <span>Dados protegidos conforme a LGPD</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="px-10 py-24 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3">Tudo que sua equipe precisa</h2>
          <p className="text-center mb-14 font-semibold" style={{ color: "#F5C518" }}>Organizado, seguro e fácil de usar</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "💬", title: "Grupo Assistencial", desc: "Canal de comunicação entre equipe e paciente. Mensagens, histórico e tarefas em um só lugar." },
              { icon: "🔒", title: "Grupo Técnico", desc: "Canal privado exclusivo para profissionais. O paciente nunca vê. Discussão técnica segura." },
              { icon: "📓", title: "Diário do Paciente", desc: "O paciente registra como está se sentindo. A equipe acompanha em tempo real." },
              { icon: "✅", title: "Tarefas e Orientações", desc: "Profissionais criam tarefas para o paciente. Acompanhamento de conclusão com data e hora." },
              { icon: "👥", title: "Equipe Multiprofissional", desc: "Psicólogo, fonoaudiólogo, fisioterapeuta — todos na mesma plataforma, cada um no seu espaço." },
              { icon: "📊", title: "Auditoria Completa", desc: "Todo registro tem autor, perfil, data e hora. Rastreabilidade total para conformidade com a LGPD." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section id="para-quem" className="px-10 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Para quem é o Sinergya?</h2>
          <p className="mb-14 font-semibold" style={{ color: "#F5C518" }}>Duas versões para contextos diferentes</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 text-left border border-sinergya-green/30 bg-sinergya-green/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sinergya-green mb-4 block">Versão Universitária</span>
              <h3 className="text-xl font-bold mb-3">Clínicas Escola</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.78)" }}>
                Para universidades com atendimento supervisionado. Acadêmicos, supervisores e pacientes organizados em um ambiente educacional seguro.
              </p>
              <ul className="space-y-2 text-sm">
                {["Acadêmicos + Supervisor obrigatório", "Supervisão integrada ao fluxo", "Separação lógica por instituição", "Linguagem educacional"].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: "#F5C518", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.88)" }}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-8 text-left border border-sinergya-blue/30 bg-sinergya-blue/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-sinergya-blue mb-4 block">Versão Profissional</span>
              <h3 className="text-xl font-bold mb-3">Clínicas e Consultórios</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.78)" }}>
                Para profissionais de saúde no mercado. Equipes multiprofissionais organizadas em torno do paciente, com comunicação clara e rastreável.
              </p>
              <ul className="space-y-2 text-sm">
                {["Profissionais autônomos ou em equipe", "Supervisor opcional", "Consentimento LGPD integrado", "Auditoria completa"].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: "#F5C518", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.88)" }}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-10 py-24 text-center border-t border-white/10">
        <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
        <p className="mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>MVP em validação — entre em contato para acesso antecipado</p>
        <Link href="/login" className="inline-block px-10 py-4 rounded-xl text-sm font-semibold text-sinergya-dark transition-all"
          style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)", boxShadow: "0 8px 30px rgba(79,191,159,0.3)" }}>
          Acessar plataforma
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-10 py-6 border-t border-white/10 flex items-center justify-between">
        <Image src="/logo.png" alt="Sinergya" width={100} height={28} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>© 2025 Sinergya · Dados protegidos (LGPD)</p>
      </footer>
    </main>
  );
}