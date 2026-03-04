"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/SidePanel";
import { useAuth } from "@/context/AuthContext";
import { apiGetPatients } from "@/lib/api";

const PACIENTE_ROLES = ["paciente", "responsavel"];

interface Patient {
  id: string;
  name: string;
  specialties: string;
  is_minor: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);

  // Dentro de /patient/[id] no mobile o header é próprio da página — esconde o topbar do layout
  const isPatientPage = /^\/patient\/[^/]+/.test(pathname ?? "");

  // Escuta evento customizado disparado pelo header da página do paciente
  useEffect(() => {
    const handler = () => setShowSidebar(true);
    window.addEventListener("open-sidebar", handler);
    return () => window.removeEventListener("open-sidebar", handler);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/login");
      else if (PACIENTE_ROLES.includes(user.role)) router.replace("/paciente");
      else if (user.role === "admin") router.replace("/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !PACIENTE_ROLES.includes(user.role) && user.role !== "admin") {
      apiGetPatients()
        .then(setPatients)
        .catch(console.error)
        .finally(() => setPatientsLoading(false));
    }
  }, [user]);

  if (loading || !user || PACIENTE_ROLES.includes(user.role)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-sinergya-background">
        <div className="animate-pulse text-sinergya-muted text-sm">Validando acesso...</div>
      </div>
    );
  }

  return (
    <main className="flex h-screen bg-sinergya-background overflow-hidden">

      {/* Sidebar desktop */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar onNavigate={() => {}} patients={patients} patientsLoading={patientsLoading} />
      </div>

      {/* Overlay mobile */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-72 h-full shadow-2xl">
            <Sidebar onNavigate={() => setShowSidebar(false)} patients={patients} patientsLoading={patientsLoading} />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Conteúdo principal */}
      <section className="flex-1 flex flex-col overflow-hidden md:m-4 md:ml-0 md:rounded-2xl bg-white shadow-soft">

        {/* Topbar mobile — oculto em /patient/[id] pois a página tem header próprio */}
        {!isPatientPage && (
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-sinergya-dark text-white flex-shrink-0">
            <button onClick={() => setShowSidebar(true)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <img src="/logo.png" alt="Sinergya" className="h-7 object-contain" />
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </section>
    </main>
  );
}