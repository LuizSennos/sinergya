"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGetPatients } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Patient {
  id: string;
  name: string;
  specialties: string;
  is_minor: boolean;
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetPatients()
      .then(setPatients)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.specialties?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  function navigate(path: string) {
    router.push(path);
    onNavigate?.();
  }

  return (
    <aside className="w-72 h-full bg-sinergya-dark text-white md:rounded-2xl md:shadow-soft md:m-4 flex flex-col flex-shrink-0">
      <div className="px-4 py-5 flex justify-center border-b border-white/10">
        <Image src="/logo.png" alt="Sinergya" width={180} height={50} priority />
      </div>

      <div className="px-3 pt-3 pb-1">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full bg-white/5 text-white text-xs placeholder:text-white/30 pl-8 pr-3 py-2 rounded-lg outline-none focus:bg-white/10 transition"
          />
        </div>
      </div>

      <div className="px-6 py-3 text-xs font-semibold tracking-widest text-white/40 flex items-center justify-between">
        <span>PACIENTES</span>
        {patients.length > 0 && <span className="text-white/30">{filtered.length}/{patients.length}</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {loading && <div className="px-4 py-3 text-xs text-white/40">Carregando...</div>}
        {!loading && filtered.length === 0 && (
          <div className="px-4 py-3 text-xs text-white/40">
            {search ? "Nenhum resultado." : "Nenhum paciente vinculado."}
          </div>
        )}
        {filtered.map((p) => {
          const isActive = pathname === `/patient/${p.id}`;
          return (
            <button key={p.id} onClick={() => navigate(`/patient/${p.id}`)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all active:scale-95 ${
                isActive ? "bg-white/10 border-l-4 border-sinergya-green" : "hover:bg-white/5 border-l-4 border-transparent"
              }`}>
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm flex-1 truncate">{p.name}</p>
                {p.is_minor && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full flex-shrink-0">Menor</span>
                )}
              </div>
              <span className="text-xs text-white/50 truncate block">{p.specialties}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <button onClick={() => navigate("/perfil")}
            className="w-8 h-8 rounded-full bg-sinergya-green/30 flex items-center justify-center text-sinergya-green text-xs font-bold hover:bg-sinergya-green/50 transition flex-shrink-0"
            title="Ver perfil">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name ?? "Usuário"}</p>
            <p className="text-xs text-white/50 capitalize">{user?.role ?? ""}</p>
          </div>
          <button onClick={logout} className="text-white/30 hover:text-white/70 transition flex-shrink-0" title="Sair">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}