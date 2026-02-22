export type UserRole = "admin" | "academico" | "supervisor" | "profissional" | "paciente" | "responsavel";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  lgpd_consent: boolean;
  specialty?: string;
  course?: string;
  institution?: string;
}

export interface Patient {
  id: string;
  name: string;
  specialties: string;
  is_minor: boolean;
  is_active: boolean;
}

export type MessageContext = "assistencial" | "tecnico";

export interface Message {
  id: string;
  patient_id: string;
  author_id: string;
  author_name?: string;
  author_role?: string;
  context: MessageContext;
  content: string;
  created_at: string;
}

export interface DiaryEntry {
  id: string;
  patient_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface Task {
  id: string;
  patient_id: string;
  created_by_id: string;
  title: string;
  description?: string;
  is_done: boolean;
  done_at?: string;
  created_at: string;
}