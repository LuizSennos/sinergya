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
    throw new Error(error.detail || "Erro na requisição.");
  }
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const data = await request<{
    access_token: string; role: string; name: string;
    user_id: string; lgpd_consent: boolean;
  }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("role", data.role);
  localStorage.setItem("name", data.name);
  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("lgpd_consent", String(data.lgpd_consent));
  setCookie("token", data.access_token);
  setCookie("role", data.role);
  return data;
}

export function apiLogout() {
  ["token", "role", "name", "user_id", "lgpd_consent"].forEach(k => localStorage.removeItem(k));
  deleteCookie("token");
  deleteCookie("role");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    role: localStorage.getItem("role") || "",
    name: localStorage.getItem("name") || "",
    user_id: localStorage.getItem("user_id") || "",
    lgpd_consent: localStorage.getItem("lgpd_consent") === "true",
  };
}

export async function apiMe() { return request<any>("/users/me"); }

export async function apiLGPDConsent(consent: boolean) {
  const data = await request<any>("/users/lgpd-consent", {
    method: "POST", body: JSON.stringify({ consent }),
  });
  localStorage.setItem("lgpd_consent", String(consent));
  return data;
}

export async function apiCreateUser(data: {
  name: string; email: string; password: string; role: string;
  specialty?: string; council_number?: string; course?: string; institution?: string;
}) {
  return request("/users/", { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetPatients() { return request<any[]>("/patients/"); }
export async function apiGetPatient(id: string) { return request<any>(`/patients/${id}`); }
export async function apiCreatePatient(data: any) {
  return request("/patients/", { method: "POST", body: JSON.stringify(data) });
}

export async function apiGetMessages(patientId: string, context: "assistencial" | "tecnico") {
  return request<any[]>(`/messages/${patientId}?context=${context}`);
}
export async function apiSendMessage(patientId: string, context: "assistencial" | "tecnico", content: string) {
  return request("/messages/", { method: "POST", body: JSON.stringify({ patient_id: patientId, context, content }) });
}

export async function apiGetDiary(patientId: string) { return request<any[]>(`/diary/${patientId}`); }
export async function apiCreateDiaryEntry(patientId: string, content: string) {
  return request("/diary/", { method: "POST", body: JSON.stringify({ patient_id: patientId, content }) });
}

export async function apiGetTasks(patientId: string) { return request<any[]>(`/tasks/${patientId}`); }
export async function apiCreateTask(patientId: string, title: string, description?: string) {
  return request("/tasks/", { method: "POST", body: JSON.stringify({ patient_id: patientId, title, description }) });
}
export async function apiMarkTaskDone(taskId: string, isDone: boolean) {
  return request(`/tasks/${taskId}/done`, { method: "PATCH", body: JSON.stringify({ is_done: isDone }) });
}

export async function apiBindUserToPatient(patientId: string, userId: string) {
  return request("/groups/", { method: "POST", body: JSON.stringify({ patient_id: patientId, user_id: userId }) });
}

export async function apiAdminStats() { return request<any>("/admin/stats"); }
export async function apiAdminUsers() { return request<any[]>("/users"); }
export async function apiAdminLogs() { return request<any[]>("/admin/audit-logs"); }