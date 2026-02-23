const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro inesperado." }));
    throw new Error(error.detail);
  }

  return res.json();
}

/* ================= AUTH ================= */

export async function apiLogin(email: string, password: string) {
  const data = await request<{
    access_token: string;
    role: string;
    name: string;
    user_id: string;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("name", data.name);
  localStorage.setItem("user_id", data.user_id);

  setCookie("token", data.access_token);
  setCookie("role", data.role);

  return data;
}

export function apiLogout() {
  localStorage.clear();
  deleteCookie("token");
  deleteCookie("role");
}

/* ================= ADMIN ================= */

export const apiAdminStats = () => request<any>("/admin/stats");
export const apiAdminUsers = () => request<any[]>("/admin/users");
export const apiAdminLogs = () => request<any[]>("/admin/audit-logs");