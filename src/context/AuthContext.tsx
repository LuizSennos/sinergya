"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiLogout, getStoredUser } from "@/lib/api";

interface AuthUser {
  token: string;
  role: string;
  name: string;
  user_id: string;
  lgpd_consent: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function refreshUser() {
    const stored = getStoredUser();
    setUser(stored as AuthUser | null);
  }

  useEffect(() => {
    refreshUser();
    setLoading(false);
  }, []);

  function logout() {
    apiLogout();
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}