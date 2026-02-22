export default function ChatHeader() {
  return (
    <header className="flex items-center justify-between border-b pb-6">
      <div>
        <h1 className="text-xl font-semibold">
          João Silva
        </h1>
        <p className="text-sm text-slate-500">
          Psicologia • Fonoaudiologia
        </p>
      </div>

      <span className="inline-flex items-center gap-2 bg-sinergya-green/15 text-sinergya-green px-4 py-1.5 rounded-full text-sm font-medium">
        🔒 Dados protegidos (LGPD)
      </span>
    </header>
  );
}
