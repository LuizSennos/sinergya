"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { mockPatients } from "@/data/mock";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-sinergya-dark text-white rounded-2xl shadow-soft m-4 flex flex-col flex-shrink-0">
      {/* LOGO */}
      <div className="px-4 py-5 flex justify-center border-b border-white/10">
        <Image src="/logo.png" alt="Sinergya" width={180} height={50} priority />
      </div>

      {/* TÍTULO */}
      <div className="px-6 py-4 text-xs font-semibold tracking-widest text-white/60">
        PACIENTES
      </div>

      {/* LISTA */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {mockPatients.map((p) => {
          const isActive = pathname === `/patient/${p.id}`;
          return (
            <button
              key={p.id}
              onClick={() => router.push(`/patient/${p.id}`)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-white/10 border-l-4 border-sinergya-green"
                  : "hover:bg-white/5 border-l-4 border-transparent"
              }`}
            >
              <p className="font-medium text-sm">{p.name}</p>
              <span className="text-xs text-white/60">{p.specialties}</span>
              {p.is_minor && (
                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">
                  Menor
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* RODAPÉ */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-sinergya-green/30 flex items-center justify-center text-sinergya-green text-xs font-bold">
            A
          </div>
          <div>
            <p className="text-xs font-medium text-white">Dra. Ana</p>
            <p className="text-xs text-white/50">Psicóloga</p>
          </div>
          <button className="ml-auto text-white/30 hover:text-white/70 transition">
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