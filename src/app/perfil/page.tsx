"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiMe } from "@/lib/api";

export default function PerfilPage() {
  const { user, logout, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) { logout(); return; }
    apiMe()
      .then(setProfile)
      .catch(() => logout())
      .finally(() => setDataLoading(false));
  }, [loading]); // ← só [loading], não [user] — evita o loop

  if (loading || dataLoading) return <p>Carregando...</p>;
  if (!profile) return <p>Erro ao carregar perfil.</p>;

  return (
    <div>
      <h1>Olá, {profile.name}</h1>
      <p>Role: {profile.role}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}