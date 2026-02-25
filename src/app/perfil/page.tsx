"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { apiMe } from "@/lib/api";

export default function PerfilPage() {
  const { user, logout, loading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) { logout(); return; }
      // valida token
      refreshUser().then(() => setDataLoading(false)).catch(logout);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    apiMe()
      .then(setProfile)
      .finally(() => setDataLoading(false));
  }, [user]);

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