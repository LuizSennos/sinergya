"use client";

import { useEffect } from "react";
import { getStoredUser } from "@/lib/api";

export default function HomePage() {
  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role === "admin") window.location.href = "/admin";
    else if (user.role === "paciente" || user.role === "responsavel") window.location.href = "/paciente";
    else window.location.href = "/patient/1";
  }, []);

  return (
    <div className="min-h-screen bg-sinergya-background flex items-center justify-center">
      <p className="text-slate-400 text-sm">Redirecionando...</p>
    </div>
  );
}