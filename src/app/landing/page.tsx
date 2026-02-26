import Link from "next/link";
import Image from "next/image";
import InstallPWA from "@/components/InstallPWA";

export default function LandingPage() {
  return (
    <main className="dark-page" style={{ minHeight: "100vh", background: "#0F172A", color: "#ffffff", overflow: "hidden" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-4 md:py-6 border-b border-white/10">
        <Image src="/logo.png" alt="Sinergya" width={130} height={36} priority />
        <div className="flex items-center gap-3 md:gap-6">
          <Link href="#funcionalidades" className="hidden md:block text-sm text-white/60 hover:text-white transition">Funcionalidades</Link>
          <Link href="#para-quem" className="hidden md:block text-sm text-white/60 hover:text-white transition">Para quem</Link>
          <Link href="/login"
            className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold text-sinergya-dark transition whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #4FBF9F, #63D2C6)" }}>
            Acessar
          </Link>
        </div>
      </nav>

      {/* Hero — fundo escuro #0F172A */}
      <section className="relative px-6 md:px-10 pt-14 md:pt-24 pb-20 md:pb-32 text-center overflow-hidden"
        style={{ background: "#0F172A" }}>
        <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[350px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #4FBF9F, #3A7BD5)" }} />

        <div className="relative">
          <span className="inline-block mb-5 px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold border border-sinergya-green/30 text-sinergya-green bg-sinergya-green/10 tracking-wider uppercase">
            Plataforma Multiprofissional de Saúde
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight max-w-4xl mx-auto">
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

          <p className="mt-5 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
            Comunicação organizada entre profissionais de saúde e pacientes. Grupos assistenciais, canal técnico privado, diário do paciente e muito mais.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 px-4 sm:px-0">
            <Link href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-sinergya-dark transition-all"
              style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)", boxShadow: "0 8px 30px rgba(79,191,159,0.3)" }}>
              Começar agora
            </Link>
            <Link href="#funcionalidades"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/20 hover:border-white/40 transition"
              style={{ color: "rgba(255,255,255,0.9)" }}>
              Ver funcionalidades
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            <span>🔒</span>
            <span>Dados protegidos conforme a LGPD</span>
          </div>
        </div>
      </section>

      {/* Features — seção mais clara para contrastar */}
      <section id="funcionalidades" className="px-5 md:px-10 py-16 md:py-24"
        style={{ background: "#162032" }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Tudo que sua equipe precisa</h2>
          <p className="text-center mb-10 md:mb-14 font-semibold text-sm md:text-base" style={{ color: "#F5C518" }}>
            Organizado, seguro e fácil de usar
          </p>

          {/* Mobile: 2 colunas compactas. Desktop: 3 colunas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
            {[
              { icon: "💬", title: "Grupo Assistencial", desc: "Mensagens entre equipe e paciente em um só lugar." },
              { icon: "🔒", title: "Grupo Técnico", desc: "Canal privado só para profissionais. Paciente não vê." },
              { icon: "📓", title: "Diário do Paciente", desc: "Paciente registra como está. Equipe acompanha." },
              { icon: "✅", title: "Tarefas", desc: "Profissionais criam tarefas com acompanhamento." },
              { icon: "👥", title: "Multiprofissional", desc: "Psicólogo, fono, fisio — todos na mesma plataforma." },
              { icon: "📊", title: "Auditoria", desc: "Todo registro tem autor, data e hora. Conformidade LGPD." },
            ].map((f) => (
              <div key={f.title}
                className="rounded-2xl p-4 md:p-6"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-2xl mb-2 md:mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-xs md:text-sm mb-1 text-white">{f.title}</h3>
                <p className="text-xs leading-relaxed hidden md:block" style={{ color: "rgba(255,255,255,0.72)" }}>{f.desc}</p>
                {/* Mobile: descrição mais curta */}
                <p className="text-xs leading-relaxed md:hidden" style={{ color: "rgba(255,255,255,0.65)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem — volta ao escuro original para alternar */}
      <section id="para-quem" className="px-5 md:px-10 py-16 md:py-24"
        style={{ background: "#0F172A" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Para quem é o Sinergya?</h2>
          <p className="mb-10 md:mb-14 font-semibold text-sm md:text-base" style={{ color: "#F5C518" }}>
            Duas versões para contextos diferentes
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-2xl p-6 md:p-8 text-left"
              style={{ border: "1px solid rgba(79,191,159,0.3)", background: "rgba(79,191,159,0.07)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-sinergya-green mb-3 block">Versão Universitária</span>
              <h3 className="text-lg md:text-xl font-bold mb-2">Clínicas Escola</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.78)" }}>
                Para universidades com atendimento supervisionado. Acadêmicos, supervisores e pacientes organizados em um ambiente educacional seguro.
              </p>
              <ul className="space-y-2 text-sm">
                {["Acadêmicos + Supervisor obrigatório", "Supervisão integrada ao fluxo", "Separação lógica por instituição", "Linguagem educacional"].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: "#F5C518", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-6 md:p-8 text-left"
              style={{ border: "1px solid rgba(58,123,213,0.3)", background: "rgba(58,123,213,0.07)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-sinergya-blue mb-3 block">Versão Profissional</span>
              <h3 className="text-lg md:text-xl font-bold mb-2">Clínicas e Consultórios</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.78)" }}>
                Para profissionais de saúde no mercado. Equipes multiprofissionais organizadas em torno do paciente, com comunicação clara e rastreável.
              </p>
              <ul className="space-y-2 text-sm">
                {["Profissionais autônomos ou em equipe", "Supervisor opcional", "Consentimento LGPD integrado", "Auditoria completa"].map(i => (
                  <li key={i} className="flex items-center gap-2">
                    <span style={{ color: "#F5C518", fontWeight: 700 }}>✓</span>
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — seção mais clara novamente */}
      <section className="px-5 md:px-10 py-16 md:py-24 text-center"
        style={{ background: "#162032", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Pronto para começar?</h2>
        <p className="mb-8 text-sm md:text-base" style={{ color: "rgba(255,255,255,0.6)" }}>
          MVP em validação — entre em contato para acesso antecipado
        </p>
        <Link href="/login"
          className="inline-block px-8 md:px-10 py-3.5 md:py-4 rounded-xl text-sm font-semibold text-sinergya-dark transition-all"
          style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)", boxShadow: "0 8px 30px rgba(79,191,159,0.3)" }}>
          Acessar plataforma
        </Link>
      </section>

      {/* Footer — escuro */}
      <footer className="px-5 md:px-10 py-5 flex items-center justify-between"
        style={{ background: "#0F172A", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Image src="/logo.png" alt="Sinergya" width={80} height={22} />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>© 2025 Sinergya · LGPD</p>
      </footer>

      {/* Barra de instalação PWA fixada no rodapé */}
      <InstallPWA />
    </main>
  );
}