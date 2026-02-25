"use client";
import { useAuth } from "@/context/AuthContext";

export default function SemPacientes() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-sinergya-background flex items-center justify-center">
      <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-slate-100 max-w-sm">
        <p className="text-4xl mb-4">👋</p>
        <h1 className="text-lg font-semibold text-sinergya-dark mb-2">Nenhum paciente vinculado</h1>
        <p className="text-sm text-slate-400 mb-6">Aguarde o administrador vincular você a um paciente para começar.</p>
        <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 underline">Sair</button>
      </div>
    </div>
  );
}