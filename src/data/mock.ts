import { Patient, Message, DiaryEntry, Task } from "@/types";

export const mockPatients: Patient[] = [
  { id: "1", name: "João Silva", specialties: "Psicologia • Fonoaudiologia", is_minor: false, is_active: true },
  { id: "2", name: "Maria Costa", specialties: "Psicologia", is_minor: false, is_active: true },
  { id: "3", name: "Lucas Mendes", specialties: "Terapia Ocupacional • Fisioterapia", is_minor: true, is_active: true },
];

export const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", patient_id: "1", author_id: "u1", author_name: "Dra. Ana", author_role: "Psicóloga", context: "assistencial", content: "Paciente apresentou melhora significativa na comunicação verbal durante as últimas sessões.", created_at: "2025-02-19T10:00:00Z" },
    { id: "m2", patient_id: "1", author_id: "u2", author_name: "Dr. Carlos", author_role: "Fonoaudiólogo", context: "assistencial", content: "Exercícios de respiração estão sendo bem aceitos. Continuaremos na próxima semana.", created_at: "2025-02-19T14:00:00Z" },
    { id: "m3", patient_id: "1", author_id: "u3", author_name: "Sup. Fernanda", author_role: "Supervisora", context: "tecnico", content: "Equipe alinhada para integrar as abordagens. Próxima reunião técnica na sexta.", created_at: "2025-02-19T16:00:00Z" },
    { id: "m4", patient_id: "1", author_id: "u1", author_name: "Dra. Ana", author_role: "Psicóloga", context: "tecnico", content: "Registrar evolução clínica apenas após validação da equipe multidisciplinar.", created_at: "2025-02-19T17:00:00Z" },
  ],
  "2": [
    { id: "m5", patient_id: "2", author_id: "u1", author_name: "Dra. Ana", author_role: "Psicóloga", context: "assistencial", content: "Iniciamos trabalho focado em regulação emocional. Boa adesão ao processo.", created_at: "2025-02-18T10:00:00Z" },
  ],
};

export const mockDiary: Record<string, DiaryEntry[]> = {
  "1": [
    { id: "d1", patient_id: "1", author_id: "p1", content: "Hoje me senti mais tranquilo durante as atividades. Consegui fazer os exercícios de respiração.", created_at: "2025-02-19T08:00:00Z" },
    { id: "d2", patient_id: "1", author_id: "p1", content: "Tive dificuldade para dormir ontem, mas acordei disposto. A sessão de hoje foi cansativa mas boa.", created_at: "2025-02-18T09:00:00Z" },
  ],
};

export const mockTasks: Record<string, Task[]> = {
  "1": [
    { id: "t1", patient_id: "1", created_by_id: "u1", title: "Exercícios de respiração diafragmática", description: "Realizar 3 séries de 10 respirações pela manhã e à noite.", is_done: true, done_at: "2025-02-19T07:00:00Z", created_at: "2025-02-17T10:00:00Z" },
    { id: "t2", patient_id: "1", created_by_id: "u2", title: "Leitura em voz alta — 10 minutos", description: "Ler qualquer texto em voz alta por 10 minutos focando na dicção.", is_done: false, created_at: "2025-02-18T10:00:00Z" },
    { id: "t3", patient_id: "1", created_by_id: "u1", title: "Diário de emoções", description: "Anotar 3 emoções sentidas ao longo do dia.", is_done: false, created_at: "2025-02-19T10:00:00Z" },
  ],
};