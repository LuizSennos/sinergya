"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGetPatients } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const PACIENTE_ROLES = ["paciente", "responsavel"];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (PACIENTE_ROLES.includes(user.role)) { router.replace("/paciente"); return; }
    if (user.role === "admin") { router.replace("/admin"); return; }

    apiGetPatients()
      .then((patients) => {
        if (patients && patients.length > 0) {
          router.replace(`/patient/${patients[0].id}`);
        } else {
          router.replace("/sem-pacientes");
        }
      })
      .catch(() => router.replace("/login"));
  }, [user, loading, router]);

  return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sinergya-green"></div>
        <p className="text-slate-400 text-sm font-medium">Redirecionando...</p>
      </div>
    </div>
  );
}