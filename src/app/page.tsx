"use client";
import { useEffect } from "react";
import { getStoredUser, apiGetPatients } from "@/lib/api";

export default function HomePage() {
  useEffect(() => {
    const user = getStoredUser();
    if (!user) { window.location.href = "/landing"; return; }
    if (user.role === "admin") { window.location.href = "/admin"; return; }
    if (user.role === "paciente" || user.role === "responsavel") { window.location.href = "/paciente"; return; }
    apiGetPatients()
      .then(ps => {
        if (ps && ps.length > 0) window.location.href = `/patient/${ps[0].id}`;
        else window.location.href = "/sem-pacientes";
      })
      .catch(() => { window.location.href = "/landing"; });
  }, []);

  return (
    <div className="min-h-screen bg-sinergya-background flex items-center justify-center">
      <p className="text-slate-400 text-sm">Redirecionando...</p>
    </div>
  );
}
