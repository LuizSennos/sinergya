const API_URL = process.env.NEXT_PUBLIC_API_URL!

function getToken() {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("token");
}
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}
function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    ["token", "role", "name", "user_id", "lgpd_consent"].forEach(k => sessionStorage.removeItem(k));
    deleteCookie("token");
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro inesperado." }));
    throw new Error(error.detail || "Erro na requisição.");
  }
  return res.json();
}

export async function apiLogin(email: string, password: string) {
  const data = await request<{ access_token: string; role: string; name: string; user_id: string; lgpd_consent: boolean; }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  sessionStorage.setItem("token", data.access_token);
  sessionStorage.setItem("role", data.role);
  sessionStorage.setItem("name", data.name);
  sessionStorage.setItem("user_id", data.user_id);
  sessionStorage.setItem("lgpd_consent", String(data.lgpd_consent));
  setCookie("token", data.access_token);
  return data;
}
export function apiLogout() {
  ["token", "role", "name", "user_id", "lgpd_consent"].forEach(k => sessionStorage.removeItem(k));
  deleteCookie("token");
}
export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    role: sessionStorage.getItem("role") || "",
    name: sessionStorage.getItem("name") || "",
    user_id: sessionStorage.getItem("user_id") || "",
    lgpd_consent: sessionStorage.getItem("lgpd_consent") === "true",
  };
}

export async function apiMe() { return request<any>("/users/me"); }
export async function apiLGPDConsent(consent: boolean) {
  const data = await request<any>("/users/lgpd-consent", { method: "POST", body: JSON.stringify({ consent }) });
  sessionStorage.setItem("lgpd_consent", String(consent));
  return data;
}
export async function apiCreateUser(data: { name: string; email: string; password: string; role: string; specialty?: string; council_number?: string; course?: string; institution?: string; }) {
  return request("/users/", { method: "POST", body: JSON.stringify(data) });
}
export async function apiToggleUserStatus(userId: string, isActive: boolean) {
  return request(`/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) });
}

// ── Pacientes ─────────────────────────────────────────────────────────────────
export async function apiGetPatients() { return request<any[]>("/patients/"); }
export async function apiAdminGetPatients() { return request<any[]>("/patients/admin-list"); }
export async function apiGetPatient(id: string) { return request<any>(`/patients/${id}`); }
export async function apiGetMyPatient() { return request<any>("/patients/me"); }
export async function apiCreatePatient(data: any) { return request("/patients/", { method: "POST", body: JSON.stringify(data) }); }
export async function apiBindPatientToUser(patientId: string, userId: string) {
  return request(`/patients/${patientId}/bind-user?user_id=${userId}`, { method: "PATCH" });
}

// ── Mensagens ─────────────────────────────────────────────────────────────────
export async function apiGetMessages(patientId: string, context: "assistencial" | "tecnico") {
  return request<any[]>(`/messages/${patientId}/${context}`);
}
export async function apiSendMessage(patientId: string, context: "assistencial" | "tecnico", content: string) {
  return request("/messages/", { method: "POST", body: JSON.stringify({ patient_id: patientId, context, content: content || null }) });
}
export async function apiUploadFile(file: File, patientId: string, group: string) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("patient_id", patientId);
  formData.append("group", group);
  const res = await fetch(`${API_URL}/upload/`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });
  if (res.status === 401) {
    ["token", "role", "name", "user_id", "lgpd_consent"].forEach(k => sessionStorage.removeItem(k));
    deleteCookie("token");
    window.location.href = "/login";
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erro no upload." }));
    throw new Error(error.detail || "Erro no upload.");
  }
  return res.json();
}
export async function apiSendMessageWithAttachment(
  patientId: string,
  context: "assistencial" | "tecnico",
  content: string,
  attachment: {
    url: string;
    storage_path: string;
    attachment_type: string;
    attachment_name: string;
    attachment_size: number;
    attachment_mime: string;
  }
) {
  return request("/messages/", {
    method: "POST",
    body: JSON.stringify({
      patient_id:              patientId,
      context,
      content:                 content || null,
      attachment_url:          attachment.url,
      attachment_storage_path: attachment.storage_path,
      attachment_type:         attachment.attachment_type,
      attachment_name:         attachment.attachment_name,
      attachment_size:         attachment.attachment_size,
      attachment_mime:         attachment.attachment_mime,
    }),
  });
}

// ── Diário ────────────────────────────────────────────────────────────────────
export async function apiGetDiary(patientId: string) { return request<any[]>(`/diary/${patientId}`); }
export async function apiCreateDiaryEntry(patientId: string, content: string) { return request("/diary/", { method: "POST", body: JSON.stringify({ patient_id: patientId, content }) }); }

// ── Tarefas ───────────────────────────────────────────────────────────────────
export async function apiGetTasks(patientId: string) { return request<any[]>(`/tasks/${patientId}`); }
export async function apiCreateTask(patientId: string, title: string, description?: string) { return request("/tasks/", { method: "POST", body: JSON.stringify({ patient_id: patientId, title, description }) }); }
export async function apiMarkTaskDone(taskId: string, isDone: boolean) { return request(`/tasks/${taskId}/done`, { method: "PATCH", body: JSON.stringify({ is_done: isDone }) }); }

// ── Grupos ────────────────────────────────────────────────────────────────────
export async function apiBindUserToPatient(patientId: string, userId: string) { return request("/groups/", { method: "POST", body: JSON.stringify({ patient_id: patientId, user_id: userId }) }); }

// ── Admin ─────────────────────────────────────────────────────────────────────
export async function apiAdminStats() { return request<any>("/admin/stats"); }
export async function apiAdminUsers() { return request<any[]>("/users/"); }
export async function apiAdminLogs() { return request<any[]>("/admin/audit-logs"); }

// ── Upload / URL assinada ─────────────────────────────────────────────────────
export async function apiGetSignedUrl(storagePath: string, patientId: string) {
  return request<{ url: string }>(
    `/upload/signed-url?storage_path=${encodeURIComponent(storagePath)}&patient_id=${encodeURIComponent(patientId)}`
  );
}

export async function apiUpdatePreferences(prefs: { wallpaper?: string }) {
  return request("/users/me/preferences", {
    method: "PATCH",
    body: JSON.stringify(prefs),
  });
}